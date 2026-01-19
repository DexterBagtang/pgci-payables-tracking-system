<?php

namespace App\Http\Requests\CheckRequisition;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

class ApproveCheckRequisitionRequest extends FormRequest
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
        return $this->user()->can('approve', $this->route('checkRequisition'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'notes' => 'nullable|string|max:1000',
            'approval_document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240', // 10MB
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
            'notes.max' => 'Notes cannot exceed 1000 characters.',
            'approval_document.file' => 'Approval document must be a valid file.',
            'approval_document.mimes' => 'Approval document must be a PDF, JPG, JPEG, or PNG file.',
            'approval_document.max' => 'Approval document size cannot exceed 10MB.',
        ];
    }

    /**
     * Handle a failed authorization attempt.
     */
    protected function failedAuthorization(): void
    {
        $checkRequisition = $this->route('checkRequisition');

        throw new AuthorizationException(
            "Cannot approve check requisition in '{$checkRequisition->requisition_status}' status. " .
            "Only pending approval check requisitions can be approved."
        );
    }
}
