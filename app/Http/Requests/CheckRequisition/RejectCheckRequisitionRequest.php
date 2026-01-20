<?php

namespace App\Http\Requests\CheckRequisition;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

class RejectCheckRequisitionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Delegates to CheckRequisitionPolicy which checks:
     * - User has write permission for check_requisitions module
     * - Check requisition is in pending_approval status
     */
    public function authorize(): bool
    {
        return $this->user()->can('reject', $this->route('check_requisition'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'rejection_reason' => 'required|string|max:1000',
            'notes' => 'nullable|string|max:1000',
            'rejection_document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240', // 10MB
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
            'rejection_reason.required' => 'Rejection reason is required.',
            'rejection_reason.max' => 'Rejection reason cannot exceed 1000 characters.',
            'notes.max' => 'Notes cannot exceed 1000 characters.',
            'rejection_document.file' => 'Rejection document must be a valid file.',
            'rejection_document.mimes' => 'Rejection document must be a PDF, JPG, JPEG, or PNG file.',
            'rejection_document.max' => 'Rejection document size cannot exceed 10MB.',
        ];
    }

    /**
     * Handle a failed authorization attempt.
     */
    protected function failedAuthorization(): void
    {
        $checkRequisition = $this->route('check_requisition');

        throw new AuthorizationException(
            "Cannot reject check requisition in '{$checkRequisition->requisition_status}' status. " .
            "Only pending approval check requisitions can be rejected."
        );
    }
}
