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
        // Get vendor-level PO aggregates
        $vendorData = PurchaseOrder::select('vendor_id')
            ->selectRaw('COUNT(*) as active_pos')
            ->selectRaw('SUM(po_amount) as total_committed')
            ->selectRaw('MAX(currency) as currency')
            ->open()
            ->inDateRange($start, $end)
            ->groupBy('vendor_id')
            ->orderByDesc('total_committed')
            ->limit($limit)
            ->get();

        // For each vendor, calculate invoice metrics
        return $vendorData->map(function($data) use ($start, $end) {
            // Get all POs for this vendor in the date range
            $vendorPOs = PurchaseOrder::where('vendor_id', $data->vendor_id)
                ->open()
                ->inDateRange($start, $end)
                ->pluck('id');

            // Get invoice data for these POs
            $invoices = \App\Models\Invoice::whereIn('purchase_order_id', $vendorPOs)->get();

            // Get vendor name
            $vendor = \App\Models\Vendor::find($data->vendor_id);

            return [
                'vendor_id' => $data->vendor_id,
                'vendor_name' => $vendor->name ?? 'Unknown',
                'active_pos' => $data->active_pos,
                'total_committed' => (float) $data->total_committed,
                'total_invoiced' => (float) $invoices->sum('net_amount'),
                'total_paid' => (float) $invoices->where('invoice_status', 'paid')->sum('net_amount'),
                'outstanding_balance' => (float) $invoices
                    ->whereNotIn('invoice_status', ['paid', 'rejected', 'cancelled'])
                    ->sum('net_amount'),
                'invoice_count' => $invoices->count(),
                'currency' => $data->currency ?? 'PHP',
            ];
        })->toArray();
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
