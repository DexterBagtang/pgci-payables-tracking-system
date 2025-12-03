<?php

namespace App\Observers;

use App\Models\Invoice;
use App\Models\AuditTrail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InvoiceObserver
{
    /**
     * Handle the Invoice "created" event.
     */
    public function created(Invoice $invoice): void
    {
        // Get the request instance if available
        $request = app(Request::class);

        AuditTrail::create([
            'table_name' => 'invoices',
            'record_id' => $invoice->id,
            'action' => 'create',
            'changes' => ['created' => $invoice->toArray()],
            'user_id' => Auth::id(),
            'performed_at' => now(),
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);

        // Sync purchase order financials
        $this->syncPurchaseOrderFinancials($invoice);
    }

    /**
     * Handle the Invoice "updated" event.
     */
    public function updated(Invoice $invoice): void
    {
        // Get original values before changes
        $original = $invoice->getOriginal();

        // Get only changed fields (excluding timestamps)
        $changes = [];
        foreach ($invoice->getChanges() as $field => $newValue) {
            if (!in_array($field, ['updated_at', 'financials_updated_at'])) {
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
                'table_name' => 'invoices',
                'record_id' => $invoice->id,
                'action' => 'update',
                'changes' => $changes,
                'user_id' => Auth::id(),
                'performed_at' => now(),
                'ip_address' => $request?->ip(),
                'user_agent' => $request?->userAgent(),
            ]);
        }

        // Sync purchase order financials
        $this->syncPurchaseOrderFinancials($invoice);

        // If invoice was moved to a different PO, sync the old PO too
        if ($invoice->isDirty('purchase_order_id') && $original['purchase_order_id']) {
            $oldPo = \App\Models\PurchaseOrder::find($original['purchase_order_id']);
            $oldPo?->syncFinancials();
        }
    }

    /**
     * Handle the Invoice "deleted" event.
     */
    public function deleted(Invoice $invoice): void
    {
        $request = app(Request::class);

        AuditTrail::create([
            'table_name' => 'invoices',
            'record_id' => $invoice->id,
            'action' => 'delete',
            'changes' => ['deleted' => $invoice->toArray()],
            'user_id' => Auth::id(),
            'performed_at' => now(),
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);

        // Sync purchase order financials
        $this->syncPurchaseOrderFinancials($invoice);
    }

    /**
     * Sync the purchase order's financial summary
     * Called after any invoice change (create/update/delete)
     */
    private function syncPurchaseOrderFinancials(Invoice $invoice): void
    {
        if ($invoice->purchaseOrder) {
            $invoice->purchaseOrder->syncFinancials();
        }
    }
}