<?php

namespace App\Services\Dashboard;

use App\Models\ActivityLog;
use App\Models\CheckRequisition;
use App\Models\Disbursement;
use App\Models\Invoice;
use App\Models\Project;
use App\Models\PurchaseOrder;
use App\Models\Vendor;
use Carbon\Carbon;

class UnifiedMetricsService
{
    /**
     * Widget 1: AP Aging Summary
     * Calculate based on invoices.due_date and invoice_status != 'paid'
     */
    public function getAPAgingSummary(?Carbon $start, ?Carbon $end): array
    {
        $today = Carbon::today();

        // Get all unpaid invoices
        $unpaidInvoices = Invoice::whereNotIn('invoice_status', ['paid', 'rejected'])
            ->whereNotNull('due_date')
            ->inDateRange($start, $end)
            ->get();

        $totalOutstanding = $unpaidInvoices->sum('net_amount');
        $totalOverdue = $unpaidInvoices->filter(function ($invoice) use ($today) {
            return Carbon::parse($invoice->due_date)->lt($today);
        })->sum('net_amount');

        // Initialize aging buckets
        $buckets = [
            '0_30' => ['count' => 0, 'amount' => 0.0],
            '31_60' => ['count' => 0, 'amount' => 0.0],
            '61_90' => ['count' => 0, 'amount' => 0.0],
            'over_90' => ['count' => 0, 'amount' => 0.0],
        ];

        // Categorize invoices into aging buckets based on days overdue
        foreach ($unpaidInvoices as $invoice) {
            $dueDate = Carbon::parse($invoice->due_date);
            $daysOverdue = $today->diffInDays($dueDate, false);

            // Skip if not overdue yet (positive days means future)
            if ($daysOverdue > 0) {
                continue;
            }

            $daysOverdue = abs($daysOverdue);
            $amount = (float) $invoice->net_amount;

            if ($daysOverdue <= 30) {
                $buckets['0_30']['count']++;
                $buckets['0_30']['amount'] += $amount;
            } elseif ($daysOverdue <= 60) {
                $buckets['31_60']['count']++;
                $buckets['31_60']['amount'] += $amount;
            } elseif ($daysOverdue <= 90) {
                $buckets['61_90']['count']++;
                $buckets['61_90']['amount'] += $amount;
            } else {
                $buckets['over_90']['count']++;
                $buckets['over_90']['amount'] += $amount;
            }
        }

        return [
            'total_outstanding' => (float) $totalOutstanding,
            'total_overdue' => (float) $totalOverdue,
            'aging_buckets' => $buckets,
        ];
    }

    /**
     * Widget 2: Invoice Pipeline Status Summary
     * Use invoice_status to count invoices in each stage
     */
    public function getInvoicePipelineStatus(?Carbon $start, ?Carbon $end): array
    {
        $statusCounts = Invoice::inDateRange($start, $end)
            ->selectRaw('invoice_status, COUNT(*) as count')
            ->groupBy('invoice_status')
            ->pluck('count', 'invoice_status')
            ->toArray();

        $total = Invoice::inDateRange($start, $end)->count();

        return [
            'pending' => $statusCounts['pending'] ?? 0,
            'received' => $statusCounts['received'] ?? 0,
            'in_progress' => $statusCounts['in_progress'] ?? 0,
            'approved' => $statusCounts['approved'] ?? 0,
            'pending_disbursement' => $statusCounts['pending_disbursement'] ?? 0,
            'rejected' => $statusCounts['rejected'] ?? 0,
            'paid' => $statusCounts['paid'] ?? 0,
            'total' => $total,
        ];
    }

