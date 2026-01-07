<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuthLog extends Model
{
    const UPDATED_AT = null; // Only use created_at

    protected $guarded = [];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Get the user associated with this auth log
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for filtering by event type
     */
    public function scopeEventType($query, string $eventType)
    {
        return $query->where('event_type', $eventType);
    }

    /**
     * Scope for login events
     */
    public function scopeLogins($query)
    {
        return $query->where('event_type', 'login');
    }

    /**
     * Scope for logout events
     */
    public function scopeLogouts($query)
    {
        return $query->where('event_type', 'logout');
    }

    /**
     * Scope for failed login attempts
     */
    public function scopeFailedLogins($query)
    {
        return $query->where('event_type', 'failed_login');
    }

    /**
     * Scope for recent events
     */
    public function scopeRecent($query, int $hours = 24)
    {
        return $query->where('created_at', '>=', now()->subHours($hours));
    }

    /**
     * Scope for specific user
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Check if this was a successful login
     */
    public function isSuccessfulLogin(): bool
    {
        return $this->event_type === 'login';
    }

    /**
     * Check if this was a failed login attempt
     */
    public function isFailedLogin(): bool
    {
        return $this->event_type === 'failed_login';
    }
}
