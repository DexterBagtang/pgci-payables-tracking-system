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
     */
    public function invoices()
    {
        return $this->hasManyThrough(
            Invoice::class,
            CheckRequisition::class,
            'id', // Foreign key on check_requisitions table
            'id', // Foreign key on invoices table
            'id', // Local key on disbursements table
            'id'  // Local key on check_requisitions table
        )
        ->join('check_requisition_disbursement', 'check_requisitions.id', '=', 'check_requisition_disbursement.check_requisition_id')
        ->join('check_requisition_invoices', 'check_requisitions.id', '=', 'check_requisition_invoices.check_requisition_id')
        ->where('check_requisition_disbursement.disbursement_id', $this->id)
        ->select('invoices.*');
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