    /**
     * Widget 3: PO Utilization Snapshot
     * Use po_amount, total_invoiced, total_paid from purchase_orders
     */
    public function getPOUtilizationSnapshot(?Carbon $start, ?Carbon $end): array
    {
        // Get all open POs in the date range
        $openPOs = PurchaseOrder::open()
            ->inDateRange($start, $end)
            ->get();

        // Calculate totals using stored columns
        $totalPOAmount = $openPOs->sum('po_amount');
        $totalInvoiced = $openPOs->sum('total_invoiced');
        $totalPaid = $openPOs->sum('total_paid');

        // Calculate percentages
        $invoicedPercentage = $totalPOAmount > 0 ? ($totalInvoiced / $totalPOAmount) * 100 : 0;
        $paidPercentage = $totalPOAmount > 0 ? ($totalPaid / $totalPOAmount) * 100 : 0;
        $remaining = $totalPOAmount - $totalPaid;

        return [
            'total_po_amount' => (float) $totalPOAmount,
            'total_invoiced' => (float) $totalInvoiced,
            'total_paid' => (float) $totalPaid,
            'invoiced_percentage' => round($invoicedPercentage, 2),
            'paid_percentage' => round($paidPercentage, 2),
            'remaining' => (float) $remaining,
        ];
    }

    /**
     * Widget 4: Upcoming Cash Out (7 / 15 / 30 Days)
     * Based on invoices.due_date with status in approved, pending_disbursement
     */
    public function getUpcomingCashOut(?Carbon $start, ?Carbon $end): array
    {
        $today = Carbon::today();
        $in7Days = $today->copy()->addDays(7);
        $in15Days = $today->copy()->addDays(15);
        $in30Days = $today->copy()->addDays(30);

        // Get invoices that are approved or pending disbursement (ready to pay)
        $upcomingInvoices = Invoice::whereIn('invoice_status', ['approved', 'pending_disbursement'])
            ->whereNotNull('due_date')
            ->get();

        // Calculate counts and amounts for each timeframe
        $due7 = $upcomingInvoices->filter(function ($invoice) use ($today, $in7Days) {
            $dueDate = Carbon::parse($invoice->due_date);
            return $dueDate->between($today, $in7Days);
        });

        $due15 = $upcomingInvoices->filter(function ($invoice) use ($today, $in15Days) {
            $dueDate = Carbon::parse($invoice->due_date);
            return $dueDate->between($today, $in15Days);
        });

        $due30 = $upcomingInvoices->filter(function ($invoice) use ($today, $in30Days) {
            $dueDate = Carbon::parse($invoice->due_date);
            return $dueDate->between($today, $in30Days);
        });

        return [
            'due_7_days' => ['count' => $due7->count(), 'amount' => (float) $due7->sum('net_amount')],
            'due_15_days' => ['count' => $due15->count(), 'amount' => (float) $due15->sum('net_amount')],
            'due_30_days' => ['count' => $due30->count(), 'amount' => (float) $due30->sum('net_amount')],
        ];
    }

    /**
     * Widget 5: Top Vendors by Outstanding
     * Query vendor → invoices → unpaid net_amount, sorted DESC
     */
    public function getTopVendorsByOutstanding(?Carbon $start, ?Carbon $end, int $limit = 10): array
    {
        // Get all unpaid invoices with vendor information
        $unpaidInvoices = Invoice::with('purchaseOrder.vendor')
            ->whereNotIn('invoice_status', ['paid', 'rejected'])
            ->inDateRange($start, $end)
            ->get();

        // Group by vendor and calculate totals
        $vendorData = $unpaidInvoices->groupBy(function ($invoice) {
            return $invoice->purchaseOrder?->vendor?->id;
        })->map(function ($invoices, $vendorId) {
            $firstInvoice = $invoices->first();
            $vendor = $firstInvoice->purchaseOrder?->vendor;

            return [
                'vendor_name' => $vendor?->name ?? 'Unknown Vendor',
                'outstanding_amount' => (float) $invoices->sum('net_amount'),
                'invoice_count' => $invoices->count(),
            ];
        })
        ->sortByDesc('outstanding_amount')
        ->take($limit)
        ->values()
        ->toArray();

        return $vendorData;
    }

