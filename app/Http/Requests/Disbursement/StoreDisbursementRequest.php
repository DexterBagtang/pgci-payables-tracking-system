<?php

namespace App\Http\Requests\Disbursement;

use App\Models\CheckRequisition;
use App\Models\Disbursement;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreDisbursementRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', Disbursement::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'check_voucher_number' => 'nullable|string|unique:disbursements,check_voucher_number',
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
     * Validates business rule:
     * - All selected check requisitions must be in 'approved' status
     * - Check requisitions must not be already linked to another disbursement
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            // Check all check requisitions are in 'approved' status
            if ($this->has('check_requisition_ids')) {
                $checkRequisitions = CheckRequisition::whereIn('id', $this->check_requisition_ids)->get();

                // Check for non-approved status
                $notApproved = $checkRequisitions->filter(function ($cr) {
                    return $cr->requisition_status !== 'approved';
                });

                if ($notApproved->isNotEmpty()) {
                    $invalidCRs = $notApproved->map(function ($cr) {
                        return "CR #{$cr->requisition_number} (status: {$cr->requisition_status})";
                    })->implode(', ');

                    $validator->errors()->add(
                        'check_requisition_ids',
                        'All check requisitions must be approved before creating a disbursement. ' .
                        'Invalid check requisitions: ' . $invalidCRs
                    );
                }

                // Check for already disbursed check requisitions
                $alreadyDisbursed = $checkRequisitions->filter(function ($cr) {
                    return in_array($cr->requisition_status, ['processed', 'paid']);
                });

                if ($alreadyDisbursed->isNotEmpty()) {
                    $disbursedCRs = $alreadyDisbursed->map(function ($cr) {
                        return "CR #{$cr->requisition_number} (status: {$cr->requisition_status})";
                    })->implode(', ');

                    $validator->errors()->add(
                        'check_requisition_ids',
                        'Some check requisitions are already disbursed. ' .
                        'Already disbursed: ' . $disbursedCRs
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
        abort(403, 'You do not have permission to create disbursements.');
    }
}
