<?php

namespace App\Models;

use App\Models\Traits\HasRemarks;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vendor extends Model
{
    use HasFactory, HasRemarks, LogsActivity;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

// Add relationship to creator
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    // 🧾 Vendor has many invoices through purchase orders (PO-based only)
    public function invoices()
    {
        return $this->hasManyThrough(
            Invoice::class,          // Final model
            PurchaseOrder::class,    // Intermediate model
            'vendor_id',             // Foreign key on purchase_orders
            'purchase_order_id',     // Foreign key on invoices
            'id',                    // Local key on vendors
            'id'                     // Local key on purchase_orders
        );
    }

    // 🧾 Vendor has many direct invoices (without PO)
    public function directInvoices()
    {
        return $this->hasMany(Invoice::class, 'vendor_id');
    }

    // 🧾 Get all invoices (both PO-based and direct)
    public function allInvoices()
    {
        return Invoice::where(function($q) {
            $q->where('vendor_id', $this->id)
              ->orWhereHas('purchaseOrder', fn($q) => $q->where('vendor_id', $this->id));
        });
    }

    public function projects()
    {
        return $this->hasManyThrough(
            Project::class,
            PurchaseOrder::class,
            'vendor_id',    // Foreign key on purchase_orders
            'id',           // Foreign key on projects
            'id',           // Local key on vendors
            'project_id'    // Local key on purchase_orders
        )->distinct(); // optional, avoids duplicate projects
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
        $category = $this->category === 'sap' ? 'SAP Vendor' : 'Manual Vendor';
        $type = $this->vendor_type ? " ({$this->vendor_type})" : '';

        return "New {$category} '{$this->name}' created{$type}";
    }

    protected function getStatusChangeMessage(string $from, string $to): string
    {
        if ($from === 'active' && $to === 'inactive') {
            return "Vendor deactivated";
        } elseif ($from === 'inactive' && $to === 'active') {
            return "Vendor reactivated";
        }

        return parent::getStatusChangeMessage($from, $to);
    }

    protected function getRelationshipAddedMessage(string $relationType, $relatedModel): string
    {
        if ($relationType === 'purchase_order') {
            $poNumber = is_object($relatedModel) ? $relatedModel->po_number : ($relatedModel['po_number'] ?? 'Unknown');
            $amount = is_object($relatedModel)
                ? $this->formatCurrency($relatedModel->po_amount ?? 0)
                : $this->formatCurrency($relatedModel['po_amount'] ?? 0);

            return "Purchase Order {$poNumber} created ({$amount})";
        }

        return parent::getRelationshipAddedMessage($relationType, $relatedModel);
    }

    protected function getRelationshipRemovedMessage(string $relationType, $relatedModel): string
    {
        if ($relationType === 'purchase_order') {
            $poNumber = is_object($relatedModel) ? $relatedModel->po_number : ($relatedModel['po_number'] ?? 'Unknown');
            return "Purchase Order {$poNumber} removed from this vendor";
        }

        return parent::getRelationshipRemovedMessage($relationType, $relatedModel);
    }
}


