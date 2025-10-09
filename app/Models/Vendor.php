<?php

namespace App\Models;

use App\Models\Traits\HasRemarks;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vendor extends Model
{
    use HasFactory, HasRemarks;

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

    // 🧾 Vendor has many invoices through purchase orders
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


}


