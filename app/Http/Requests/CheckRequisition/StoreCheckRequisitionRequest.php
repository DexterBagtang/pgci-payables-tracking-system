<?php

namespace App\Http\Requests\CheckRequisition;

use App\Models\CheckRequisition;
use App\Models\Invoice;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreCheckRequisitionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', CheckRequisition::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'request_date' => 'required|date',
            'payee_name' => 'required|string',
            'purpose' => 'required|string',
            'po_number' => 'required|string',
            'cer_number' => 'nullable|string',
            'si_number' => 'required|string',
            'account_charge' => 'nullable|string',
            'service_line_dist' => 'nullable|string',
            'php_amount' => 'required|numeric|min:0',
            'usd_amount' => 'nullable|numeric|min:0',
            'currency' => 'required|in:PHP,USD,MIXED',
            'requested_by' => 'required|string',
            'reviewed_by' => 'nullable|string',
            'approved_by' => 'nullable|string',
            'amount_in_words' => 'required|string',
            'invoice_ids' => 'required|array|min:1',
            'invoice_ids.*' => 'exists:invoices,id'
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
            'request_date.required' => 'Request date is required.',
            'payee_name.required' => 'Payee name is required.',
            'purpose.required' => 'Purpose is required.',
            'po_number.required' => 'PO number is required.',
            'si_number.required' => 'SI number is required.',
            'php_amount.required' => 'Amount is required.',
            'php_amount.min' => 'Amount must be at least 0.',
            'requested_by.required' => 'Requested by field is required.',
            'amount_in_words.required' => 'Amount in words is required.',
            'invoice_ids.required' => 'At least one invoice must be selected.',
            'invoice_ids.min' => 'At least one invoice must be selected.',
            'invoice_ids.*.exists' => 'Selected invoice does not exist.',
        ];
    }

    /**
     * Configure the validator instance.
     *
     * Validates business rules:
     * - All selected invoices must be in 'approved' status
     * - All selected invoices must have the same currency
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            // Check all invoices are in 'approved' status
            if ($this->has('invoice_ids')) {
                $invoices = Invoice::whereIn('id', $this->invoice_ids)->get();

                $notApproved = $invoices->filter(function ($invoice) {
                    return $invoice->invoice_status !== 'approved';
                });

                if ($notApproved->isNotEmpty()) {
                    $invalidInvoices = $notApproved->map(function ($invoice) {
                        return "SI #{$invoice->si_number} (status: {$invoice->invoice_status})";
                    })->implode(', ');

                    $validator->errors()->add(
                        'invoice_ids',
                        'All invoices must be approved before creating a check requisition. ' .
                        'Invalid invoices: ' . $invalidInvoices
                    );
                }

                // Check all invoices have the same currency
                $currencies = $invoices->pluck('currency')->unique();
                if ($currencies->count() > 1) {
                    $invoiceDetails = $invoices->map(function ($invoice) {
                        return "SI #{$invoice->si_number} ({$invoice->currency})";
                    })->implode(', ');

                    $validator->errors()->add(
                        'invoice_ids',
                        'All invoices must have the same currency. ' .
                        'Mixed currencies found: ' . $invoiceDetails
                    );
                }
            }
        });
    }

    /**
     * Handle a failed authorization attempt.
     */
    protected function failedAuthorization()
    {
        abort(403, 'You do not have permission to create check requisitions.');
    }
}
