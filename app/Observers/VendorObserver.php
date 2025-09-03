<?php

namespace App\Observers;

use App\Models\Vendor;
use App\Models\AuditTrail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VendorObserver
{
    /**
     * Handle the Vendor "created" event.
     */
    public function created(Vendor $vendor): void
    {
        // Get the request instance if available
        $request = app(Request::class);

        AuditTrail::create([
            'table_name' => 'vendors',
            'record_id' => $vendor->id,
            'action' => 'create',
            'changes' => ['created' => $vendor->toArray()],
            'user_id' => Auth::id(),
            'performed_at' => now(),
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }

    /**
     * Handle the Vendor "updated" event.
     */
    public function updated(Vendor $vendor): void
    {
        // Get original values before changes
        $original = $vendor->getOriginal();

        // Get only changed fields (excluding timestamps)
        $changes = [];
        foreach ($vendor->getChanges() as $field => $newValue) {
            if (!in_array($field, ['updated_at', 'updated_by'])) {
                $changes[$field] = [
                    'old' => $original[$field] ?? null,
                    'new' => $newValue
                ];
            }
        }

        // Only log if there are actual changes
        if (!empty($changes)) {
            $request = app(Request::class);

            AuditTrail::create([
                'table_name' => 'vendors',
                'record_id' => $vendor->id,
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
     * Handle the Vendor "deleted" event.
     */
    public function deleted(Vendor $vendor): void
    {
        $request = app(Request::class);

        AuditTrail::create([
            'table_name' => 'vendors',
            'record_id' => $vendor->id,
            'action' => 'delete',
            'changes' => ['deleted' => $vendor->toArray()],
            'user_id' => Auth::id() || 1,
            'performed_at' => now(),
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }
}
