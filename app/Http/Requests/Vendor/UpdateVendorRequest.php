<?php

namespace App\Http\Requests\Vendor;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVendorRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('vendor'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $vendorId = $this->route('vendor')->id;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('vendors', 'name')->ignore($vendorId),
            ],
            'contact_person' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:1000',
            'category' => 'required|in:SAP,Manual',
            'payment_terms' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
            'notes' => 'nullable|string|max:1000',
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
            'name.required' => 'Vendor name is required.',
            'name.unique' => 'A vendor with this name already exists.',
            'name.max' => 'Vendor name cannot exceed 255 characters.',
            'email.email' => 'Please provide a valid email address.',
            'category.required' => 'Vendor category is required.',
            'category.in' => 'Vendor category must be either SAP or Manual.',
            'address.max' => 'Address cannot exceed 1000 characters.',
            'notes.max' => 'Notes cannot exceed 1000 characters.',
        ];
    }

    /**
     * Handle a failed authorization attempt.
     */
    protected function failedAuthorization(): void
    {
        throw new AuthorizationException('You do not have permission to update vendors.');
    }
}
