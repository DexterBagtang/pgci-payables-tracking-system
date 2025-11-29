<?php

namespace App\Services\Dashboard;

use App\Models\PurchaseOrder;
use App\Models\Invoice;
use Carbon\Carbon;

class PurchasingMetricsService
{
    public function getFinancialCommitments(?Carbon $start, ?Carbon $end): array
    {
        $filterRange = $this->getMonthRange($start, $end);

        return [
            'open_po_value_php' => (float) (PurchaseOrder::open()
                ->where('currency', 'PHP')
                ->inDateRange($start, $end)
                ->sum('po_amount') ?? 0),

            'open_po_value_usd' => (float) (PurchaseOrder::open()
                ->where('currency', 'USD')
                ->inDateRange($start, $end)
                ->sum('po_amount') ?? 0),

            'pos_created_this_month' => PurchaseOrder::whereBetween('finalized_at', $filterRange)->count(),

            'pos_closed_this_month' => PurchaseOrder::closed()
                ->whereBetween('closed_at', $filterRange)
                ->count(),

            'total_invoices' => Invoice::inDateRange($start, $end)->count(),

            'invoices_this_month' => Invoice::whereBetween('si_received_at', $filterRange)->count(),

            'pending_invoices' => Invoice::pending()->inDateRange($start, $end)->count(),

            'total_invoice_amount' => (float) (Invoice::inDateRange($start, $end)->sum('net_amount') ?? 0),

            'average_po_value' => (float) (PurchaseOrder::open()
                ->inDateRange($start, $end)
                ->avg('po_amount') ?? 0),
        ];
    }

    public function getVendorPerformance(?Carbon $start, ?Carbon $end, int $limit = 10): array
    {
        return PurchaseOrder::with([
                'vendor:id,name',
                'invoices:id,purchase_order_id,net_amount,invoice_status'
            ])
            ->open()
            ->inDateRange($start, $end)
            ->selectRaw('
                vendor_id,
                COUNT(*) as active_pos,
                SUM(po_amount) as total_committed,
                MAX(currency) as currency
            ')
            ->groupBy('vendor_id')
            ->orderByDesc('total_committed')
            ->limit($limit)
            ->get()
            ->map(fn($po) => [
                'vendor_id' => $po->vendor_id,
                'vendor_name' => $po->vendor->name ?? 'Unknown',
                'active_pos' => $po->active_pos,
                'total_committed' => (float) $po->total_committed,
                'total_invoiced' => (float) $po->invoices->sum('net_amount'),
                'total_paid' => (float) $po->invoices->where('invoice_status', 'paid')->sum('net_amount'),
                'outstanding_balance' => (float) $po->invoices
                    ->whereNotIn('invoice_status', ['paid', 'rejected', 'cancelled'])
                    ->sum('net_amount'),
                'invoice_count' => $po->invoices->count(),
                'currency' => $po->currency ?? 'PHP',
            ])
            ->toArray();
    }

    public function getPOStatusSummary(?Carbon $start, ?Carbon $end): array
    {
        $filterRange = $this->getMonthRange($start, $end);

        return [
            'draft' => PurchaseOrder::draft()
                ->when($start && $end, fn($q) => $q->whereBetween('created_at', [$start, $end]))
                ->count(),

            'open' => PurchaseOrder::open()
                ->inDateRange($start, $end)
                ->count(),

            'closed_this_month' => PurchaseOrder::closed()
                ->whereBetween('closed_at', $filterRange)
                ->count(),

            'cancelled_this_month' => PurchaseOrder::cancelled()
                ->whereBetween('updated_at', $filterRange)
                ->count(),
        ];
    }

    public function getCurrencySummary(?Carbon $start, ?Carbon $end): array
    {
        $phpData = PurchaseOrder::open()
            ->where('currency', 'PHP')
            ->inDateRange($start, $end)
            ->selectRaw('COUNT(*) as count, SUM(po_amount) as total')
            ->first();

        $usdData = PurchaseOrder::open()
            ->where('currency', 'USD')
            ->inDateRange($start, $end)
            ->selectRaw('COUNT(*) as count, SUM(po_amount) as total')
            ->first();

        return [
            'php_count' => $phpData->count ?? 0,
            'php_total' => (float) ($phpData->total ?? 0),
            'usd_count' => $usdData->count ?? 0,
            'usd_total' => (float) ($usdData->total ?? 0),
        ];
    }

    public function getRecentInvoices(?Carbon $start, ?Carbon $end, int $limit = 8): array
    {
        return Invoice::with(['vendor:vendors.id,name', 'purchaseOrder:id,po_number'])
            ->whereNotNull('si_received_at')
            ->inDateRange($start, $end)
            ->orderBy('si_received_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn($invoice) => [
                'id' => $invoice->id,
                'si_number' => $invoice->si_number,
                'vendor_name' => $invoice->vendor->name ?? 'Unknown',
                'po_number' => $invoice->purchaseOrder->po_number ?? 'N/A',
                'net_amount' => (float) $invoice->net_amount,
                'currency' => $invoice->currency ?? 'PHP',
                'invoice_status' => $invoice->invoice_status,
                'si_received_at' => $invoice->si_received_at,
            ])
            ->toArray();
    }

    private function getMonthRange(?Carbon $start, ?Carbon $end): array
    {
        return ($start && $end)
            ? [$start, $end]
            : [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()];
    }
}
