<?php

namespace App\Models;

use App\Models\Traits\HasRemarks;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory, HasRemarks, LogsActivity;

    protected $guarded = [];

    public function purchaseOrder(){
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function files(){
        return $this->morphMany(File::class, 'fileable');
    }

    public function activityLogs(){
        return $this->morphMany(ActivityLog::class , 'loggable');
    }

    public function checkRequisitions()
    {
        return $this->belongsToMany(CheckRequisition::class, 'check_requisition_invoices')
            ->withTimestamps();
    }
    public function vendor()
    {
        return $this->hasOneThrough(
            Vendor::class,          // Final model
            PurchaseOrder::class,   // Intermediate model
            'id',                   // Foreign key on purchase_orders (to match with invoices.purchase_order_id)
            'id',                   // Foreign key on vendors (to match with purchase_orders.vendor_id)
            'purchase_order_id',    // Foreign key on invoices
            'vendor_id'             // Foreign key on purchase_orders
        );
    }

    public function project()
    {
        return $this->hasOneThrough(
            Project::class,
            PurchaseOrder::class,
            'id',
            'id',
            'purchase_order_id',
            'project_id'
        );
    }

    /**
     * Custom activity log messages
     */
    protected function getCreationMessage(): string
    {
        $vendor = $this->purchaseOrder?->vendor?->name ?? 'Unknown Vendor';
        $amount = $this->formatCurrency($this->net_amount ?? $this->invoice_amount);

        return "Invoice {$this->si_number} created for {$vendor} ({$amount})";
    }

    protected function getStatusChangeMessage(string $from, string $to): string
    {
        $messages = [
            'pending->received' => 'Physical files received and logged',
            'received->approved' => 'Invoice approved for payment',
            'approved->pending_disbursement' => 'Invoice queued for disbursement',
            'pending_disbursement->paid' => 'Payment completed',
            'approved->rejected' => 'Invoice approval revoked',
            'rejected->pending' => 'Invoice resubmitted for review',
        ];

        $key = "{$from}->{$to}";
        return $messages[$key] ?? "Status changed from {$from} to {$to}";
    }

    protected function getRelationshipAddedMessage(string $relationType, $relatedModel): string
    {
        if ($relationType === 'check_requisition') {
            $crNumber = is_object($relatedModel) ? $relatedModel->requisition_number : ($relatedModel['requisition_number'] ?? 'Unknown');
            return "Added to Check Requisition {$crNumber} for payment processing";
        }

        return parent::getRelationshipAddedMessage($relationType, $relatedModel);
    }

    protected function getRelationshipRemovedMessage(string $relationType, $relatedModel): string
    {
        if ($relationType === 'check_requisition') {
            $crNumber = is_object($relatedModel) ? $relatedModel->requisition_number : ($relatedModel['requisition_number'] ?? 'Unknown');
            return "Removed from Check Requisition {$crNumber}";
        }

        return parent::getRelationshipRemovedMessage($relationType, $relatedModel);
    }
}
