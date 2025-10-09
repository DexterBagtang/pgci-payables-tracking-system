<?php

namespace App\Models;

use App\Models\Traits\HasRemarks;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory,HasRemarks;

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




}
