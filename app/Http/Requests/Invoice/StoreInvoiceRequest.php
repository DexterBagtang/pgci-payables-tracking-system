<?php

namespace App\Http\Requests\Invoice;

use App\Models\Invoice;
use App\Models\PurchaseOrder;
use App\Models\Vendor;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreInvoiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', Invoice::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'invoices' => 'required|array|min:1',

            // Invoice type determines which fields are required
            'invoices.*.invoice_type' => 'required|in:purchase_order,direct',

            // Conditional validation based on invoice type
            'invoices.*.purchase_order_id' => [
                'nullable',
                'exists:purchase_orders,id',
                'required_if:invoices.*.invoice_type,purchase_order'
            ],

            'invoices.*.vendor_id' => [
                'nullable',
                'exists:vendors,id',
                'required_if:invoices.*.invoice_type,direct'
            ],

            'invoices.*.project_id' => [
                'nullable',
                'exists:projects,id',
                'required_if:invoices.*.invoice_type,direct'
            ],

            'invoices.*.si_number' => 'required|string|max:255',
            'invoices.*.si_date' => 'required|date',
            'invoices.*.si_received_at' => 'required|date',
            'invoices.*.invoice_amount' => 'required|numeric|min:0',
            'invoices.*.currency' => 'nullable|in:PHP,USD',
            'invoices.*.tax_amount' => 'nullable|numeric|min:0',
            'invoices.*.discount_amount' => 'nullable|numeric|min:0',
            'invoices.*.terms_of_payment' => 'required|string',
            'invoices.*.other_payment_terms' => 'nullable|string',
            'invoices.*.due_date' => 'nullable|date',
            'invoices.*.notes' => 'nullable|string',
            'invoices.*.submitted_at' => 'nullable|date',
            'invoices.*.submitted_to' => 'nullable|string|max:255',
            'invoices.*.files' => 'nullable|array',
            'invoices.*.files.*' => 'file|max:20480|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'invoices.required' => 'At least one invoice is required.',
            'invoices.*.invoice_type.required' => 'Invoice type is required for each invoice.',
            'invoices.*.invoice_type.in' => 'Invoice type must be either purchase_order or direct.',
            'invoices.*.purchase_order_id.required_if' => 'Purchase order is required for purchase order invoices.',
            'invoices.*.purchase_order_id.exists' => 'Selected purchase order does not exist.',
            'invoices.*.vendor_id.required_if' => 'Vendor is required for direct invoices.',
            'invoices.*.vendor_id.exists' => 'Selected vendor does not exist.',
            'invoices.*.project_id.required_if' => 'Project is required for direct invoices.',
            'invoices.*.project_id.exists' => 'Selected project does not exist.',
            'invoices.*.si_number.required' => 'SI number is required for each invoice.',
            'invoices.*.si_date.required' => 'SI date is required for each invoice.',
            'invoices.*.si_received_at.required' => 'SI received date is required for each invoice.',
            'invoices.*.invoice_amount.required' => 'Invoice amount is required for each invoice.',
            'invoices.*.invoice_amount.min' => 'Invoice amount must be at least 0.',
            'invoices.*.currency.in' => 'Currency must be either PHP or USD.',
            'invoices.*.terms_of_payment.required' => 'Payment terms are required for each invoice.',
            'invoices.*.files.*.max' => 'Each file must not exceed 20MB.',
            'invoices.*.files.*.mimes' => 'Files must be of type: pdf, doc, docx, xls, xlsx, jpg, jpeg, png.',
        ];
    }

    /**
     * Configure the validator instance.
     *
     * Validates business rules:
     * - SI number must be unique per vendor (across both invoice types)
     * - Invoice currency must match PO currency (for PO-based invoices)
     * - Mutual exclusivity: either PO OR vendor+project required
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $invoicesData = $this->input('invoices', []);

            foreach ($invoicesData as $index => $invoice) {
                $type = $invoice['invoice_type'] ?? 'purchase_order';

                // Validate mutual exclusivity
                if ($type === 'purchase_order' && ($invoice['vendor_id'] ?? null)) {
                    $validator->errors()->add(
                        "invoices.{$index}.vendor_id",
                        "Purchase order invoices cannot have direct vendor/project."
                    );
                }

                if ($type === 'direct' && ($invoice['purchase_order_id'] ?? null)) {
                    $validator->errors()->add(
                        "invoices.{$index}.purchase_order_id",
                        "Direct invoices cannot have purchase order."
                    );
                }

                // Get vendor_id for SI number uniqueness check
                if ($type === 'purchase_order') {
                    $purchaseOrder = PurchaseOrder::find($invoice['purchase_order_id'] ?? null);
                    $vendorId = $purchaseOrder?->vendor_id;
                } else {
                    $vendorId = $invoice['vendor_id'] ?? null;
                }

                // Check duplicate SI number per vendor (across BOTH invoice types)
                if ($vendorId && isset($invoice['si_number'])) {
                    $exists = Invoice::where(function($q) use ($vendorId) {
                        $q->where('vendor_id', $vendorId)
                          ->orWhereHas('purchaseOrder', fn($q) => $q->where('vendor_id', $vendorId));
                    })
                    ->where('si_number', $invoice['si_number'])
                    ->exists();

                    if ($exists) {
                        $vendorName = Vendor::find($vendorId)?->name ?? 'this vendor';
                        $validator->errors()->add(
                            "invoices.{$index}.si_number",
                            "The SI number '{$invoice['si_number']}' already exists for {$vendorName}. Duplicate invoices from the same vendor are not allowed."
                        );
                    }
                }

                // Currency validation only for PO-based invoices
                if ($type === 'purchase_order') {
                    $purchaseOrder = PurchaseOrder::find($invoice['purchase_order_id'] ?? null);
                    if ($purchaseOrder) {
                        $invoiceCurrency = $invoice['currency'] ?? 'PHP';
                        $poCurrency = $purchaseOrder->currency ?? 'PHP';

                        if ($invoiceCurrency !== $poCurrency) {
                            $validator->errors()->add(
                                "invoices.{$index}.currency",
                                "Invoice currency ({$invoiceCurrency}) must match the Purchase Order currency ({$poCurrency})."
                            );
                        }
                    }
                }
            }
        });
    }

    /**
     * Handle a failed authorization attempt.
     */
    protected function failedAuthorization()
    {
        abort(403, 'You do not have permission to create invoices.');
    }
}
