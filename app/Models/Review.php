<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'reviewable_type',
        'reviewable_id',
        'reviewer_id',
        'status',
        'comments',
        'reviewed_at',
    ];

    public function statusHistory()
    {
        return $this->belongsTo(StatusHistory::class);
    }

    // Reviewer (user who made the review)
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}