    /**
     * Widget 6: Process Bottleneck Indicators
     * Compute avg time between SI Received → Reviewed → Approved → Disbursed
     */
    public function getProcessBottleneckIndicators(?Carbon $start, ?Carbon $end): array
    {
        // Get invoices that have moved through the pipeline
        $invoices = Invoice::whereNotNull('si_received_at')
            ->inDateRange($start, $end)
            ->get();

        // Calculate average time from received to reviewed (approved or in_progress)
        $receivedToReviewed = $invoices->filter(function ($invoice) {
            return $invoice->si_received_at && $invoice->reviewed_at;
        })->map(function ($invoice) {
            return Carbon::parse($invoice->si_received_at)->diffInDays(Carbon::parse($invoice->reviewed_at));
        });

        // Calculate average time from reviewed to approved
        $reviewedToApproved = $invoices->filter(function ($invoice) {
            return $invoice->reviewed_at && $invoice->approved_at && in_array($invoice->invoice_status, ['approved', 'pending_disbursement', 'paid']);
        })->map(function ($invoice) {
            return Carbon::parse($invoice->reviewed_at)->diffInDays(Carbon::parse($invoice->approved_at));
        });

        // Calculate average time from approved to disbursed (using check requisition → disbursement relationship)
        $approvedToDisbursed = Invoice::with(['checkRequisitions.disbursements'])
            ->whereIn('invoice_status', ['pending_disbursement', 'paid'])
            ->whereNotNull('approved_at')
            ->inDateRange($start, $end)
            ->get()
            ->filter(function ($invoice) {
                return $invoice->checkRequisitions->isNotEmpty()
                    && $invoice->checkRequisitions->first()->disbursements->isNotEmpty()
                    && $invoice->checkRequisitions->first()->disbursements->first()->date_check_printing;
            })
            ->map(function ($invoice) {
                $approvedAt = Carbon::parse($invoice->approved_at);
                $disbursedAt = Carbon::parse($invoice->checkRequisitions->first()->disbursements->first()->date_check_printing);
                return $approvedAt->diffInDays($disbursedAt);
            });

        // Count total invoices in pipeline (not paid or rejected)
        $totalInPipeline = Invoice::whereNotIn('invoice_status', ['paid', 'rejected'])
            ->inDateRange($start, $end)
            ->count();

        return [
            'avg_received_to_reviewed_days' => $receivedToReviewed->isNotEmpty() ? round($receivedToReviewed->avg(), 1) : 0.0,
            'avg_reviewed_to_approved_days' => $reviewedToApproved->isNotEmpty() ? round($reviewedToApproved->avg(), 1) : 0.0,
            'avg_approved_to_disbursed_days' => $approvedToDisbursed->isNotEmpty() ? round($approvedToDisbursed->avg(), 1) : 0.0,
            'total_in_pipeline' => $totalInPipeline,
        ];
    }

    /**
     * Widget 7: Project Spend Summary
     * For each active project: Total PO, Total invoiced, Total paid, Remaining balance
     */
    public function getProjectSpendSummary(?Carbon $start, ?Carbon $end, int $limit = 5): array
    {
        // Get active projects with their purchase orders
        $projects = Project::where(function ($q) {
            $q->where('project_status', 'active')
              ->orWhereNull('project_status')
              ->orWhere('project_status', '');
        })
        ->with(['purchaseOrders' => function ($query) use ($start, $end) {
            $query->whereIn('po_status', ['open', 'closed'])
                  ->when($start && $end, fn($q) => $q->whereBetween('finalized_at', [$start, $end]));
        }])
        ->get()
        ->map(function ($project) {
            $totalPO = $project->purchaseOrders->sum('po_amount');
            $totalInvoiced = $project->purchaseOrders->sum('total_invoiced');
            $totalPaid = $project->purchaseOrders->sum('total_paid');
            $remaining = $totalPO - $totalPaid;

            return [
                'project_name' => $project->project_title ?? $project->cer_number ?? 'Unknown Project',
                'total_po' => (float) $totalPO,
                'total_invoiced' => (float) $totalInvoiced,
                'total_paid' => (float) $totalPaid,
                'remaining' => (float) $remaining,
            ];
        })
        ->sortByDesc('total_po')
        ->take($limit)
        ->values()
        ->toArray();

        return $projects;
    }

