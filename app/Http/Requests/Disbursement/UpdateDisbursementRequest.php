<?php

namespace App\Http\Requests\Disbursement;

use App\Models\CheckRequisition;
use App\Models\Disbursement;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateDisbursementRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Delegates to DisbursementPolicy which checks:
     * - User has write permission for disbursements module
     * - Disbursement is in editable state (check not released to vendor)
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('disbursement'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Get disbursement ID from route (can be 'disbursement' or 'id' parameter)
        $disbursement = $this->route('disbursement');
        $disbursementId = is_object($disbursement) ? $disbursement->id : $disbursement;

        return [
            'check_voucher_number' => 'nullable|string|unique:disbursements,check_voucher_number,' . $disbursementId,
            'date_check_scheduled' => 'nullable|date',
            'date_check_released_to_vendor' => 'nullable|date',
            'date_check_printing' => 'nullable|date',
            'remarks' => 'nullable|string',
            'check_requisition_ids' => 'required|array|min:1',
            'check_requisition_ids.*' => 'exists:check_requisitions,id',
            'files' => 'nullable|array',
            'files.*' => 'file|mimes:pdf,jpg,jpeg,png|max:10240', // 10MB max per file
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
            'check_voucher_number.unique' => 'This check voucher number already exists.',
            'date_check_scheduled.date' => 'Scheduled date must be a valid date.',
            'date_check_released_to_vendor.date' => 'Release date must be a valid date.',
            'date_check_printing.date' => 'Printing date must be a valid date.',
            'check_requisition_ids.required' => 'At least one check requisition must be selected.',
            'check_requisition_ids.min' => 'At least one check requisition must be selected.',
            'check_requisition_ids.*.exists' => 'Selected check requisition does not exist.',
            'files.*.mimes' => 'Files must be of type: pdf, jpg, jpeg, png.',
            'files.*.max' => 'Each file must not exceed 10MB.',
        ];
    }

    /**
     * Configure the validator instance.
     *
     * Validates business rules:
     * - Newly added check requisitions must be in 'approved' status
     * - Current check requisitions may be in 'processed' status (already linked)
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            if ($this->has('check_requisition_ids')) {
                $disbursement = $this->route('disbursement');

                // Get disbursement model if we received an ID
                if (!is_object($disbursement)) {
                    $disbursement = Disbursement::find($disbursement);
                }

                if ($disbursement) {
                    $currentCheckReqIds = $disbursement->checkRequisitions()->pluck('check_requisitions.id')->toArray();
                    $newCheckReqIds = array_diff($this->check_requisition_ids, $currentCheckReqIds);

                    // Only validate NEW check requisitions (not currently linked)
                    if (!empty($newCheckReqIds)) {
                        $newCheckRequisitions = CheckRequisition::whereIn('id', $newCheckReqIds)->get();

                        // Check for non-approved status
                        $notApproved = $newCheckRequisitions->filter(function ($cr) {
                            return $cr->requisition_status !== 'approved';
                        });

                        if ($notApproved->isNotEmpty()) {
                            $invalidCRs = $notApproved->map(function ($cr) {
                                return "CR #{$cr->requisition_number} (status: {$cr->requisition_status})";
                            })->implode(', ');

                            $validator->errors()->add(
                                'check_requisition_ids',
                                'Newly added check requisitions must be in approved status. ' .
                                'Invalid check requisitions: ' . $invalidCRs
                            );
                        }
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
        $disbursement = $this->route('disbursement');

        // Get disbursement model if we received an ID
        if (!is_object($disbursement)) {
            $disbursement = Disbursement::find($disbursement);
        }

        if ($disbursement && $disbursement->date_check_released_to_vendor) {
            abort(response()->json([
                'message' => 'Cannot edit disbursement. Check has already been released to vendor.',
                'release_date' => $disbursement->date_check_released_to_vendor->format('Y-m-d'),
                'help' => 'Disbursements cannot be edited once the check has been released to the vendor. This is a final state.'
            ], 403));
        }

        abort(403, 'You do not have permission to edit this disbursement.');
    }
}
