<?php

namespace App\Http\Requests\PurchaseOrder;

use App\Models\Project;
use App\Models\PurchaseOrder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdatePurchaseOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Delegates to PurchaseOrderPolicy which checks:
     * - User has write permission for purchase_orders module
     * - PO is in editable state (draft or open, not closed/cancelled)
     */
    public function authorize(): bool
    {
        $purchase_order = $this->route('purchase_order');

        if (!$purchase_order) {
            return false;
        }

        // Check basic update permission
        if (!$this->user()->can('update', $purchase_order)) {
            return false;
        }

        // If vendor_id is being changed, check updateVendor permission
        if ($this->vendor_id && $this->vendor_id != $purchase_order->vendor_id) {
            return $this->user()->can('updateVendor', $purchase_order);
        }

        return true;
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
        $purchase_order = $this->route('purchase_order');
        $isDraft = $this->po_status === 'draft';

        return [
            'po_number' => [
                $isDraft ? 'nullable' : 'required',
                'string',
                'unique:purchase_orders,po_number,' . ($purchase_order?->id ?? 'NULL')
            ],
            'project_id' => $isDraft ? 'nullable|exists:projects,id' : 'required|exists:projects,id',
            'vendor_id' => $isDraft ? 'nullable|exists:vendors,id' : 'required|exists:vendors,id',
            'po_amount' => $isDraft ? 'nullable|numeric|min:0' : 'required|numeric|min:0',
            'currency' => 'nullable|in:PHP,USD',
            'payment_term' => 'nullable|string',
            'po_date' => $isDraft ? 'nullable|date' : 'required|date',
            'description' => 'nullable|string',
            'po_status' => 'required|in:draft,open,closed,cancelled',
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
            'po_status.in' => 'Invalid purchase order status.',
        ];
    }

    /**
     * Configure the validator instance.
     *
     * Validates business rules:
     * - PO amount must not exceed project budget (excluding current PO)
     * - Cannot change vendor if PO has invoices
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $purchase_order = $this->route('purchase_order');

            if (!$purchase_order) {
                return;
            }

            // Prevent vendor change if PO has invoices (redundant with policy, but good for clarity)
            if ($purchase_order->invoices()->count() > 0 && $this->vendor_id != $purchase_order->vendor_id) {
                $validator->errors()->add(
                    'vendor_id',
                    'Cannot change vendor because this PO has associated invoices. ' .
                    'Please remove or reassign invoices first.'
                );
            }

            // Budget validation: Check if updated PO amount exceeds project budget
            if ($this->project_id && $this->po_amount) {
                $project = Project::find($this->project_id);

                if ($project && $project->total_project_cost) {
                    // Calculate total committed amount from existing POs (excluding current PO)
                    $existingCommitment = PurchaseOrder::where('project_id', $this->project_id)
                        ->whereIn('po_status', ['draft', 'open'])
                        ->where('id', '!=', $purchase_order->id)
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
     *
     * Returns detailed error message from policy
     */
    protected function failedAuthorization()
    {
        $purchase_order = $this->route('purchase_order');

        // If purchase order doesn't exist, return generic error
        if (!$purchase_order) {
            abort(response()->json([
                'message' => 'Purchase order not found or you do not have permission to edit it.'
            ], 403));
        }

        // Check if vendor change is the issue
        if ($this->vendor_id && $this->vendor_id != $purchase_order->vendor_id) {
            if ($purchase_order->invoices()->exists()) {
                abort(response()->json([
                    'message' => 'Cannot change vendor on this purchase order because it has associated invoices.',
                    'current_vendor_id' => $purchase_order->vendor_id,
                    'help' => 'Please remove or reassign invoices before changing the vendor.'
                ], 403));
            }
        }

        abort(response()->json([
            'message' => "Cannot edit purchase order in '{$purchase_order->po_status}' status.",
            'current_status' => $purchase_order->po_status,
            'allowed_statuses' => ['draft', 'open'],
            'help' => 'Only draft or open purchase orders can be edited.'
        ], 403));
    }
}