    /**
     * Widget 8: Pending Approvals by Role
     * Counts based on invoices waiting for review, CRs with status pending_approval, POs pending finalization
     */
    public function getPendingApprovalsByRole(?Carbon $start, ?Carbon $end): array
    {
        // Invoices waiting for review (received or in_progress status)
        $invoicesWaitingReview = Invoice::whereIn('invoice_status', ['received', 'in_progress'])
            ->inDateRange($start, $end)
            ->count();

        // Check requisitions pending approval
        $checkRequisitionsPending = CheckRequisition::where('requisition_status', 'pending_approval')
            ->when($start && $end, fn($q) => $q->whereBetween('request_date', [$start, $end]))
            ->count();

        // POs pending finalization (draft status)
        $posPendingFinalization = PurchaseOrder::draft()
            ->when($start && $end, fn($q) => $q->whereBetween('created_at', [$start, $end]))
            ->count();

        $total = $invoicesWaitingReview + $checkRequisitionsPending + $posPendingFinalization;

        return [
            'invoices_waiting_review' => $invoicesWaitingReview,
            'check_requisitions_pending' => $checkRequisitionsPending,
            'pos_pending_finalization' => $posPendingFinalization,
            'total' => $total,
        ];
    }

    /**
     * Widget 9: Document Attachment Health
     * Track document completeness across POs, Invoices, and Check Requisitions
     */
    public function getComplianceMissingDocuments(?Carbon $start, ?Carbon $end): array
    {
        // Get total counts for each entity type
        $totalPOs = PurchaseOrder::inDateRange($start, $end)->count();
        $totalInvoices = Invoice::inDateRange($start, $end)->count();
        $totalCRs = CheckRequisition::when($start && $end, fn($q) => $q->whereBetween('request_date', [$start, $end]))->count();

        // Count entities WITH attachments using polymorphic relationship
        $posWithFiles = PurchaseOrder::inDateRange($start, $end)
            ->whereHas('files', fn($q) => $q->where('is_active', true))
            ->count();

        $invoicesWithFiles = Invoice::inDateRange($start, $end)
            ->whereHas('files', fn($q) => $q->where('is_active', true))
            ->count();

        $crsWithFiles = CheckRequisition::when($start && $end, fn($q) => $q->whereBetween('request_date', [$start, $end]))
            ->whereHas('files', fn($q) => $q->where('is_active', true))
            ->count();

        // Calculate completeness percentages
        $poCompleteness = $totalPOs > 0 ? ($posWithFiles / $totalPOs) * 100 : 100;
        $invoiceCompleteness = $totalInvoices > 0 ? ($invoicesWithFiles / $totalInvoices) * 100 : 100;
        $crCompleteness = $totalCRs > 0 ? ($crsWithFiles / $totalCRs) * 100 : 100;

        // Calculate overall score (weighted average)
        $overallScore = ($poCompleteness + $invoiceCompleteness + $crCompleteness) / 3;

        // Get lists of entities missing documents (limit to 10 each for performance)
        $posMissing = PurchaseOrder::inDateRange($start, $end)
            ->doesntHave('files')
            ->limit(10)
            ->get(['id', 'po_number'])
            ->map(fn($po) => ['id' => $po->id, 'po_number' => $po->po_number])
            ->toArray();

        $invoicesMissing = Invoice::inDateRange($start, $end)
            ->doesntHave('files')
            ->limit(10)
            ->get(['id', 'si_number'])
            ->map(fn($inv) => ['id' => $inv->id, 'si_number' => $inv->si_number])
            ->toArray();

        $crsMissing = CheckRequisition::when($start && $end, fn($q) => $q->whereBetween('request_date', [$start, $end]))
            ->doesntHave('files')
            ->limit(10)
            ->get(['id', 'requisition_number'])
            ->map(fn($cr) => ['id' => $cr->id, 'requisition_number' => $cr->requisition_number])
            ->toArray();

        return [
            'overall_score' => round($overallScore, 1),
            'po_completeness' => round($poCompleteness, 1),
            'invoice_completeness' => round($invoiceCompleteness, 1),
            'cr_completeness' => round($crCompleteness, 1),
            'total_pos' => $totalPOs,
            'pos_with_files' => $posWithFiles,
            'total_invoices' => $totalInvoices,
            'invoices_with_files' => $invoicesWithFiles,
            'total_crs' => $totalCRs,
            'crs_with_files' => $crsWithFiles,
            'pos_missing_attachments' => $posMissing,
            'invoices_missing_si' => $invoicesMissing,
            'crs_missing_docs' => $crsMissing,
        ];
    }

