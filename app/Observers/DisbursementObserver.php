<?php

namespace App\Observers;

use App\Models\Disbursement;
use App\Models\AuditTrail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DisbursementObserver
{
    /**
     * Handle the Disbursement "created" event.
     */
    public function created(Disbursement $disbursement): void
    {
        // Get the request instance if available
        $request = app(Request::class);

        AuditTrail::create([
            'table_name' => 'disbursements',
            'record_id' => $disbursement->id,
            'action' => 'create',
            'changes' => ['created' => $disbursement->toArray()],
            'user_id' => Auth::id(),
            'performed_at' => now(),
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }

    /**
     * Handle the Disbursement "updated" event.
     */
    public function updated(Disbursement $disbursement): void
    {
        // Get original values before changes
        $original = $disbursement->getOriginal();

        // Get only changed fields (excluding timestamps)
        $changes = [];
        foreach ($disbursement->getChanges() as $field => $newValue) {
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
                'table_name' => 'disbursements',
                'record_id' => $disbursement->id,
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
     * Handle the Disbursement "deleted" event.
     */
    public function deleted(Disbursement $disbursement): void
    {
        $request = app(Request::class);

        AuditTrail::create([
            'table_name' => 'disbursements',
            'record_id' => $disbursement->id,
            'action' => 'delete',
            'changes' => ['deleted' => $disbursement->toArray()],
            'user_id' => Auth::id(),
            'performed_at' => now(),
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }
}
