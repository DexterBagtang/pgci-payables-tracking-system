<?php

namespace App\Http\Requests\Project;

use App\Models\Project;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', Project::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'project_title' => 'required|string|max:255',
            'cer_number' => 'required|string|max:255|unique:projects,cer_number',
            'total_project_cost' => 'nullable|numeric|min:0',
            'total_contract_cost' => 'nullable|numeric|min:0',
            'project_status' => 'nullable|in:active,on_hold,completed,cancelled',
            'description' => 'nullable|string|max:1000',
            'project_type' => 'nullable|in:sm_project,philcom_project',
            'smpo_number' => 'required_if:project_type,sm_project|nullable|string|max:255',
            'philcom_category' => 'required_if:project_type,philcom_project|nullable|in:profit_and_loss,capital_expenditure,others',
            'team' => 'required_if:project_type,philcom_project',
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
            'project_title.required' => 'Project title is required.',
            'project_title.max' => 'Project title cannot exceed 255 characters.',
            'cer_number.required' => 'CER number is required.',
            'cer_number.unique' => 'A project with this CER number already exists.',
            'cer_number.max' => 'CER number cannot exceed 255 characters.',
            'total_project_cost.numeric' => 'Total project cost must be a valid number.',
            'total_project_cost.min' => 'Total project cost cannot be negative.',
            'total_contract_cost.numeric' => 'Total contract cost must be a valid number.',
            'total_contract_cost.min' => 'Total contract cost cannot be negative.',
            'project_status.in' => 'Invalid project status selected.',
            'project_type.in' => 'Invalid project type selected.',
            'smpo_number.required_if' => 'SMPO number is required for SM projects.',
            'philcom_category.required_if' => 'Philcom category is required for Philcom projects.',
            'philcom_category.in' => 'Invalid Philcom category selected.',
            'team.required_if' => 'Team is required for Philcom projects.',
            'description.max' => 'Description cannot exceed 1000 characters.',
        ];
    }

    /**
     * Handle a failed authorization attempt.
     */
    protected function failedAuthorization(): void
    {
        throw new AuthorizationException('You do not have permission to create projects.');
    }
}
