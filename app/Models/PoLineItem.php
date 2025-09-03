<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PoLineItem extends Model
{

    use HasFactory;

    protected $table = 'po_line_items';

    protected $fillable = [
        'po_id',
        'item_description',
        'quantity',
        'unit_price',
        'unit_of_measure',
    ];

    // If total_amount is generated in DB, no need to include it in fillable
    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    // Relationships
    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class, 'po_id');
    }
}
