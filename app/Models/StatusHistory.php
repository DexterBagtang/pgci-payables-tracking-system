<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StatusHistory extends Model
{
    protected $guarded = [];
    public function statusable()
    {
        return $this->morphTo();
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
