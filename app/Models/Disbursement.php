<?php

namespace App\Models;

use App\Models\Traits\HasRemarks;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;

class Disbursement extends Model
{
    use HasRemarks, LogsActivity;

    protected $guarded = [];

    protected $casts = [
        'date_check_scheduled' => 'date',
        'date_check_released_to_vendor' => 'date',
        'date_check_printing' => 'date',
    ];

    /**
     * Relationship: A disbursement has many check requisitions
     */
    public function checkRequisitions()
    {
        return $this->belongsToMany(CheckRequisition::class, 'check_requisition_disbursement')
            ->withTimestamps();
    }

    /**
     * Relationship: Get all invoices through check requisitions
     * Uses a custom query since this involves two many-to-many pivot tables
     */
    public function invoices()
    {
        return Invoice::whereHas('checkRequisitions', function ($query) {
            $query->whereHas('disbursements', function ($q) {
                $q->where('disbursements.id', $this->id);
            });
        });
    }

    /**
     * Get invoices as a collection (for when you need the actual data)
     */
    public function getInvoicesAttribute()
    {
        return $this->invoices()->get();
    }

    /**
     * Relationship: User who created the disbursement
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Polymorphic relationship: Files attached to this disbursement
     */
    public function files()
    {
        return $this->morphMany(File::class, 'fileable');
    }

    /**
     * Polymorphic relationship: Activity logs for this disbursement
     */
    public function activityLogs()
    {
        return $this->morphMany(ActivityLog::class, 'loggable');
    }

    /**
     * Query Scopes for Dashboard Widgets
     */
    public function scopeInDateRange($query, $start, $end)
    {
        if ($start && $end) {
            return $query->whereBetween('date_check_scheduled', [$start, $end]);
        }
        return $query;
    }

    public function scopePendingRelease($query)
    {
        return $query->whereNotNull('date_check_printing')
            ->whereNull('date_check_released_to_vendor');
    }

    public function scopePendingPrinting($query)
    {
        return $query->whereNull('date_check_printing')
            ->whereNotNull('date_check_scheduled');
    }

    public function scopeReleased($query)
    {
        return $query->whereNotNull('date_check_released_to_vendor');
    }

    public function scopeScheduled($query)
    {
        return $query->whereNotNull('date_check_scheduled');
    }

    /**
     * Custom activity log messages
     */
    protected function getCreationMessage(): string
    {
        $checkReqCount = $this->checkRequisitions()->count();
        return "Disbursement {$this->check_voucher_number} created with {$checkReqCount} check requisition(s)";
    }

    protected function getStatusChangeMessage(string $from, string $to): string
    {
        return "Status changed from {$from} to {$to}";
    }

    protected function getRelationshipAddedMessage(string $relationType, $relatedModel): string
    {
        if ($relationType === 'check_requisition' || $relationType === 'checkRequisitions') {
            if (is_array($relatedModel) && isset($relatedModel['count'])) {
                return "Added {$relatedModel['count']} check requisition(s)";
            }

            $reqNumber = is_object($relatedModel) ? $relatedModel->requisition_number : ($relatedModel['requisition_number'] ?? 'Unknown');
            return "Added check requisition {$reqNumber}";
        }

        return parent::getRelationshipAddedMessage($relationType, $relatedModel);
    }

    protected function getRelationshipRemovedMessage(string $relationType, $relatedModel): string
    {
        if ($relationType === 'check_requisition' || $relationType === 'checkRequisitions') {
            $reqNumber = is_object($relatedModel) ? $relatedModel->requisition_number : ($relatedModel['requisition_number'] ?? 'Unknown');
            return "Removed check requisition {$reqNumber}";
        }

        return parent::getRelationshipRemovedMessage($relationType, $relatedModel);
    }
}
