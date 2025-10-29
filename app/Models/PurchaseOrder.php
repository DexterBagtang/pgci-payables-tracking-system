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
            'open->closed' => 'Purchase order closed - all invoices settled',
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
            $amount = is_object($relatedModel)
                ? $this->formatCurrency($relatedModel->net_amount ?? $relatedModel->invoice_amount)
                : $this->formatCurrency($relatedModel['net_amount'] ?? $relatedModel['invoice_amount'] ?? 0);

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