    /**
     * Widget 10: Recent Activity Feed
     * Source from activity_logs: paginated entries with user, entity, action, timestamp
     */
    public function getRecentActivityFeed(?Carbon $start, ?Carbon $end, int $page = 1, int $perPage = 10): array
    {
        // Fetch one extra to check if there are more records
        $offset = ($page - 1) * $perPage;

        $activities = ActivityLog::with(['user:id,name'])
            ->when($start && $end, fn($q) => $q->whereBetween('created_at', [$start, $end]))
            ->orderBy('created_at', 'desc')
            ->offset($offset)
            ->limit($perPage + 1)
            ->get();

        // Check if there are more records
        $hasMore = $activities->count() > $perPage;

        // Remove the extra record if we fetched it
        if ($hasMore) {
            $activities = $activities->take($perPage);
        }

        $data = $activities->map(function ($log) {
                // Determine entity type label
                $entityType = match($log->loggable_type) {
                    'App\\Models\\PurchaseOrder' => 'Purchase Order',
                    'App\\Models\\Invoice' => 'Invoice',
                    'App\\Models\\Vendor' => 'Vendor',
                    'App\\Models\\Project' => 'Project',
                    'App\\Models\\CheckRequisition' => 'Check Requisition',
                    'App\\Models\\Disbursement' => 'Disbursement',
                    default => 'Unknown'
                };

                // Try to get entity identifier
                $entityIdentifier = 'N/A';
                if ($log->loggable) {
                    $entityIdentifier = match($log->loggable_type) {
                        'App\\Models\\PurchaseOrder' => $log->loggable->po_number ?? 'N/A',
                        'App\\Models\\Invoice' => $log->loggable->si_number ?? 'N/A',
                        'App\\Models\\Vendor' => $log->loggable->name ?? 'N/A',
                        'App\\Models\\Project' => $log->loggable->project_title ?? $log->loggable->cer_number ?? 'N/A',
                        'App\\Models\\CheckRequisition' => $log->loggable->requisition_number ?? 'N/A',
                        'App\\Models\\Disbursement' => $log->loggable->check_voucher_number ?? 'N/A',
                        default => 'N/A'
                    };
                }

                return [
                    'id' => $log->id,
                    'user' => $log->user->name ?? 'System',
                    'entity_type' => $entityType,
                    'entity_id' => $log->loggable_id,
                    'entity_identifier' => $entityIdentifier,
                    'action' => $log->action,
                    'notes' => $log->notes,
                    'created_at' => $log->created_at->toISOString(),
                    'created_at_human' => $log->created_at->diffForHumans(),
                ];
            })
            ->toArray();

        return [
            'data' => $data,
            'hasMore' => $hasMore,
            'currentPage' => $page,
        ];
    }

    /**
     * Helper method to get date range filter (defaults to current month if not specified)
     */
    private function getMonthRange(?Carbon $start, ?Carbon $end): array
    {
        return ($start && $end)
            ? [$start, $end]
            : [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()];
    }
}
