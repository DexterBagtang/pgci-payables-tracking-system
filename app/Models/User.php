<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\UserRole;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use /*HasApiTokens,*/ HasFactory, Notifiable, LogsActivity;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'username',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
        ];
    }

    /**
     * Check if the user has a specific role.
     */
    public function hasRole(UserRole $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if the user is an admin.
     */
    public function isAdmin(): bool
    {
        return $this->hasRole(UserRole::ADMIN);
    }

    /**
     * Check if the user is in purchasing.
     */
    public function isPurchasing(): bool
    {
        return $this->hasRole(UserRole::PURCHASING);
    }

    /**
     * Check if the user is in payables.
     */
    public function isPayables(): bool
    {
        return $this->hasRole(UserRole::PAYABLES);
    }

    /**
     * Check if the user is in disbursement.
     */
    public function isDisbursement(): bool
    {
        return $this->hasRole(UserRole::DISBURSEMENT);
    }

    /**
     * Get the activity logs for the user.
     */
    public function activityLogs()
    {
        return $this->morphMany(ActivityLog::class, 'loggable');
    }
}
