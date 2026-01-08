<?php

namespace App\Http\Requests\PurchaseOrder;

use App\Models\Project;
use App\Models\PurchaseOrder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StorePurchaseOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', PurchaseOrder::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * Rules are conditional based on po_status:
     * - draft: most fields optional
     * - open: all required fields must be filled
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isDraft = $this->po_status === 'draft';

        return [
            'po_number' => $isDraft ? 'nullable|string|unique:purchase_orders' : 'required|string|unique:purchase_orders',
            'project_id' => $isDraft ? 'nullable|exists:projects,id' : 'required|exists:projects,id',
            'vendor_id' => $isDraft ? 'nullable|exists:vendors,id' : 'required|exists:vendors,id',
            'po_amount' => $isDraft ? 'nullable|numeric|min:0' : 'required|numeric|min:0',
            'currency' => 'nullable|in:PHP,USD',
            'payment_term' => 'nullable|string',
            'po_date' => $isDraft ? 'nullable|date' : 'required|date',
            'description' => 'nullable|string',
            'files' => 'nullable|array',
            'files.*' => 'file|max:10240', // 10MB max per file
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
            'po_number.required' => 'PO number is required for open purchase orders.',
            'po_number.unique' => 'This PO number already exists.',
            'project_id.required' => 'Project is required for open purchase orders.',
            'project_id.exists' => 'Selected project does not exist.',
            'vendor_id.required' => 'Vendor is required for open purchase orders.',
            'vendor_id.exists' => 'Selected vendor does not exist.',
            'po_amount.required' => 'PO amount is required for open purchase orders.',
            'po_amount.min' => 'PO amount must be at least 0.',
            'currency.in' => 'Currency must be either PHP or USD.',
            'po_date.required' => 'PO date is required for open purchase orders.',
            'files.*.max' => 'Each file must not exceed 10MB.',
        ];
    }

    /**
     * Configure the validator instance.
     *
     * Validates business rule:
     * - PO amount must not exceed project budget
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            // Budget validation: Check if PO amount exceeds project budget
            if ($this->project_id && $this->po_amount) {
                $project = Project::find($this->project_id);

                if ($project && $project->total_project_cost) {
                    // Calculate total committed amount from existing POs (draft and open)
                    $existingCommitment = PurchaseOrder::where('project_id', $this->project_id)
                        ->whereIn('po_status', ['draft', 'open'])
                        ->sum('po_amount');

                    $newTotal = $existingCommitment + $this->po_amount;

                    if ($newTotal > $project->total_project_cost) {
                        $overage = $newTotal - $project->total_project_cost;
                        $remaining = $project->total_project_cost - $existingCommitment;

                        $validator->errors()->add(
                            'po_amount',
                            "PO amount exceeds project budget by " . number_format($overage, 2) . ". " .
                            "Remaining budget: " . number_format($remaining, 2) . ". " .
                            "Project budget: " . number_format($project->total_project_cost, 2) . "."
                        );
                    }
                }
            }
        });
    }

    /**
     * Handle a failed authorization attempt.
     */
    protected function failedAuthorization()
    {
        abort(403, 'You do not have permission to create purchase orders.');
    }
}
