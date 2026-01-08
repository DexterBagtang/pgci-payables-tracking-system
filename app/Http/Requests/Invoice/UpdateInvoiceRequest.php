<?php

namespace App\Http\Requests\Invoice;

use App\Models\Invoice;
use App\Models\PurchaseOrder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateInvoiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Delegates to InvoicePolicy which checks:
     * - User has write permission for invoices module
     * - Invoice is in editable state (pending or rejected only)
     * - Once payables marks as received, invoice is locked from editing
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('invoice'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'purchase_order_id' => 'required|exists:purchase_orders,id',
            'si_number' => 'required|string|max:255',
            'si_date' => 'required|date',
            'si_received_at' => 'nullable|date',
            'invoice_amount' => 'required|numeric|min:0',
            'currency' => 'nullable|in:PHP,USD',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'submitted_at' => 'nullable|date',
            'submitted_to' => 'nullable|string|max:255',
            'files.*' => 'file|max:20480|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png,txt',
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
            'purchase_order_id.required' => 'Purchase order is required.',
            'purchase_order_id.exists' => 'Selected purchase order does not exist.',
            'si_number.required' => 'SI number is required.',
            'si_number.max' => 'SI number must not exceed 255 characters.',
            'si_date.required' => 'SI date is required.',
            'si_date.date' => 'SI date must be a valid date.',
            'invoice_amount.required' => 'Invoice amount is required.',
            'invoice_amount.min' => 'Invoice amount must be at least 0.',
            'currency.in' => 'Currency must be either PHP or USD.',
            'files.*.max' => 'Each file must not exceed 20MB.',
            'files.*.mimes' => 'Files must be of type: pdf, doc, docx, xls, xlsx, jpg, jpeg, png, txt.',
        ];
    }

    /**
     * Configure the validator instance.
     *
     * Validates business rules:
     * - SI number must be unique per vendor (excluding current invoice)
     * - Invoice currency must match PO currency
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $invoice = $this->route('invoice');

            // Check for duplicate SI number from the same vendor
            $purchaseOrder = PurchaseOrder::find($this->purchase_order_id);

            if ($purchaseOrder) {
                $duplicateExists = Invoice::whereHas('purchaseOrder', function ($q) use ($purchaseOrder) {
                    $q->where('vendor_id', $purchaseOrder->vendor_id);
                })
                ->where('si_number', $this->si_number)
                ->where('id', '!=', $invoice->id)
                ->exists();

                if ($duplicateExists) {
                    $vendorName = $purchaseOrder->vendor->name ?? 'this vendor';
                    $validator->errors()->add(
                        'si_number',
                        "The SI number '{$this->si_number}' already exists for {$vendorName}. Duplicate invoices from the same vendor are not allowed."
                    );
                }

                // Check if invoice currency matches PO currency
                $invoiceCurrency = $this->currency ?? 'PHP';
                $poCurrency = $purchaseOrder->currency ?? 'PHP';

                if ($invoiceCurrency !== $poCurrency) {
                    $validator->errors()->add(
                        'currency',
                        "Invoice currency ({$invoiceCurrency}) must match the Purchase Order currency ({$poCurrency})."
                    );
                }
            }
        });
    }

    /**
     * Handle a failed authorization attempt.
     *
     * Returns detailed error message from policy
     */
    protected function failedAuthorization()
    {
        $invoice = $this->route('invoice');

        abort(response()->json([
            'message' => "Cannot edit invoice in '{$invoice->invoice_status}' status.",
            'current_status' => $invoice->invoice_status,
            'allowed_statuses' => ['pending', 'rejected'],
            'help' => 'Invoices can only be edited when status is: pending or rejected. Once marked as received, invoices are locked from editing.'
        ], 403));
    }
}
