<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

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

    
}
