<?php

namespace App\Http\Requests\Disbursement;

use App\Models\Disbursement;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class BulkReleaseDisbursementRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->canWrite('disbursements');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'disbursement_ids' => 'required|array|min:1',
            'disbursement_ids.*' => 'exists:disbursements,id',
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
            'disbursement_ids.required' => 'At least one disbursement must be selected.',
            'disbursement_ids.min' => 'At least one disbursement must be selected.',
            'disbursement_ids.*.exists' => 'One or more selected disbursements are invalid.',
            'date_check_released_to_vendor.required' => 'Release date is required.',
            'date_check_released_to_vendor.date' => 'Release date must be a valid date.',
            'release_notes.max' => 'Release notes cannot exceed 500 characters.',
        ];
    }

    /**
     * Configure the validator instance.
     *
     * Validates business rule:
     * - Selected disbursements must not already be released
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            if ($this->has('disbursement_ids')) {
                $disbursements = Disbursement::whereIn('id', $this->disbursement_ids)->get();

                // Check for already released disbursements
                $alreadyReleased = $disbursements->filter(function ($disbursement) {
                    return $disbursement->date_check_released_to_vendor !== null;
                });

                if ($alreadyReleased->isNotEmpty()) {
                    $releasedList = $alreadyReleased->map(function ($disbursement) {
                        return "CV #{$disbursement->check_voucher_number} (released: {$disbursement->date_check_released_to_vendor->format('Y-m-d')})";
                    })->implode(', ');

                    $validator->errors()->add(
                        'disbursement_ids',
                        'Some disbursements are already released and cannot be released again. ' .
                        'Already released: ' . $releasedList
                    );
                }
            }
        });
    }

    /**
     * Handle a failed authorization attempt.
     */
    protected function failedAuthorization(): void
    {
        throw new AuthorizationException('You do not have permission to release disbursements.');
    }
}
