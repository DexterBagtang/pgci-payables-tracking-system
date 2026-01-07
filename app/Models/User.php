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
        'permissions',
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
            'permissions' => 'array',
        ];
    }

    /**
     * Available modules in the system
     */
    const MODULES = [
        'vendors',
        'projects',
        'purchase_orders',
        'invoices',
        'invoice_review',
        'check_requisitions',
        'disbursements',
        'users',
    ];

    /**
     * Check if user has admin override (bypasses all permission checks)
     */
    private function hasAdminOverride(): bool
    {
        return $this->isAdmin();
    }

    /**
     * Check if user can read a specific module
     */
    public function canRead(string $module): bool
    {
        if ($this->hasAdminOverride()) {
            return true;
        }

        return in_array($module, $this->permissions['read'] ?? []);
    }

    /**
     * Check if user can write/modify a specific module
     */
    public function canWrite(string $module): bool
    {
        if ($this->hasAdminOverride()) {
            return true;
        }

        return in_array($module, $this->permissions['write'] ?? []);
    }

    /**
     * Get all modules user can read
     */
    public function getReadableModules(): array
    {
        if ($this->hasAdminOverride()) {
            return self::MODULES;
        }

        return $this->permissions['read'] ?? [];
    }

    /**
     * Get all modules user can write
     */
    public function getWritableModules(): array
    {
        if ($this->hasAdminOverride()) {
            return self::MODULES;
        }

        return $this->permissions['write'] ?? [];
    }

    /**
     * Validate and sanitize permissions on set
     */
    public function setPermissionsAttribute(?array $value): void
    {
        if ($value !== null) {
            $this->attributes['permissions'] = json_encode([
                'read' => array_values(array_intersect($value['read'] ?? [], self::MODULES)),
                'write' => array_values(array_intersect($value['write'] ?? [], self::MODULES)),
            ]);
        } else {
            $this->attributes['permissions'] = null;
        }
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

    /**
     * Get the authentication logs for the user.
     */
    public function authLogs()
    {
        return $this->hasMany(AuthLog::class);
    }
}
