<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    use HasFactory;
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
}
