<?php

namespace App\Http\Requests\CheckRequisition;

use App\Models\CheckRequisition;
use App\Models\Invoice;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateCheckRequisitionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Delegates to CheckRequisitionPolicy which checks:
     * - User has write permission for check_requisitions module
     * - Check requisition is in editable state (pending_approval or draft, not approved/processed/paid)
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('checkRequisition'));
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
     * Validates business rule:
     * - Newly added invoices must be in 'approved' status
     * - Current invoices may be in 'pending_disbursement' status (already linked)
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            // Check all invoices are in valid status for linking
            if ($this->has('invoice_ids')) {
                $checkRequisition = $this->route('checkRequisition');
                $currentInvoiceIds = $checkRequisition->invoices()->pluck('invoices.id')->toArray();
                $newInvoiceIds = array_diff($this->invoice_ids, $currentInvoiceIds);

                // Only validate NEW invoices (not currently linked)
                if (!empty($newInvoiceIds)) {
                    $newInvoices = Invoice::whereIn('id', $newInvoiceIds)->get();

                    $notApproved = $newInvoices->filter(function ($invoice) {
                        return $invoice->invoice_status !== 'approved';
                    });

                    if ($notApproved->isNotEmpty()) {
                        $invalidInvoices = $notApproved->map(function ($invoice) {
                            return "SI #{$invoice->si_number} (status: {$invoice->invoice_status})";
                        })->implode(', ');

                        $validator->errors()->add(
                            'invoice_ids',
                            'Newly added invoices must be in approved status. ' .
                            'Invalid invoices: ' . $invalidInvoices
                        );
                    }
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
        $checkRequisition = $this->route('checkRequisition');

        abort(response()->json([
            'message' => "Cannot edit check requisition in '{$checkRequisition->requisition_status}' status.",
            'current_status' => $checkRequisition->requisition_status,
            'allowed_statuses' => ['draft', 'pending_approval'],
            'help' => 'Check requisitions can only be edited when status is: pending_approval or draft.'
        ], 403));
    }
}
