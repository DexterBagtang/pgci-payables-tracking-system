<?php

namespace App\Observers;

use App\Models\PurchaseOrder;
use App\Models\AuditTrail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PurchaseOrderObserver
{
    /**
     * Handle the PurchaseOrder "created" event.
     */
    public function created(PurchaseOrder $purchaseOrder): void
    {
        // Get the request instance if available
        $request = app(Request::class);

        AuditTrail::create([
            'table_name' => 'purchase_orders',
            'record_id' => $purchaseOrder->id,
            'action' => 'create',
            'changes' => ['created' => $purchaseOrder->toArray()],
            'user_id' => Auth::id(),
            'performed_at' => now(),
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }

    /**
     * Handle the PurchaseOrder "updated" event.
     */
    public function updated(PurchaseOrder $purchaseOrder): void
    {
        // Get original values before changes
        $original = $purchaseOrder->getOriginal();

        // Get only changed fields (excluding timestamps)
        $changes = [];
        foreach ($purchaseOrder->getChanges() as $field => $newValue) {
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
                'table_name' => 'purchase_orders',
                'record_id' => $purchaseOrder->id,
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
     * Handle the PurchaseOrder "deleted" event.
     */
    public function deleted(PurchaseOrder $purchaseOrder): void
    {
        $request = app(Request::class);

        AuditTrail::create([
            'table_name' => 'purchase_orders',
            'record_id' => $purchaseOrder->id,
            'action' => 'delete',
            'changes' => ['deleted' => $purchaseOrder->toArray()],
            'user_id' => Auth::id(),
            'performed_at' => now(),
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }
}