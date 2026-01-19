<?php

namespace App\Http\Requests\Disbursement;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

class QuickReleaseDisbursementRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Delegates to DisbursementPolicy which checks:
     * - User has write permission for disbursements module
     * - Disbursement is not already released
     */
    public function authorize(): bool
    {
        return $this->user()->can('releaseCheck', $this->route('disbursement'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'date_check_released_to_vendor' => 'required|date',
            'release_notes' => 'nullable|string|max:500',
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
            'date_check_released_to_vendor.required' => 'Release date is required.',
            'date_check_released_to_vendor.date' => 'Release date must be a valid date.',
            'release_notes.max' => 'Release notes cannot exceed 500 characters.',
        ];
    }

    /**
     * Handle a failed authorization attempt.
     */
    protected function failedAuthorization(): void
    {
        $disbursement = $this->route('disbursement');

        if ($disbursement && $disbursement->date_check_released_to_vendor) {
            throw new AuthorizationException(
                'Check has already been released to vendor on ' .
                $disbursement->date_check_released_to_vendor->format('Y-m-d') . '. ' .
                'Cannot release again.'
            );
        }

        throw new AuthorizationException('You do not have permission to release checks.');
    }
}
