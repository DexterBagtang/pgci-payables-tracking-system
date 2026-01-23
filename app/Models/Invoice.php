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

    // Direct relationships for invoices without PO
    public function directVendor()
    {
        return $this->belongsTo(Vendor::class, 'vendor_id');
    }

    public function directProject()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    // Accessor attribute for vendor - returns vendor from either direct or PO relationship
    public function getVendorAttribute()
    {
        if ($this->invoice_type === 'direct' || $this->vendor_id) {
            return $this->directVendor;
        }
        return $this->purchaseOrder?->vendor;
    }

    // Accessor attribute for project - returns project from either direct or PO relationship
    public function getProjectAttribute()
    {
        if ($this->invoice_type === 'direct' || $this->project_id) {
            return $this->directProject;
        }
        return $this->purchaseOrder?->project;
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

    public function scopeDirectInvoices($query)
    {
        return $query->where('invoice_type', 'direct');
    }

    public function scopePurchaseOrderInvoices($query)
    {
        return $query->where('invoice_type', 'purchase_order');
    }

    public function scopeByVendor($query, $vendorId)
    {
        return $query->where(function($q) use ($vendorId) {
            $q->where('vendor_id', $vendorId)
              ->orWhereHas('purchaseOrder', fn($q) => $q->where('vendor_id', $vendorId));
        });
    }

    /**
     * Custom activity log messages
     */
    protected function getCreationMessage(): string
    {
        if ($this->invoice_type === 'direct') {
            $vendor = $this->directVendor?->name ?? 'Unknown Vendor';
            $amount = $this->formatCurrency($this->net_amount ?? $this->invoice_amount);

            $message = "Direct invoice {$this->si_number} created for {$vendor}";

            if ($this->directProject) {
                $message .= " under {$this->directProject->project_title}";
            }

            $message .= " ({$amount})";

            return $message;
        }

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
