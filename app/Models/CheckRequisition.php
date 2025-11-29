<?php

namespace App\Models;

use App\Models\Traits\HasRemarks;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;

class CheckRequisition extends Model
{
    use HasRemarks, LogsActivity;
    protected $guarded = [];

    public function invoices()
    {
        return $this->belongsToMany(Invoice::class, 'check_requisition_invoices')
            ->withTimestamps();
    }

    public function disbursements()
    {
        return $this->belongsToMany(Disbursement::class, 'check_requisition_disbursement')
            ->withTimestamps();
    }

    public function generator()
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    public function processor()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function files()
    {
        return $this->morphMany(File::class, 'fileable');
    }

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
            return $query->whereBetween('request_date', [$start, $end]);
        }
        return $query;
    }

    public function scopePendingApproval($query)
    {
        return $query->where('requisition_status', 'pending_approval');
    }

    public function scopeApproved($query)
    {
        return $query->where('requisition_status', 'approved');
    }

    public function scopeProcessed($query)
    {
        return $query->where('requisition_status', 'processed');
    }

    /**
     * Custom activity log messages
     */
    protected function getCreationMessage(): string
    {
        $amount = $this->formatCurrency($this->php_amount ?? 0);
        $invoiceCount = $this->invoices()->count();

        return "Check requisition {$this->requisition_number} created for {$this->payee_name} with {$invoiceCount} invoice(s) totaling {$amount}";
    }

    protected function getStatusChangeMessage(string $from, string $to): string
    {
        $messages = [
            'draft->pending_approval' => 'Submitted for approval',
            'pending_approval->approved' => 'Check requisition approved',
            'pending_approval->rejected' => 'Check requisition rejected',
            'approved->processed' => 'Payment processing initiated',
            'processed->paid' => 'Payment completed',
        ];

        $key = "{$from}->{$to}";
        return $messages[$key] ?? "Status changed from {$from} to {$to}";
    }

    protected function getRelationshipAddedMessage(string $relationType, $relatedModel): string
    {
        if ($relationType === 'invoice' || $relationType === 'invoices') {
            if (is_array($relatedModel) && isset($relatedModel['count'])) {
                $siNumbers = $relatedModel['invoice_numbers'] ?? [];
                return "Added {$relatedModel['count']} invoice(s): " . implode(', ', $siNumbers);
            }

            $siNumber = is_object($relatedModel) ? $relatedModel->si_number : ($relatedModel['si_number'] ?? 'Unknown');
            return "Added invoice {$siNumber} to this check requisition";
        }

        return parent::getRelationshipAddedMessage($relationType, $relatedModel);
    }

    protected function getRelationshipRemovedMessage(string $relationType, $relatedModel): string
    {
        if ($relationType === 'invoice' || $relationType === 'invoices') {
            $siNumber = is_object($relatedModel) ? $relatedModel->si_number : ($relatedModel['si_number'] ?? 'Unknown');
            return "Removed invoice {$siNumber} from this check requisition";
        }

        return parent::getRelationshipRemovedMessage($relationType, $relatedModel);
    }
}
