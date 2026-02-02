<?php

namespace App\Models;

use App\Enums\InvoiceStatus;
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
     * Query Scopes for Dashboard Widgets
     */
    public function scopeInDateRange($query, $start, $end)
    {
        if ($start && $end) {
            return $query->whereBetween('si_received_at', [$start, $end]);
        }
        return $query;
    }

    public function scopePending($query)
    {
        return $query->whereIn('invoice_status', ['received', 'in_progress', 'pending']);
    }

    public function scopeOverdue($query)
    {
        // Use whereDate for fair comparison (ignores time component)
        return $query->whereDate('due_date', '<', now()->toDateString())
            ->whereNotIn('invoice_status', ['paid', 'rejected']);
    }

    public function scopeApproved($query)
    {
        return $query->where('invoice_status', 'approved');
    }

    public function scopePendingDisbursement($query)
    {
        return $query->where('invoice_status', 'pending_disbursement');
    }

    public function scopePaid($query)
    {
        return $query->where('invoice_status', 'paid');
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

    /**
     * Status Transition Validation Methods
     */

    /**
     * Get the current status as an enum
     */
    public function getStatusEnum(): InvoiceStatus
    {
        return InvoiceStatus::from($this->invoice_status);
    }

    /**
     * Check if transition to a new status is allowed
     */
    public function canTransitionTo(string|InvoiceStatus $newStatus): bool
    {
        $currentStatus = $this->getStatusEnum();
        $targetStatus = is_string($newStatus) ? InvoiceStatus::from($newStatus) : $newStatus;

        return $currentStatus->canTransitionTo($targetStatus);
    }

    /**
     * Validate and transition to a new status
     *
     * @throws \InvalidArgumentException if transition is not allowed
     */
    public function transitionTo(string|InvoiceStatus $newStatus, ?string $reason = null): bool
    {
        $targetStatus = is_string($newStatus) ? InvoiceStatus::from($newStatus) : $newStatus;

        if (!$this->canTransitionTo($targetStatus)) {
            throw new \InvalidArgumentException(
                "Cannot transition from {$this->invoice_status} to {$targetStatus->value}. " .
                "Allowed transitions: " . implode(', ', array_map(
                    fn($s) => $s->value,
                    $this->getStatusEnum()->allowedTransitions()
                ))
            );
        }

        $oldStatus = $this->invoice_status;
        $this->invoice_status = $targetStatus->value;
        $saved = $this->save();

        if ($saved && $reason) {
            $this->logStatusChange($oldStatus, $targetStatus->value, $reason);
        }

        return $saved;
    }

    /**
     * Check if this invoice can be edited
     */
    public function isEditable(): bool
    {
        return $this->getStatusEnum()->isEditable();
    }

    /**
     * Check if this invoice is in a final status
     */
    public function isFinal(): bool
    {
        return $this->getStatusEnum()->isFinal();
    }

    /**
     * Scope to get overdue invoices
     */
    public function scopeNeedsOverdueCheck($query)
    {
        return $query->whereDate('due_date', '<', now()->toDateString())
            ->whereNotIn('invoice_status', ['paid', 'rejected', 'overdue']);
    }

    /**
     * Mark this invoice as overdue if conditions are met
     */
    public function markOverdueIfNeeded(): bool
    {
        if ($this->due_date &&
            $this->due_date < now()->startOfDay() &&
            !in_array($this->invoice_status, ['paid', 'rejected', 'overdue'])
        ) {
            $this->invoice_status = InvoiceStatus::OVERDUE->value;
            return $this->save();
        }

        return false;
    }
}
