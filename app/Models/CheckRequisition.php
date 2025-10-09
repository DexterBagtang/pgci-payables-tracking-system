<?php

namespace App\Models;

use App\Models\Traits\HasRemarks;
use Illuminate\Database\Eloquent\Model;

class CheckRequisition extends Model
{
    use HasRemarks;
    protected $guarded = [];

    public function invoices()
    {
        return $this->belongsToMany(Invoice::class, 'check_requisition_invoices')
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


}
