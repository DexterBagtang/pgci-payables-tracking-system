<?php

namespace App\Observers;

use App\Models\User;
use App\Models\AuditTrail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        // Get the request instance if available
        $request = app(Request::class);

        AuditTrail::create([
            'table_name' => 'users',
            'record_id' => $user->id,
            'action' => 'create',
            'changes' => ['created' => $user->makeHidden(['password', 'remember_token'])->toArray()],
            'user_id' => Auth::id(),
            'performed_at' => now(),
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        // Get original values before changes
        $original = $user->getOriginal();

        // Get only changed fields (excluding timestamps and sensitive fields)
        $changes = [];
        foreach ($user->getChanges() as $field => $newValue) {
            if (!in_array($field, ['updated_at', 'remember_token'])) {
                // Don't log actual password values, just note that it changed
                if ($field === 'password') {
                    $changes[$field] = [
                        'old' => '***hidden***',
                        'new' => '***hidden***'
                    ];
                } else {
                    $changes[$field] = [
                        'old' => $original[$field] ?? null,
                        'new' => $newValue
                    ];
                }
            }
        }

        // Only log if there are actual changes
        if (!empty($changes)) {
            $request = app(Request::class);

            AuditTrail::create([
                'table_name' => 'users',
                'record_id' => $user->id,
                'action' => 'update',
                'changes' => $changes,
                'user_id' => Auth::id(),
                'performed_at' => now(),
                'ip_address' => $request?->ip(),
                'user_agent' => $request?->userAgent(),
            ]);
        }
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        $request = app(Request::class);

        AuditTrail::create([
            'table_name' => 'users',
            'record_id' => $user->id,
            'action' => 'delete',
            'changes' => ['deleted' => $user->makeHidden(['password', 'remember_token'])->toArray()],
            'user_id' => Auth::id(),
            'performed_at' => now(),
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }
}
