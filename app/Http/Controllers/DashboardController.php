<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\PurchaseOrder;
use App\Models\CheckRequisition;
use App\Models\Disbursement;
use App\Models\Project;
use App\Enums\UserRole;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $dateRange = $this->getDateRange($request);

        // Get alerts for all roles
        $alerts = $this->getAlerts($user->role, $dateRange);

        // Get role-specific data
        $data = match($user->role) {
            UserRole::PURCHASING => $this->getPurchasingData($request, $dateRange),
            UserRole::PAYABLES => $this->getPayablesData($request, $dateRange),
            UserRole::DISBURSEMENT => $this->getDisbursementData($request, $dateRange),
            UserRole::ADMIN => $this->getAdminData($request, $dateRange),
        };

        // Add common data
        $data['alerts'] = $alerts;
        $data['timeRange'] = [
            'range' => $request->input('range', 'all'),
            'start' => $dateRange[0]?->toDateString(),
            'end' => $dateRange[1]?->toDateString(),
        ];

        return inertia('dashboard/dashboard', $data);
    }

    /**
     * Get date range based on request parameters
     */
    private function getDateRange(Request $request): array
    {
        $range = $request->input('range', 'all');

        return match($range) {
            'today' => [Carbon::today(), Carbon::tomorrow()],
            'week' => [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()],
            'month' => [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()],
            'quarter' => [Carbon::now()->startOfQuarter(), Carbon::now()->endOfQuarter()],
            'year' => [Carbon::now()->startOfYear(), Carbon::now()->endOfYear()],
            'fiscal' => $this->getFiscalYearRange(),
            'custom' => [
                $request->input('start') ? Carbon::parse($request->input('start')) : null,
                $request->input('end') ? Carbon::parse($request->input('end')) : null,
            ],
            default => [null, null], // 'all' - no filtering
        };
    }

    /**
     * Get fiscal year range (assuming fiscal year starts April 1)
     */
    private function getFiscalYearRange(): array
    {
        $now = Carbon::now();
        $fiscalStart = $now->month >= 4
            ? Carbon::create($now->year, 4, 1)
            : Carbon::create($now->year - 1, 4, 1);

        return [$fiscalStart, $fiscalStart->copy()->addYear()->subDay()];
    }

    /**
     * Get purchasing dashboard data
     */
    private function getPurchasingData(Request $request, array $dateRange): array
    {
        return [
            'role' => 'purchasing',
            // New compact widgets
            'financialCommitments' => $this->getFinancialCommitments($dateRange),
            'vendorPerformance' => $this->getVendorPerformance($dateRange),
            'poStatusSummary' => $this->getPOStatusSummary($dateRange),
            'currencySummary' => $this->getCurrencySummary($dateRange),
            'recentPOActivity' => $this->getRecentPOActivity($dateRange),
            // Old chart-based widgets (kept for future use)
            // 'poStatusDistribution' => $this->getPOStatusDistribution($dateRange),
            // 'poAging' => $this->getPOAging($dateRange),
            // 'budgetTracking' => $this->getBudgetTracking($dateRange),
            // 'currencyBreakdown' => $this->getCurrencyBreakdown($dateRange),
            // 'poCreationTrend' => $this->getPOCreationTrend($dateRange),
            // 'expectedDeliveries' => $this->getExpectedDeliveries($dateRange),
        ];
    }

    /**
     * Get payables dashboard data
     */
    private function getPayablesData(Request $request, array $dateRange): array
    {
        return [
            'role' => 'payables',
            'invoiceReviewQueue' => $this->getInvoiceReviewQueue($dateRange),
            'crApprovalQueue' => $this->getCRApprovalQueue($dateRange),
            'invoiceAging' => $this->getInvoiceAging($dateRange),
            'paymentSchedule' => $this->getPaymentSchedule($dateRange),
            'invoiceStatusFunnel' => $this->getInvoiceStatusFunnel($dateRange),
            'financialMetrics' => $this->getPayablesFinancialMetrics($dateRange),
            'approvalVelocity' => $this->getApprovalVelocity($dateRange),
        ];
    }

    /**
     * Get disbursement dashboard data
     */
    private function getDisbursementData(Request $request, array $dateRange): array
    {
        return [
            'role' => 'disbursement',
            'checkSchedule' => $this->getCheckSchedule($dateRange),
            'printingQueue' => $this->getPrintingQueue($dateRange),
            'pendingReleases' => $this->getPendingReleases($dateRange),
            'disbursementTrends' => $this->getDisbursementTrends($dateRange),
            'checkAging' => $this->getCheckAging($dateRange),
            'vendorPaymentStatus' => $this->getVendorPaymentStatus($dateRange),
            'disbursementMetrics' => $this->getDisbursementMetrics($dateRange),
            'releaseVelocity' => $this->getReleaseVelocity($dateRange),
        ];
    }

    /**
     * Get admin dashboard data (includes all role dashboards)
     */
    private function getAdminData(Request $request, array $dateRange): array
    {
        return [
            'role' => 'admin',
            // Purchasing Dashboard Data (New compact widgets)
            'purchasing' => [
                'financialCommitments' => $this->getFinancialCommitments($dateRange),
                'vendorPerformance' => $this->getVendorPerformance($dateRange),
                'poStatusSummary' => $this->getPOStatusSummary($dateRange),
                'currencySummary' => $this->getCurrencySummary($dateRange),
                'recentPOActivity' => $this->getRecentPOActivity($dateRange),
                // Old chart-based widgets (commented for future use)
                // 'poStatusDistribution' => $this->getPOStatusDistribution($dateRange),
                // 'poAging' => $this->getPOAging($dateRange),
                // 'budgetTracking' => $this->getBudgetTracking($dateRange),
                // 'currencyBreakdown' => $this->getCurrencyBreakdown($dateRange),
                // 'poCreationTrend' => $this->getPOCreationTrend($dateRange),
                // 'expectedDeliveries' => $this->getExpectedDeliveries($dateRange),
            ],
            // Payables Dashboard Data
            'payables' => [
                'invoiceReviewQueue' => $this->getInvoiceReviewQueue($dateRange),
                'crApprovalQueue' => $this->getCRApprovalQueue($dateRange),
                'invoiceAging' => $this->getInvoiceAging($dateRange),
                'paymentSchedule' => $this->getPaymentSchedule($dateRange),
                'invoiceStatusFunnel' => $this->getInvoiceStatusFunnel($dateRange),
                'financialMetrics' => $this->getPayablesFinancialMetrics($dateRange),
                'approvalVelocity' => $this->getApprovalVelocity($dateRange),
            ],
            // Disbursement Dashboard Data
            'disbursement' => [
                'checkSchedule' => $this->getCheckSchedule($dateRange),
                'printingQueue' => $this->getPrintingQueue($dateRange),
                'pendingReleases' => $this->getPendingReleases($dateRange),
                'disbursementTrends' => $this->getDisbursementTrends($dateRange),
                'checkAging' => $this->getCheckAging($dateRange),
                'vendorPaymentStatus' => $this->getVendorPaymentStatus($dateRange),
                'disbursementMetrics' => $this->getDisbursementMetrics($dateRange),
                'releaseVelocity' => $this->getReleaseVelocity($dateRange),
            ],
        ];
    }

    /**
     * Get alerts for the dashboard
     */
    private function getAlerts(UserRole $role, array $dateRange): array
    {
        $alerts = [];

        // Overdue Invoices (All roles)
        $overdueCount = Invoice::where('due_date', '<', now())
            ->whereNotIn('invoice_status', ['paid', 'rejected'])
            ->count();

        if ($overdueCount > 0) {
            $alerts[] = [
                'id' => 'overdue-invoices',
                'category' => 'invoice',
                'priority' => 'urgent',
                'title' => 'Overdue Invoices',
                'message' => "$overdueCount invoice(s) past due date",
                'count' => $overdueCount,
                'action_url' => '/invoices?filter=overdue',
                'created_at' => now()->toISOString(),
            ];
        }

        // Budget Threshold Alerts (Purchasing & Admin)
        if (in_array($role, [UserRole::PURCHASING, UserRole::ADMIN])) {
            $criticalProjects = Project::whereRaw('
                (SELECT COALESCE(SUM(po_amount), 0) FROM purchase_orders
                 WHERE project_id = projects.id
                 AND po_status IN (?, ?)) / NULLIF(total_contract_cost, 0) > 0.95
            ', ['open', 'closed'])->count();

            if ($criticalProjects > 0) {
                $alerts[] = [
                    'id' => 'budget-critical',
                    'category' => 'budget',
                    'priority' => 'urgent',
                    'title' => 'Budget Exceeded',
                    'message' => "$criticalProjects project(s) over 95% budget",
                    'count' => $criticalProjects,
                    'action_url' => '/projects?filter=over_budget',
                    'created_at' => now()->toISOString(),
                ];
            }
        }

        // Invoice Review Bottleneck (Payables & Admin)
        if (in_array($role, [UserRole::PAYABLES, UserRole::ADMIN])) {
            $stuckInvoices = Invoice::where('invoice_status', 'in_progress')
                ->where('si_received_at', '<', Carbon::now()->subDays(7))
                ->count();

            if ($stuckInvoices > 0) {
                $alerts[] = [
                    'id' => 'invoice-bottleneck',
                    'category' => 'approval',
                    'priority' => 'high',
                    'title' => 'Invoice Review Bottleneck',
                    'message' => "$stuckInvoices invoice(s) in review for over 7 days",
                    'count' => $stuckInvoices,
                    'action_url' => '/invoices?filter=stuck',
                    'created_at' => now()->toISOString(),
                ];
            }
        }

        // CR Approval Delay (Payables & Admin)
        if (in_array($role, [UserRole::PAYABLES, UserRole::ADMIN])) {
            $delayedCRs = CheckRequisition::where('requisition_status', 'pending_approval')
                ->where('request_date', '<', Carbon::now()->subDays(3))
                ->count();

            if ($delayedCRs > 0) {
                $alerts[] = [
                    'id' => 'cr-approval-delay',
                    'category' => 'approval',
                    'priority' => 'high',
                    'title' => 'CR Approval Delays',
                    'message' => "$delayedCRs check requisition(s) pending approval for over 3 days",
                    'count' => $delayedCRs,
                    'action_url' => '/check-requisitions?filter=pending',
                    'created_at' => now()->toISOString(),
                ];
            }
        }

        // Disbursement Delay (Disbursement & Admin)
        if (in_array($role, [UserRole::DISBURSEMENT, UserRole::ADMIN])) {
            $delayedDisbursements = Disbursement::whereNotNull('date_check_scheduled')
                ->whereNull('date_check_released_to_vendor')
                ->where('date_check_scheduled', '<', Carbon::now()->subDays(14))
                ->count();

            if ($delayedDisbursements > 0) {
                $alerts[] = [
                    'id' => 'disbursement-delay',
                    'category' => 'disbursement',
                    'priority' => 'medium',
                    'title' => 'Disbursement Delays',
                    'message' => "$delayedDisbursements check(s) scheduled but not released for over 14 days",
                    'count' => $delayedDisbursements,
                    'action_url' => '/disbursements?filter=delayed',
                    'created_at' => now()->toISOString(),
                ];
            }
        }

        // Sort by priority
        return collect($alerts)
            ->sortBy(function($alert) {
                $priorities = ['urgent' => 0, 'high' => 1, 'medium' => 2, 'low' => 3];
                return $priorities[$alert['priority']] ?? 99;
            })
            ->values()
            ->toArray();
    }

    // Placeholder methods for widget data (to be implemented in Phase 2-4)

    private function getPOStatusDistribution(array $dateRange)
    {
        $cacheKey = 'dashboard.po_status_distribution.' . md5(json_encode($dateRange));

        return Cache::remember($cacheKey, 300, function () use ($dateRange) {
            $query = PurchaseOrder::selectRaw('
                po_status as status,
                currency,
                COUNT(*) as count,
                SUM(po_amount) as total_amount
            ')
            ->groupBy('po_status', 'currency');

            // Apply date filter if provided
            if ($dateRange[0] && $dateRange[1]) {
                $query->whereBetween('finalized_at', $dateRange);
            }

            return $query->get()->map(function ($item) {
                return [
                    'status' => $item->status,
                    'currency' => $item->currency ?? 'PHP',
                    'count' => $item->count,
                    'total_amount' => (float) $item->total_amount,
                ];
            })->toArray();
        });
    }
    private function getPOAging(array $dateRange)
    {
        $cacheKey = 'dashboard.po_aging.' . md5(json_encode($dateRange));

        return Cache::remember($cacheKey, 300, function () use ($dateRange) {
            $query = PurchaseOrder::where('po_status', 'open')
                ->whereNotNull('expected_delivery_date');

            if ($dateRange[0] && $dateRange[1]) {
                $query->whereBetween('finalized_at', $dateRange);
            }

            $pos = $query->get();

            // Group by aging buckets in PHP for database compatibility
            $buckets = [
                'Overdue' => ['count' => 0, 'total_amount' => 0],
                '0-7 days' => ['count' => 0, 'total_amount' => 0],
                '8-30 days' => ['count' => 0, 'total_amount' => 0],
                '31-60 days' => ['count' => 0, 'total_amount' => 0],
                '60+ days' => ['count' => 0, 'total_amount' => 0],
            ];

            foreach ($pos as $po) {
                $deliveryDate = Carbon::parse($po->expected_delivery_date);
                $daysUntil = $deliveryDate->diffInDays(Carbon::now(), false);

                if ($daysUntil < 0) {
                    $bucket = 'Overdue';
                } elseif ($daysUntil <= 7) {
                    $bucket = '0-7 days';
                } elseif ($daysUntil <= 30) {
                    $bucket = '8-30 days';
                } elseif ($daysUntil <= 60) {
                    $bucket = '31-60 days';
                } else {
                    $bucket = '60+ days';
                }

                $buckets[$bucket]['count']++;
                $buckets[$bucket]['total_amount'] += $po->po_amount;
            }

            return collect($buckets)->map(function($data, $bucket) {
                return [
                    'bucket' => $bucket,
                    'count' => $data['count'],
                    'total_amount' => (float) $data['total_amount'],
                ];
            })->filter(function($item) {
                return $item['count'] > 0; // Only return buckets with data
            })->values()->toArray();
        });
    }

    private function getFinancialCommitments(array $dateRange)
    {
        $cacheKey = 'dashboard.financial_commitments.' . md5(json_encode($dateRange));

        return Cache::remember($cacheKey, 300, function () use ($dateRange) {
            $openPOValuePHP = PurchaseOrder::where('po_status', 'open')
                ->where('currency', 'PHP')
                ->sum('po_amount') ?? 0;

            $openPOValueUSD = PurchaseOrder::where('po_status', 'open')
                ->where('currency', 'USD')
                ->sum('po_amount') ?? 0;

            $thisMonth = [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()];

            $posCreatedThisMonth = PurchaseOrder::whereBetween('finalized_at', $thisMonth)
                ->count();

            $averagePOValue = PurchaseOrder::where('po_status', 'open')
                ->avg('po_amount') ?? 0;

            $posClosedThisMonth = PurchaseOrder::whereBetween('closed_at', $thisMonth)
                ->count();

            return [
                'open_po_value_php' => (float) $openPOValuePHP,
                'open_po_value_usd' => (float) $openPOValueUSD,
                'pos_created_this_month' => $posCreatedThisMonth,
                'average_po_value' => (float) $averagePOValue,
                'pos_closed_this_month' => $posClosedThisMonth,
            ];
        });
    }

    private function getBudgetTracking(array $dateRange)
    {
        $cacheKey = 'dashboard.budget_tracking.' . md5(json_encode($dateRange));

        return Cache::remember($cacheKey, 300, function () use ($dateRange) {
            return Project::where('project_status', 'active')
                ->with(['purchaseOrders' => function($q) {
                    $q->whereIn('po_status', ['open', 'closed']);
                }])
                ->get()
                ->map(function($project) {
                    $committed = $project->purchaseOrders->sum('po_amount');
                    $budget = $project->total_contract_cost ?? 0;
                    $percentage = $budget > 0 ? ($committed / $budget) * 100 : 0;

                    return [
                        'project_id' => $project->id,
                        'project_title' => $project->project_title,
                        'budget' => (float) $budget,
                        'committed' => (float) $committed,
                        'remaining' => (float) ($budget - $committed),
                        'percentage' => round($percentage, 2),
                        'status' => $percentage > 95 ? 'critical' : ($percentage > 80 ? 'warning' : 'normal'),
                    ];
                })
                ->filter(function($item) {
                    return $item['budget'] > 0; // Only show projects with budgets
                })
                ->values()
                ->toArray();
        });
    }

    private function getVendorPerformance(array $dateRange)
    {
        $cacheKey = 'dashboard.vendor_performance.' . md5(json_encode($dateRange));

        return Cache::remember($cacheKey, 300, function () use ($dateRange) {
            $query = PurchaseOrder::with('vendor')
                ->where('po_status', 'open')
                ->selectRaw('
                    vendor_id,
                    COUNT(*) as active_pos,
                    SUM(po_amount) as total_committed
                ')
                ->groupBy('vendor_id')
                ->orderByDesc('total_committed')
                ->limit(5);

            if ($dateRange[0] && $dateRange[1]) {
                $query->whereBetween('finalized_at', $dateRange);
            }

            return $query->get()->map(function($item) {
                return [
                    'vendor_id' => $item->vendor_id,
                    'vendor_name' => $item->vendor->name ?? 'Unknown Vendor',
                    'active_pos' => $item->active_pos,
                    'total_committed' => (float) $item->total_committed,
                ];
            })->toArray();
        });
    }

    private function getCurrencyBreakdown(array $dateRange)
    {
        $cacheKey = 'dashboard.currency_breakdown.' . md5(json_encode($dateRange));

        return Cache::remember($cacheKey, 300, function () use ($dateRange) {
            $query = PurchaseOrder::where('po_status', 'open')
                ->selectRaw('
                    currency,
                    COUNT(*) as count,
                    SUM(po_amount) as total_amount
                ')
                ->groupBy('currency');

            if ($dateRange[0] && $dateRange[1]) {
                $query->whereBetween('finalized_at', $dateRange);
            }

            return $query->get()->map(function($item) {
                return [
                    'currency' => $item->currency ?? 'PHP',
                    'count' => $item->count,
                    'total_amount' => (float) $item->total_amount,
                ];
            })->toArray();
        });
    }

    private function getPOCreationTrend(array $dateRange)
    {
        $cacheKey = 'dashboard.po_creation_trend.' . md5(json_encode($dateRange));

        return Cache::remember($cacheKey, 300, function () use ($dateRange) {
            // Default to last 6 months if no date range provided
            $start = $dateRange[0] ?? Carbon::now()->subMonths(6);
            $end = $dateRange[1] ?? Carbon::now();

            return PurchaseOrder::whereBetween('finalized_at', [$start, $end])
                ->selectRaw('
                    DATE(finalized_at) as date,
                    COUNT(*) as count,
                    SUM(po_amount) as amount
                ')
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(function($item) {
                    return [
                        'date' => $item->date,
                        'count' => $item->count,
                        'amount' => (float) $item->amount,
                    ];
                })
                ->toArray();
        });
    }

    private function getExpectedDeliveries(array $dateRange)
    {
        $cacheKey = 'dashboard.expected_deliveries.' . md5(json_encode($dateRange));

        return Cache::remember($cacheKey, 300, function () use ($dateRange) {
            $deliveries = PurchaseOrder::with(['vendor', 'project'])
                ->where('po_status', 'open')
                ->whereBetween('expected_delivery_date', [
                    Carbon::now(),
                    Carbon::now()->addDays(30)
                ])
                ->orderBy('expected_delivery_date')
                ->get();

            // Group by week
            $grouped = $deliveries->groupBy(function($po) {
                return Carbon::parse($po->expected_delivery_date)->format('Y-W');
            });

            return $grouped->map(function($weekPOs, $weekKey) {
                $firstPO = $weekPOs->first();
                $weekStart = Carbon::parse($firstPO->expected_delivery_date)->startOfWeek();

                return [
                    'week' => $weekStart->format('M d') . ' - ' . $weekStart->copy()->endOfWeek()->format('M d, Y'),
                    'deliveries' => $weekPOs->map(function($po) {
                        return [
                            'id' => $po->id,
                            'po_number' => $po->po_number,
                            'vendor_name' => $po->vendor->name ?? 'Unknown',
                            'project_title' => $po->project->project_title ?? 'N/A',
                            'po_amount' => (float) $po->po_amount,
                            'expected_delivery_date' => $po->expected_delivery_date,
                        ];
                    })->toArray(),
                ];
            })->values()->toArray();
        });
    }

    private function getInvoiceReviewQueue(array $dateRange)
    {
        $cacheKey = 'dashboard.invoice_review_queue.' . md5(json_encode($dateRange));

        return Cache::remember($cacheKey, 300, function () use ($dateRange) {
            $query = Invoice::with(['vendor', 'purchaseOrder.project'])
                ->whereIn('invoice_status', ['received', 'in_progress', 'pending']);

            if ($dateRange[0] && $dateRange[1]) {
                $query->whereBetween('si_received_at', $dateRange);
            }

            return $query->get()
                ->sortBy(function($invoice) {
                    // Sort overdue first, then by due date
                    if ($invoice->due_date && Carbon::parse($invoice->due_date)->isPast()) {
                        return 0; // Overdue comes first
                    }
                    return $invoice->due_date ? Carbon::parse($invoice->due_date)->timestamp : PHP_INT_MAX;
                })
                ->take(20)
                ->map(function($invoice) {
                    $agingDays = $invoice->si_received_at
                        ? Carbon::parse($invoice->si_received_at)->diffInDays(Carbon::now())
                        : 0;

                    return [
                        'id' => $invoice->id,
                        'si_number' => $invoice->si_number,
                        'vendor_name' => $invoice->vendor->name ?? 'Unknown',
                        'invoice_status' => $invoice->invoice_status,
                        'net_amount' => (float) $invoice->net_amount,
                        'currency' => $invoice->currency,
                        'due_date' => $invoice->due_date,
                        'si_received_at' => $invoice->si_received_at,
                        'aging_days' => $agingDays,
                        'is_overdue' => $invoice->due_date && Carbon::parse($invoice->due_date)->isPast(),
                    ];
                })->values()->toArray();
        });
    }

    private function getCRApprovalQueue(array $dateRange)
    {
        $cacheKey = 'dashboard.cr_approval_queue.' . md5(json_encode($dateRange));

        return Cache::remember($cacheKey, 300, function () use ($dateRange) {
            $query = CheckRequisition::with(['generator', 'invoices'])
                ->where('requisition_status', 'pending_approval')
                ->orderBy('request_date', 'asc');

            if ($dateRange[0] && $dateRange[1]) {
                $query->whereBetween('request_date', $dateRange);
            }

            return $query->limit(10)->get()->map(function($cr) {
                return [
                    'id' => $cr->id,
                    'requisition_number' => $cr->requisition_number,
                    'requisition_status' => $cr->requisition_status,
                    'php_amount' => (float) $cr->php_amount,
                    'request_date' => $cr->request_date,
                    'payee_name' => $cr->payee_name,
                    'invoice_count' => $cr->invoices->count(),
                    'generator_name' => $cr->generator->name ?? 'Unknown',
                    'days_pending' => Carbon::parse($cr->request_date)->diffInDays(Carbon::now()),
                ];
            })->toArray();
        });
    }

    private function getInvoiceAging(array $dateRange)
    {
        $cacheKey = 'dashboard.invoice_aging.' . md5(json_encode($dateRange));

        return Cache::remember($cacheKey, 300, function () use ($dateRange) {
            $query = Invoice::whereIn('invoice_status', ['approved', 'pending_disbursement', 'received', 'in_progress'])
                ->whereNotNull('due_date');

            if ($dateRange[0] && $dateRange[1]) {
                $query->whereBetween('si_received_at', $dateRange);
            }

            $invoices = $query->get();

            // Group by aging buckets in PHP for database compatibility
            $buckets = [
                'Overdue' => ['count' => 0, 'total_amount' => 0],
                '0-7 days' => ['count' => 0, 'total_amount' => 0],
                '8-30 days' => ['count' => 0, 'total_amount' => 0],
                '31-60 days' => ['count' => 0, 'total_amount' => 0],
                '60+ days' => ['count' => 0, 'total_amount' => 0],
            ];

            foreach ($invoices as $invoice) {
                $dueDate = Carbon::parse($invoice->due_date);
                $daysUntil = $dueDate->diffInDays(Carbon::now(), false);

                if ($daysUntil < 0) {
                    $bucket = 'Overdue';
                } elseif ($daysUntil <= 7) {
                    $bucket = '0-7 days';
                } elseif ($daysUntil <= 30) {
                    $bucket = '8-30 days';
                } elseif ($daysUntil <= 60) {
                    $bucket = '31-60 days';
                } else {
                    $bucket = '60+ days';
                }

                $buckets[$bucket]['count']++;
                $buckets[$bucket]['total_amount'] += $invoice->net_amount;
            }

            return collect($buckets)->map(function($data, $bucket) {
                return [
                    'bucket' => $bucket,
                    'count' => $data['count'],
                    'total_amount' => (float) $data['total_amount'],
                ];
            })->filter(function($item) {
                return $item['count'] > 0; // Only return buckets with data
            })->values()->toArray();
        });
    }

    private function getPaymentSchedule(array $dateRange)
    {
        $cacheKey = 'dashboard.payment_schedule.' . md5(json_encode($dateRange));

        return Cache::remember($cacheKey, 300, function () use ($dateRange) {
            $invoices = Invoice::with(['vendor', 'purchaseOrder'])
                ->whereIn('invoice_status', ['approved', 'pending_disbursement'])
                ->whereNotNull('due_date')
                ->whereBetween('due_date', [
                    Carbon::now(),
                    Carbon::now()->addDays(30)
                ])
                ->orderBy('due_date')
                ->get();

            // Group by week
            $grouped = $invoices->groupBy(function($invoice) {
                return Carbon::parse($invoice->due_date)->format('Y-W');
            });

            return $grouped->map(function($weekInvoices, $weekKey) {
                $firstInvoice = $weekInvoices->first();
                $weekStart = Carbon::parse($firstInvoice->due_date)->startOfWeek();

                return [
                    'week' => $weekStart->format('M d') . ' - ' . $weekStart->copy()->endOfWeek()->format('M d, Y'),
                    'total_amount' => (float) $weekInvoices->sum('net_amount'),
                    'invoices' => $weekInvoices->map(function($invoice) {
                        return [
                            'id' => $invoice->id,
                            'si_number' => $invoice->si_number,
                            'vendor_name' => $invoice->vendor->name ?? 'Unknown',
                            'net_amount' => (float) $invoice->net_amount,
                            'due_date' => $invoice->due_date,
                            'invoice_status' => $invoice->invoice_status,
                        ];
                    })->toArray(),
                ];
            })->values()->toArray();
        });
    }

    private function getInvoiceStatusFunnel(array $dateRange)
    {
        $cacheKey = 'dashboard.invoice_status_funnel.' . md5(json_encode($dateRange));

        return Cache::remember($cacheKey, 300, function () use ($dateRange) {
            $query = Invoice::selectRaw('
                invoice_status as status,
                COUNT(*) as count
            ')
            ->groupBy('invoice_status')
            ->orderByRaw("CASE invoice_status
                WHEN 'pending' THEN 1
                WHEN 'received' THEN 2
                WHEN 'in_progress' THEN 3
                WHEN 'approved' THEN 4
                WHEN 'pending_disbursement' THEN 5
                WHEN 'paid' THEN 6
                ELSE 7
            END");

            if ($dateRange[0] && $dateRange[1]) {
                $query->whereBetween('si_received_at', $dateRange);
            }

            return $query->get()->map(function($item) {
                return [
                    'status' => $item->status,
                    'count' => $item->count,
                ];
            })->toArray();
        });
    }

    private function getPayablesFinancialMetrics(array $dateRange)
    {
        $cacheKey = 'dashboard.payables_financial_metrics.' . md5(json_encode($dateRange));

        return Cache::remember($cacheKey, 300, function () use ($dateRange) {
            $outstandingBalance = Invoice::whereIn('invoice_status', ['approved', 'pending_disbursement'])
                ->sum('net_amount') ?? 0;

            $pendingReviewAmount = Invoice::whereIn('invoice_status', ['received', 'in_progress'])
                ->sum('net_amount') ?? 0;

            $thisMonth = [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()];

            $approvedThisMonth = Invoice::where('invoice_status', 'approved')
                ->whereBetween('reviewed_at', $thisMonth)
                ->sum('net_amount') ?? 0;

            // Calculate average approval time (from received to approved) in PHP for database compatibility
            $approvedInvoices = Invoice::where('invoice_status', 'approved')
                ->whereNotNull('si_received_at')
                ->whereNotNull('reviewed_at')
                ->get(['si_received_at', 'reviewed_at']);

            $avgApprovalTime = 0;
            if ($approvedInvoices->isNotEmpty()) {
                $totalDays = $approvedInvoices->sum(function($invoice) {
                    return Carbon::parse($invoice->si_received_at)->diffInDays(Carbon::parse($invoice->reviewed_at));
                });
                $avgApprovalTime = $totalDays / $approvedInvoices->count();
            }

            return [
                'outstanding_balance' => (float) $outstandingBalance,
                'pending_review_amount' => (float) $pendingReviewAmount,
                'approved_this_month' => (float) $approvedThisMonth,
                'average_approval_time' => round($avgApprovalTime, 1),
            ];
        });
    }

    private function getApprovalVelocity(array $dateRange)
    {
        $cacheKey = 'dashboard.approval_velocity.' . md5(json_encode($dateRange));

        return Cache::remember($cacheKey, 300, function () use ($dateRange) {
            // Default to last 30 days if no date range provided
            $start = $dateRange[0] ?? Carbon::now()->subDays(30);
            $end = $dateRange[1] ?? Carbon::now();

            return Invoice::where('invoice_status', 'approved')
                ->whereNotNull('reviewed_at')
                ->whereBetween('reviewed_at', [$start, $end])
                ->selectRaw('
                    DATE(reviewed_at) as date,
                    COUNT(*) as count
                ')
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(function($item) {
                    return [
                        'date' => $item->date,
                        'count' => $item->count,
                    ];
                })
                ->toArray();
        });
    }

    private function getCheckSchedule(array $dateRange)
    {
        $cacheKey = 'dashboard.check_schedule.' . md5(json_encode($dateRange));

        return Cache::remember($cacheKey, 300, function () use ($dateRange) {
            $checks = Disbursement::with(['checkRequisitions.invoices', 'checkRequisitions.generator'])
                ->whereNotNull('date_check_scheduled')
                ->whereNull('date_check_released_to_vendor')
                ->whereBetween('date_check_scheduled', [
                    Carbon::now(),
                    Carbon::now()->addDays(30)
                ])
                ->orderBy('date_check_scheduled')
                ->get();

            // Group by week
            $grouped = $checks->groupBy(function($disbursement) {
                return Carbon::parse($disbursement->date_check_scheduled)->format('Y-W');
            });

            return $grouped->map(function($weekChecks, $weekKey) {
                $firstCheck = $weekChecks->first();
                $weekStart = Carbon::parse($firstCheck->date_check_scheduled)->startOfWeek();

                // Calculate total from check requisitions
                $totalAmount = $weekChecks->sum(function($disbursement) {
                    return $disbursement->checkRequisitions->sum('php_amount');
                });

                return [
                    'week' => $weekStart->format('M d') . ' - ' . $weekStart->copy()->endOfWeek()->format('M d, Y'),
                    'total_amount' => (float) $totalAmount,
                    'checks' => $weekChecks->map(function($disbursement) {
                        $checkReq = $disbursement->checkRequisitions->first();
                        return [
                            'id' => $disbursement->id,
                            'check_number' => $disbursement->check_voucher_number,
                            'payee_name' => $checkReq->payee_name ?? 'N/A',
                            'php_amount' => (float) $disbursement->checkRequisitions->sum('php_amount'),
                            'date_check_scheduled' => $disbursement->date_check_scheduled,
                            'payment_method' => 'check', // Default for disbursements
                            'requisition_number' => $checkReq->requisition_number ?? 'N/A',
                        ];
                    })->toArray(),
                ];
            })->values()->toArray();
        });
    }

    private function getPrintingQueue(array $dateRange)
    {
        $cacheKey = 'dashboard.printing_queue.' . md5(json_encode($dateRange));

        return Cache::remember($cacheKey, 300, function () use ($dateRange) {
            $query = Disbursement::with(['checkRequisitions'])
                ->whereNull('date_check_printing')
                ->whereNotNull('date_check_scheduled')
                ->orderBy('date_check_scheduled');

            if ($dateRange[0] && $dateRange[1]) {
                $query->whereBetween('date_check_scheduled', $dateRange);
            }

            return $query->limit(15)->get()->map(function($disbursement) {
                $checkReq = $disbursement->checkRequisitions->first();
                return [
                    'id' => $disbursement->id,
                    'requisition_number' => $checkReq->requisition_number ?? 'N/A',
                    'payee_name' => $checkReq->payee_name ?? 'N/A',
                    'php_amount' => (float) $disbursement->checkRequisitions->sum('php_amount'),
                    'date_check_scheduled' => $disbursement->date_check_scheduled,
                    'days_waiting' => Carbon::parse($disbursement->date_check_scheduled)->diffInDays(Carbon::now()),
                ];
            })->toArray();
        });
    }

    private function getPendingReleases(array $dateRange)
    {
        $cacheKey = 'dashboard.pending_releases.' . md5(json_encode($dateRange));

        return Cache::remember($cacheKey, 300, function () use ($dateRange) {
            $query = Disbursement::with(['checkRequisitions'])
                ->whereNotNull('date_check_printing')
                ->whereNull('date_check_released_to_vendor')
                ->orderBy('date_check_printing');

            if ($dateRange[0] && $dateRange[1]) {
                $query->whereBetween('date_check_printing', $dateRange);
            }

            return $query->limit(20)->get()->map(function($disbursement) {
                $checkReq = $disbursement->checkRequisitions->first();
                return [
                    'id' => $disbursement->id,
                    'check_number' => $disbursement->check_voucher_number,
                    'requisition_number' => $checkReq->requisition_number ?? 'N/A',
                    'payee_name' => $checkReq->payee_name ?? 'N/A',
                    'php_amount' => (float) $disbursement->checkRequisitions->sum('php_amount'),
                    'date_check_printed' => $disbursement->date_check_printing,
                    'days_pending' => $disbursement->date_check_printing ? Carbon::parse($disbursement->date_check_printing)->diffInDays(Carbon::now()) : 0,
                    'payment_method' => 'check',
                ];
            })->toArray();
        });
    }

    private function getDisbursementTrends(array $dateRange)
    {
        $cacheKey = 'dashboard.disbursement_trends.' . md5(json_encode($dateRange));

        return Cache::remember($cacheKey, 300, function () use ($dateRange) {
            // Default to last 30 days if no date range provided
            $start = $dateRange[0] ?? Carbon::now()->subDays(30);
            $end = $dateRange[1] ?? Carbon::now();

            // Get disbursements with check requisitions to calculate amounts
            $disbursements = Disbursement::with('checkRequisitions')
                ->whereNotNull('date_check_released_to_vendor')
                ->whereBetween('date_check_released_to_vendor', [$start, $end])
                ->orderBy('date_check_released_to_vendor')
                ->get();

            // Group by date and calculate totals in PHP
            $grouped = $disbursements->groupBy(function($disbursement) {
                return Carbon::parse($disbursement->date_check_released_to_vendor)->format('Y-m-d');
            });

            return $grouped->map(function($items, $date) {
                $totalAmount = $items->sum(function($disbursement) {
                    return $disbursement->checkRequisitions->sum('php_amount');
                });

                return [
                    'date' => $date,
                    'count' => $items->count(),
                    'amount' => (float) $totalAmount,
                ];
            })->sortBy('date')->values()->toArray();
        });
    }

    private function getCheckAging(array $dateRange)
    {
        $cacheKey = 'dashboard.check_aging.' . md5(json_encode($dateRange));

        return Cache::remember($cacheKey, 300, function () use ($dateRange) {
            $query = Disbursement::with('checkRequisitions')
                ->whereNotNull('date_check_scheduled')
                ->whereNull('date_check_released_to_vendor');

            if ($dateRange[0] && $dateRange[1]) {
                $query->whereBetween('date_check_scheduled', $dateRange);
            }

            $disbursements = $query->get();

            // Group by aging buckets in PHP for database compatibility
            $buckets = [
                'Overdue for Printing' => ['count' => 0, 'total_amount' => 0],
                'Scheduled (Not Printed)' => ['count' => 0, 'total_amount' => 0],
                'Printed (0-7 days)' => ['count' => 0, 'total_amount' => 0],
                'Printed (8-14 days)' => ['count' => 0, 'total_amount' => 0],
                'Printed (>14 days)' => ['count' => 0, 'total_amount' => 0],
            ];

            foreach ($disbursements as $disbursement) {
                if ($disbursement->date_check_printing === null) {
                    // Not printed yet
                    $scheduledDate = Carbon::parse($disbursement->date_check_scheduled);
                    if ($scheduledDate->isPast()) {
                        $bucket = 'Overdue for Printing';
                    } else {
                        $bucket = 'Scheduled (Not Printed)';
                    }
                } else {
                    // Already printed
                    $daysSincePrinted = Carbon::parse($disbursement->date_check_printing)->diffInDays(Carbon::now());
                    if ($daysSincePrinted > 14) {
                        $bucket = 'Printed (>14 days)';
                    } elseif ($daysSincePrinted > 7) {
                        $bucket = 'Printed (8-14 days)';
                    } else {
                        $bucket = 'Printed (0-7 days)';
                    }
                }

                $buckets[$bucket]['count']++;
                $buckets[$bucket]['total_amount'] += $disbursement->checkRequisitions->sum('php_amount');
            }

            return collect($buckets)->map(function($data, $bucket) {
                return [
                    'bucket' => $bucket,
                    'count' => $data['count'],
                    'total_amount' => (float) $data['total_amount'],
                ];
            })->filter(function($item) {
                return $item['count'] > 0; // Only return buckets with data
            })->values()->toArray();
        });
    }

    private function getVendorPaymentStatus(array $dateRange)
    {
        $cacheKey = 'dashboard.vendor_payment_status.' . md5(json_encode($dateRange));

        return Cache::remember($cacheKey, 300, function () use ($dateRange) {
            $query = Disbursement::with('checkRequisitions');

            if ($dateRange[0] && $dateRange[1]) {
                $query->whereBetween('date_check_scheduled', $dateRange);
            }

            $disbursements = $query->get();

            // Group by payee name and calculate stats in PHP
            $grouped = $disbursements->flatMap(function($disbursement) {
                return $disbursement->checkRequisitions->map(function($cr) use ($disbursement) {
                    return [
                        'payee_name' => $cr->payee_name,
                        'php_amount' => $cr->php_amount,
                        'is_released' => $disbursement->date_check_released_to_vendor !== null,
                        'last_payment_date' => $disbursement->date_check_released_to_vendor,
                    ];
                });
            })->groupBy('payee_name');

            return $grouped->map(function($payments, $payeeName) {
                $releasedCount = $payments->where('is_released', true)->count();
                $totalAmount = $payments->sum('php_amount');
                $lastPayment = $payments->where('is_released', true)->max('last_payment_date');

                return [
                    'payee_name' => $payeeName,
                    'total_checks' => $payments->count(),
                    'released_checks' => $releasedCount,
                    'pending_checks' => $payments->count() - $releasedCount,
                    'total_amount' => (float) $totalAmount,
                    'last_payment_date' => $lastPayment,
                ];
            })
            ->sortByDesc('total_amount')
            ->take(10)
            ->values()
            ->toArray();
        });
    }

    private function getDisbursementMetrics(array $dateRange)
    {
        $cacheKey = 'dashboard.disbursement_metrics.' . md5(json_encode($dateRange));

        return Cache::remember($cacheKey, 300, function () use ($dateRange) {
            $checksReadyToPrint = Disbursement::whereNull('date_check_printing')
                ->whereNotNull('date_check_scheduled')
                ->count();

            $checksPendingRelease = Disbursement::whereNotNull('date_check_printing')
                ->whereNull('date_check_released_to_vendor')
                ->count();

            $thisMonth = [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()];

            // Calculate amounts from check requisitions
            $releasedThisMonth = Disbursement::with('checkRequisitions')
                ->whereNotNull('date_check_released_to_vendor')
                ->whereBetween('date_check_released_to_vendor', $thisMonth)
                ->get()
                ->sum(function($disbursement) {
                    return $disbursement->checkRequisitions->sum('php_amount');
                });

            $totalPendingValue = Disbursement::with('checkRequisitions')
                ->whereNull('date_check_released_to_vendor')
                ->whereNotNull('date_check_scheduled')
                ->get()
                ->sum(function($disbursement) {
                    return $disbursement->checkRequisitions->sum('php_amount');
                });

            return [
                'checks_ready_to_print' => $checksReadyToPrint,
                'checks_pending_release' => $checksPendingRelease,
                'released_this_month' => (float) $releasedThisMonth,
                'total_pending_value' => (float) $totalPendingValue,
            ];
        });
    }

    private function getReleaseVelocity(array $dateRange)
    {
        $cacheKey = 'dashboard.release_velocity.' . md5(json_encode($dateRange));

        return Cache::remember($cacheKey, 300, function () use ($dateRange) {
            // Default to last 30 days if no date range provided
            $start = $dateRange[0] ?? Carbon::now()->subDays(30);
            $end = $dateRange[1] ?? Carbon::now();

            return Disbursement::whereNotNull('date_check_released_to_vendor')
                ->whereBetween('date_check_released_to_vendor', [$start, $end])
                ->selectRaw('
                    DATE(date_check_released_to_vendor) as date,
                    COUNT(*) as count
                ')
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(function($item) {
                    return [
                        'date' => $item->date,
                        'count' => $item->count,
                    ];
                })
                ->toArray();
        });
    }

    // New compact widget methods for Purchasing Dashboard

    private function getPOStatusSummary(array $dateRange)
    {
        $cacheKey = 'dashboard.po_status_summary.' . md5(json_encode($dateRange));

        return Cache::remember($cacheKey, 300, function () use ($dateRange) {
            $thisMonth = [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()];

            return [
                'draft' => PurchaseOrder::where('po_status', 'draft')->count(),
                'open' => PurchaseOrder::where('po_status', 'open')->count(),
                'closed_this_month' => PurchaseOrder::where('po_status', 'closed')
                    ->whereBetween('closed_at', $thisMonth)
                    ->count(),
                'cancelled_this_month' => PurchaseOrder::where('po_status', 'cancelled')
                    ->whereBetween('updated_at', $thisMonth)
                    ->count(),
            ];
        });
    }

    private function getCurrencySummary(array $dateRange)
    {
        $cacheKey = 'dashboard.currency_summary.' . md5(json_encode($dateRange));

        return Cache::remember($cacheKey, 300, function () use ($dateRange) {
            $phpData = PurchaseOrder::where('po_status', 'open')
                ->where('currency', 'PHP')
                ->selectRaw('COUNT(*) as count, SUM(po_amount) as total')
                ->first();

            $usdData = PurchaseOrder::where('po_status', 'open')
                ->where('currency', 'USD')
                ->selectRaw('COUNT(*) as count, SUM(po_amount) as total')
                ->first();

            return [
                'php_count' => $phpData->count ?? 0,
                'php_total' => (float) ($phpData->total ?? 0),
                'usd_count' => $usdData->count ?? 0,
                'usd_total' => (float) ($usdData->total ?? 0),
            ];
        });
    }

    private function getRecentPOActivity(array $dateRange)
    {
        $cacheKey = 'dashboard.recent_po_activity.' . md5(json_encode($dateRange));

        return Cache::remember($cacheKey, 300, function () use ($dateRange) {
            return PurchaseOrder::with(['vendor', 'project'])
                ->whereNotNull('finalized_at')
                ->orderBy('finalized_at', 'desc')
                ->limit(8)
                ->get()
                ->map(function($po) {
                    return [
                        'id' => $po->id,
                        'po_number' => $po->po_number,
                        'vendor_name' => $po->vendor->name ?? 'Unknown Vendor',
                        'project_code' => $po->project->project_code ?? 'N/A',
                        'total_amount' => (float) $po->po_amount,
                        'currency' => $po->currency ?? 'PHP',
                        'status' => $po->po_status,
                        'created_at' => $po->finalized_at,
                    ];
                })
                ->toArray();
        });
    }

}
