<?php

namespace App\Services\Dashboard;

use App\Models\PurchaseOrder;
use App\Models\Invoice;
use App\Models\Vendor;
use App\Models\Project;
use App\Models\ActivityLog;
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

    public function getActionableItems(?Carbon $start, ?Carbon $end): array
    {
        $sevenDaysAgo = Carbon::now()->subDays(7);

        return [
            'draft_pos' => PurchaseOrder::draft()
                ->when($start && $end, fn($q) => $q->whereBetween('created_at', [$start, $end]))
                ->count(),

            'rejected_invoices' => Invoice::where('invoice_status', 'rejected')
                ->inDateRange($start, $end)
                ->count(),

            'overdue_submissions' => Invoice::where('invoice_status', 'pending')
                ->whereNotNull('due_date')
                ->where('due_date', '<', Carbon::now())
                ->inDateRange($start, $end)
                ->count(),

            'old_drafts' => PurchaseOrder::draft()
                ->where('created_at', '<', $sevenDaysAgo)
                ->count(),
        ];
    }

    public function getPOStatusOverview(?Carbon $start, ?Carbon $end): array
    {
        $filterRange = $this->getMonthRange($start, $end);

        return [
            'draft' => PurchaseOrder::draft()
                ->when($start && $end, fn($q) => $q->whereBetween('created_at', [$start, $end]))
                ->count(),

            'open' => PurchaseOrder::open()
                ->inDateRange($start, $end)
                ->count(),

            'closed' => PurchaseOrder::closed()
                ->inDateRange($start, $end)
                ->count(),

            'cancelled' => PurchaseOrder::cancelled()
                ->inDateRange($start, $end)
                ->count(),

            'total' => PurchaseOrder::inDateRange($start, $end)->count(),

            'created_this_month' => PurchaseOrder::whereBetween('created_at', $filterRange)->count(),

            'closed_this_month' => PurchaseOrder::closed()
                ->whereBetween('closed_at', $filterRange)
                ->count(),

            'total_value_php' => (float) (PurchaseOrder::open()
                ->where('currency', 'PHP')
                ->inDateRange($start, $end)
                ->sum('po_amount') ?? 0),

            'total_value_usd' => (float) (PurchaseOrder::open()
                ->where('currency', 'USD')
                ->inDateRange($start, $end)
                ->sum('po_amount') ?? 0),
        ];
    }

    public function getInvoiceStatusTracking(?Carbon $start, ?Carbon $end): array
    {
        return [
            'pending' => Invoice::where('invoice_status', 'pending')
                ->inDateRange($start, $end)
                ->count(),

            'received' => Invoice::where('invoice_status', 'received')
                ->inDateRange($start, $end)
                ->count(),

            'in_progress' => Invoice::where('invoice_status', 'in_progress')
                ->inDateRange($start, $end)
                ->count(),

            'approved' => Invoice::where('invoice_status', 'approved')
                ->inDateRange($start, $end)
                ->count(),

            'rejected' => Invoice::where('invoice_status', 'rejected')
                ->inDateRange($start, $end)
                ->count(),

            'pending_disbursement' => Invoice::where('invoice_status', 'pending_disbursement')
                ->inDateRange($start, $end)
                ->count(),

            'paid' => Invoice::where('invoice_status', 'paid')
                ->inDateRange($start, $end)
                ->count(),

            'total' => Invoice::inDateRange($start, $end)->count(),
        ];
    }

    public function getVendorMetrics(?Carbon $start, ?Carbon $end, int $limit = 5): array
    {
        $activeVendors = Vendor::where('is_active', true)->count();
        $sapVendors = Vendor::where('is_active', true)->where('category', 'SAP')->count();
        $manualVendors = Vendor::where('is_active', true)->where('category', 'Manual')->count();

        // Get top vendors by total PO value
        $topVendors = PurchaseOrder::select('vendor_id')
            ->selectRaw('COUNT(*) as po_count')
            ->selectRaw('SUM(po_amount) as total_value')
            ->selectRaw('MAX(currency) as currency')
            ->whereIn('po_status', ['open', 'closed'])
            ->when($start && $end, fn($q) => $q->whereBetween('created_at', [$start, $end]))
            ->groupBy('vendor_id')
            ->orderByDesc('total_value')
            ->limit($limit)
            ->get()
            ->map(function($data) {
                $vendor = Vendor::find($data->vendor_id);
                return [
                    'id' => $data->vendor_id,
                    'name' => $vendor?->name ?? 'Unknown',
                    'po_count' => $data->po_count,
                    'total_value' => (float) $data->total_value,
                    'currency' => $data->currency ?? 'PHP',
                    'category' => $vendor?->category ?? 'Manual',
                ];
            })
            ->toArray();

        return [
            'active_vendors' => $activeVendors,
            'sap_vendors' => $sapVendors,
            'manual_vendors' => $manualVendors,
            'top_vendors' => $topVendors,
        ];
    }

    public function getProjectMetrics(?Carbon $start, ?Carbon $end, int $limit = 5): array
    {
        // Include projects with 'active' status OR null/empty status (treat as active)
        $activeProjects = Project::where(function($q) {
            $q->where('project_status', 'active')
              ->orWhereNull('project_status')
              ->orWhere('project_status', '');
        })->count();

        $smProjects = Project::where(function($q) {
            $q->where('project_status', 'active')
              ->orWhereNull('project_status')
              ->orWhere('project_status', '');
        })
        ->where('project_type', 'sm_project')
        ->count();

        $philcomProjects = Project::where(function($q) {
            $q->where('project_status', 'active')
              ->orWhereNull('project_status')
              ->orWhere('project_status', '');
        })
        ->where('project_type', 'philcom_project')
        ->count();

        // Get top projects by spending (treat null/empty status as active)
        $topProjects = Project::where(function($q) {
            $q->where('project_status', 'active')
              ->orWhereNull('project_status')
              ->orWhere('project_status', '');
        })
        ->with(['purchaseOrders' => function($query) {
            $query->whereIn('po_status', ['open', 'closed']);
        }])
        ->get()
        ->map(function($project) {
            $totalSpent = $project->purchaseOrders->sum('po_amount');
            $poCount = $project->purchaseOrders->count();

            $utilizationPercentage = $project->total_contract_cost > 0
                ? ($totalSpent / $project->total_contract_cost) * 100
                : 0;

            return [
                'id' => $project->id,
                'project_title' => $project->project_title,
                'cer_number' => $project->cer_number,
                'project_type' => $project->project_type,
                'total_contract_cost' => (float) $project->total_contract_cost,
                'total_spent' => (float) $totalSpent,
                'po_count' => $poCount,
                'utilization_percentage' => round($utilizationPercentage, 2),
            ];
        })
        ->sortByDesc('total_spent')
        ->take($limit)
        ->values()
        ->toArray();

        return [
            'active_projects' => $activeProjects,
            'sm_projects' => $smProjects,
            'philcom_projects' => $philcomProjects,
            'top_projects' => $topProjects,
        ];
    }

    public function getActivityTimeline(?Carbon $start, ?Carbon $end, int $limit = 10): array
    {
        return ActivityLog::with(['user:id,name'])
            ->whereIn('loggable_type', [
                'App\Models\PurchaseOrder',
                'App\Models\Invoice',
                'App\Models\Vendor',
                'App\Models\Project'
            ])
            ->when($start && $end, fn($q) => $q->whereBetween('created_at', [$start, $end]))
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function($log) {
                // Get entity type and name
                $entityType = match($log->loggable_type) {
                    'App\Models\PurchaseOrder' => 'purchase_order',
                    'App\Models\Invoice' => 'invoice',
                    'App\Models\Vendor' => 'vendor',
                    'App\Models\Project' => 'project',
                    default => 'unknown'
                };

                $entityName = 'Unknown';
                if ($log->loggable) {
                    $entityName = match($entityType) {
                        'purchase_order' => $log->loggable->po_number ?? 'Unknown PO',
                        'invoice' => $log->loggable->si_number ?? 'Unknown Invoice',
                        'vendor' => $log->loggable->name ?? 'Unknown Vendor',
                        'project' => $log->loggable->project_title ?? 'Unknown Project',
                        default => 'Unknown'
                    };
                }

                // Extract metadata
                $metadata = [];
                if ($entityType === 'purchase_order' && $log->loggable) {
                    $metadata['status'] = $log->loggable->po_status;
                    $metadata['amount'] = (float) $log->loggable->po_amount;
                    $metadata['currency'] = $log->loggable->currency;
                } elseif ($entityType === 'invoice' && $log->loggable) {
                    $metadata['status'] = $log->loggable->invoice_status;
                    $metadata['amount'] = (float) $log->loggable->net_amount;
                    $metadata['currency'] = $log->loggable->currency;
                }

                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'entity_type' => $entityType,
                    'entity_id' => $log->loggable_id,
                    'entity_name' => $entityName,
                    'user_name' => $log->user->name ?? 'System',
                    'created_at' => $log->created_at->toISOString(),
                    'metadata' => count($metadata) > 0 ? $metadata : null,
                ];
            })
            ->toArray();
    }

    private function getMonthRange(?Carbon $start, ?Carbon $end): array
    {
        return ($start && $end)
            ? [$start, $end]
            : [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()];
    }
}
