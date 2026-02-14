<?php

namespace App\Models;

use App\Models\Traits\HasRemarks;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    use HasFactory, HasRemarks, LogsActivity;
    protected $guarded = [];

    public function creator(){
        return $this->belongsTo(User::class, 'created_by');
    }

    public function closedBy(){
        return $this->belongsTo(User::class, 'closed_by');
    }

    public function project(){
        return $this->belongsTo(Project::class);
    }

    public function vendor(){
        return $this->belongsTo(Vendor::class);
    }

    public function lineItems(){
        return $this->hasMany(PoLineItem::class);
    }

    public function files()
    {
        return $this->morphMany(File::class, 'fileable');
    }

    public function invoices(){
        return $this->hasMany(Invoice::class);
    }

    public function activityLogs(){
        return $this->morphMany(ActivityLog::class , 'loggable');
    }

    /**
     * Check if all associated invoices are paid
     * Excludes rejected invoices from the check - they shouldn't prevent PO closure
     */
    public function allInvoicesPaid(): bool
    {
        // Get count of non-rejected invoices (valid invoices)
        $nonRejectedCount = $this->invoices()
            ->where('invoice_status', '!=', 'rejected')
            ->count();

        // If no valid invoices exist, cannot close PO
        if ($nonRejectedCount === 0) {
            return false;
        }

        // Check if all non-rejected invoices are paid
        // Returns true only when there are no invoices that are neither paid nor rejected
        return $this->invoices()
            ->whereNotIn('invoice_status', ['paid', 'rejected'])
            ->count() === 0;
    }

    /**
     * Sync financial summary columns from invoices
     * This calculates and updates total_invoiced, total_paid, and outstanding_amount
     *
     * Note: Uses net_amount consistently for accurate financial tracking
     * - total_invoiced: Sum of net_amount for all non-rejected invoices
     * - total_paid: Sum of net_amount for paid invoices only
     * - outstanding_amount: PO amount minus total paid
     */
    public function syncFinancials(): void
    {
        // Use net_amount consistently (excludes rejected invoices from total)
        $totalInvoiced = $this->invoices()
            ->where('invoice_status', '!=', 'rejected')
            ->sum('net_amount');

        $totalPaid = $this->invoices()
            ->where('invoice_status', 'paid')
            ->sum('net_amount');

        $this->update([
            'total_invoiced' => $totalInvoiced,
            'total_paid' => $totalPaid,
            'outstanding_amount' => $this->po_amount - $totalPaid,
            'financials_updated_at' => now(),
        ]);
    }

    /**
     * Get calculated outstanding (for verification purposes)
     * This computes the value on-the-fly without using stored column
     */
    public function getCalculatedOutstandingAttribute(): float
    {
        return $this->po_amount - $this->invoices()
            ->where('invoice_status', 'paid')
            ->sum('net_amount');
    }

    /**
     * Get calculated total paid (for verification purposes)
     */
    public function getCalculatedTotalPaidAttribute(): float
    {
        return $this->invoices()
            ->where('invoice_status', 'paid')
            ->sum('net_amount');
    }

    /**
     * Get calculated total invoiced (for verification purposes)
     * Uses net_amount and excludes rejected invoices for consistency with syncFinancials
     */
    public function getCalculatedTotalInvoicedAttribute(): float
    {
        return $this->invoices()
            ->where('invoice_status', '!=', 'rejected')
            ->sum('net_amount');
    }

    /**
     * Verify stored financials match calculated values
     * Returns array of discrepancies (empty if all match)
     */
    public function verifyFinancials(): array
    {
        $calculated = [
            'total_paid' => $this->calculated_total_paid,
            'total_invoiced' => $this->calculated_total_invoiced,
            'outstanding' => $this->calculated_outstanding,
        ];

        $discrepancies = [];

        // Use small tolerance for floating point comparison
        if (abs($this->total_paid - $calculated['total_paid']) > 0.01) {
            $discrepancies['total_paid'] = [
                'stored' => $this->total_paid,
                'calculated' => $calculated['total_paid'],
                'difference' => $this->total_paid - $calculated['total_paid'],
            ];
        }

        if (abs($this->total_invoiced - $calculated['total_invoiced']) > 0.01) {
            $discrepancies['total_invoiced'] = [
                'stored' => $this->total_invoiced,
                'calculated' => $calculated['total_invoiced'],
                'difference' => $this->total_invoiced - $calculated['total_invoiced'],
            ];
        }

        if (abs($this->outstanding_amount - $calculated['outstanding']) > 0.01) {
            $discrepancies['outstanding_amount'] = [
                'stored' => $this->outstanding_amount,
                'calculated' => $calculated['outstanding'],
                'difference' => $this->outstanding_amount - $calculated['outstanding'],
            ];
        }

        return $discrepancies;
    }

    /**
     * Query Scopes for Dashboard Widgets
     */
    public function scopeInDateRange($query, $start, $end)
    {
        if ($start && $end) {
            return $query->whereBetween('finalized_at', [$start, $end]);
        }
        return $query;
    }

    public function scopeOpen($query)
    {
        return $query->where('po_status', 'open');
    }

    public function scopeDraft($query)
    {
        return $query->where('po_status', 'draft');
    }

    public function scopeClosed($query)
    {
        return $query->where('po_status', 'closed');
    }

    public function scopeCancelled($query)
    {
        return $query->where('po_status', 'cancelled');
    }

    public function scopeWithOutstanding($query)
    {
        return $query->where('outstanding_amount', '>', 0);
    }

    public function scopeFullyPaid($query)
    {
        return $query->where('outstanding_amount', '<=', 0)
                     ->where('total_paid', '>', 0);
    }

    public function scopePartiallyInvoiced($query)
    {
        return $query->whereColumn('total_invoiced', '<', 'po_amount');
    }

    public function scopeFullyInvoiced($query)
    {
        return $query->whereColumn('total_invoiced', '>=', 'po_amount');
    }

    /**
     * Custom activity log messages
     */
    protected function getCreationMessage(): string
    {
        $vendor = $this->vendor?->name ?? 'Unknown Vendor';
        $project = $this->project?->project_title ?? 'Unknown Project';
        $amount = $this->formatCurrency($this->po_amount ?? 0);

        return "Purchase order {$this->po_number} created for {$vendor} under {$project} ({$amount})";
    }

    protected function getStatusChangeMessage(string $from, string $to): string
    {
        $messages = [
            'draft->open' => 'Purchase order finalized and activated',
            'open->closed' => 'Purchase order closed',
            'open->cancelled' => 'Purchase order cancelled',
            'draft->cancelled' => 'Draft purchase order cancelled',
        ];

        $key = "{$from}->{$to}";
        return $messages[$key] ?? "PO status changed from {$from} to {$to}";
    }

    protected function getRelationshipAddedMessage(string $relationType, $relatedModel): string
    {
        if ($relationType === 'invoice') {
            $siNumber = is_object($relatedModel) ? $relatedModel->si_number : ($relatedModel['si_number'] ?? 'Unknown');
            $invoiceCurrency = is_object($relatedModel) ? ($relatedModel->currency ?? 'PHP') : ($relatedModel['currency'] ?? 'PHP');
            $amount = is_object($relatedModel)
                ? $this->formatCurrency($relatedModel->net_amount ?? $relatedModel->invoice_amount, $invoiceCurrency)
                : $this->formatCurrency($relatedModel['net_amount'] ?? $relatedModel['invoice_amount'] ?? 0, $invoiceCurrency);

            return "Invoice {$siNumber} added ({$amount})";
        }

        return parent::getRelationshipAddedMessage($relationType, $relatedModel);
    }

    protected function getRelationshipRemovedMessage(string $relationType, $relatedModel): string
    {
        if ($relationType === 'invoice') {
            $siNumber = is_object($relatedModel) ? $relatedModel->si_number : ($relatedModel['si_number'] ?? 'Unknown');
            return "Invoice {$siNumber} removed from this PO";
        }

        return parent::getRelationshipRemovedMessage($relationType, $relatedModel);
    }
}
