<?php

namespace App\Models;

use App\Models\Traits\HasRemarks;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory,HasRemarks, LogsActivity;

    protected $fillable = [
        'project_title',
        'cer_number',
        'total_project_cost',
        'total_contract_cost',
        'project_status',
        'description',
        'project_type',
        'smpo_number',
        'philcom_category',
        'team',
        'created_by',
    ];

    protected $casts = [
        'total_project_cost' => 'decimal:2',
        'total_contract_cost' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];


    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    // Relationships
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes for common queries
    public function scopeActive($query)
    {
        return $query->where('project_status', 'active');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('project_type', $type);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('project_title', 'like', "%{$search}%")
                ->orWhere('cer_number', 'like', "%{$search}%")
                ->orWhere('smpo_number', 'like', "%{$search}%");
        });
    }

    // Accessors
    public function getFormattedProjectCostAttribute()
    {
        return number_format($this->total_project_cost, 2);
    }

    public function getFormattedContractCostAttribute()
    {
        return number_format($this->total_contract_cost, 2);
    }

    public function getProjectTypeDisplayAttribute()
    {
        return $this->project_type === 'sm_project' ? 'SM Project' : 'PhilCom Project';
    }

    public function getProjectStatusDisplayAttribute()
    {
        return match($this->project_status) {
            'active' => 'Active',
            'on_hold' => 'On Hold',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled',
            default => 'Unknown'
        };
    }

    public function getBudgetUtilizationAttribute()
    {
        $committed = $this->purchaseOrders()
            ->whereIn('po_status', ['draft', 'open'])
            ->sum('po_amount');

        $percentage = $this->total_project_cost > 0
            ? ($committed / $this->total_project_cost) * 100
            : 0;

        return [
            'committed' => (float) $committed,
            'remaining' => (float) ($this->total_project_cost - $committed),
            'percentage' => round($percentage, 2),
            'total_budget' => (float) $this->total_project_cost,
        ];
    }

    public function activityLogs()
    {
        return $this->morphMany(ActivityLog::class, 'loggable');
    }

    /**
     * Custom activity log messages
     */
    protected function getCreationMessage(): string
    {
        $projectType = $this->project_type === 'sm_project' ? 'SM Project' : 'PhilCom Project';
        $cost = $this->formatCurrency($this->total_project_cost ?? 0);

        return "New {$projectType} '{$this->project_title}' created with CER #{$this->cer_number} (Budget: {$cost})";
    }

    protected function getStatusChangeMessage(string $from, string $to): string
    {
        $messages = [
            'active->on_hold' => 'Project placed on hold',
            'on_hold->active' => 'Project reactivated',
            'active->completed' => "Project marked as completed. Total cost: " . $this->formatCurrency($this->total_project_cost ?? 0),
            'on_hold->completed' => "Project marked as completed. Total cost: " . $this->formatCurrency($this->total_project_cost ?? 0),
            'active->cancelled' => 'Project cancelled',
            'on_hold->cancelled' => 'Project cancelled',
        ];

        $key = "{$from}->{$to}";
        return $messages[$key] ?? "Project status changed from {$from} to {$to}";
    }

    protected function getRelationshipAddedMessage(string $relationType, $relatedModel): string
    {
        if ($relationType === 'purchase_order') {
            $poNumber = is_object($relatedModel) ? $relatedModel->po_number : ($relatedModel['po_number'] ?? 'Unknown');
            $amount = is_object($relatedModel)
                ? $this->formatCurrency($relatedModel->po_amount ?? 0)
                : $this->formatCurrency($relatedModel['po_amount'] ?? 0);

            return "Purchase Order {$poNumber} added to this project ({$amount})";
        }

        return parent::getRelationshipAddedMessage($relationType, $relatedModel);
    }

    protected function getRelationshipRemovedMessage(string $relationType, $relatedModel): string
    {
        if ($relationType === 'purchase_order') {
            $poNumber = is_object($relatedModel) ? $relatedModel->po_number : ($relatedModel['po_number'] ?? 'Unknown');
            return "Purchase Order {$poNumber} removed from this project";
        }

        return parent::getRelationshipRemovedMessage($relationType, $relatedModel);
    }
}
