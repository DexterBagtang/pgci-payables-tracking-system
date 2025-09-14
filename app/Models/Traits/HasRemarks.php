<?php

namespace App\Models\Traits;

use App\Models\Remark;

trait HasRemarks
{
    public function remarks()
    {
        return $this->morphMany(Remark::class, 'remarkable')->latest();
    }
}
