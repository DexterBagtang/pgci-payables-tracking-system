<?php

namespace App\Observers;

use App\Models\CheckRequisition;
use App\Models\AuditTrail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckRequisitionObserver
{
    /**
     * Handle the CheckRequisition "created" event.
     */
    public function created(CheckRequisition $checkRequisition): void
    {
        // Get the request instance if available
        $request = app(Request::class);

        AuditTrail::create([
            'table_name' => 'check_requisitions',
            'record_id' => $checkRequisition->id,
            'action' => 'create',
            'changes' => ['created' => $checkRequisition->toArray()],
            'user_id' => Auth::id(),
            'performed_at' => now(),
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }

    /**
     * Handle the CheckRequisition "updated" event.
     */
    public function updated(CheckRequisition $checkRequisition): void
    {
        // Get original values before changes
        $original = $checkRequisition->getOriginal();

        // Get only changed fields (excluding timestamps)
        $changes = [];
        foreach ($checkRequisition->getChanges() as $field => $newValue) {
            if (!in_array($field, ['updated_at'])) {
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
                'table_name' => 'check_requisitions',
                'record_id' => $checkRequisition->id,
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
     * Handle the CheckRequisition "deleted" event.
     */
    public function deleted(CheckRequisition $checkRequisition): void
    {
        $request = app(Request::class);

        AuditTrail::create([
            'table_name' => 'check_requisitions',
            'record_id' => $checkRequisition->id,
            'action' => 'delete',
            'changes' => ['deleted' => $checkRequisition->toArray()],
            'user_id' => Auth::id(),
            'performed_at' => now(),
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }
}