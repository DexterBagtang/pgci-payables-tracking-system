<?php

namespace App\Http\Requests\Project;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('project'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $projectId = $this->route('project')->id;

        return [
            'project_title' => 'required|string|max:255',
            'cer_number' => [
                'required',
                'string',
                'max:255',
                Rule::unique('projects', 'cer_number')->ignore($projectId),
            ],
            'total_project_cost' => 'required|numeric|min:0.01',
            'total_contract_cost' => 'required_if:project_type,sm_project|nullable|numeric|min:0',
            'project_type' => 'required|in:sm_project,philcom_project',
            'project_status' => 'nullable|in:active,on_hold,completed,cancelled',
            'smpo_number' => 'required_if:project_type,sm_project|nullable|string|max:255',
            'philcom_category' => 'required_if:project_type,philcom_project|nullable|in:profit_and_loss,capital_expenditure,others',
            'team' => 'required_if:project_type,philcom_project',
            'description' => 'nullable|string|max:1000',
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
            'total_project_cost.required' => 'Total project cost is required.',
            'total_project_cost.numeric' => 'Total project cost must be a valid number.',
            'total_project_cost.min' => 'Total project cost must be at least 0.01.',
            'total_contract_cost.required_if' => 'Total contract cost is required for SM projects.',
            'total_contract_cost.numeric' => 'Total contract cost must be a valid number.',
            'total_contract_cost.min' => 'Total contract cost cannot be negative.',
            'project_type.required' => 'Project type is required.',
            'project_type.in' => 'Invalid project type selected.',
            'project_status.in' => 'Invalid project status selected.',
            'smpo_number.required_if' => 'SMPO number is required for SM projects.',
            'smpo_number.max' => 'SMPO number cannot exceed 255 characters.',
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
        throw new AuthorizationException('You do not have permission to update projects.');
    }
}
