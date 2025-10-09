<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CheckRequisitionInvoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'check_requisition_id',
        'invoice_id',
    ];

    // Relationships
    public function checkRequisition()
    {
        return $this->belongsTo(CheckRequisition::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
