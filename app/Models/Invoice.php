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

    public function checkRequisitions(){
        return $this->hasMany(CheckRequisition::class);
    }



}
