<?php

namespace App\Services\Dashboard;

use App\Models\Invoice;
use App\Models\CheckRequisition;
use Carbon\Carbon;

class PayablesMetricsService
{
    public function getFinancialMetrics(?Carbon $start, ?Carbon $end): array
    {
        $filterRange = $this->getMonthRange($start, $end);

        $outstandingBalance = Invoice::whereIn('invoice_status', ['approved', 'pending_disbursement'])
            ->inDateRange($start, $end)
            ->sum('net_amount') ?? 0;

        $pendingReviewAmount = Invoice::whereIn('invoice_status', ['received', 'in_progress'])
            ->inDateRange($start, $end)
            ->sum('net_amount') ?? 0;

        $approvedInRange = Invoice::approved()
            ->whereBetween('reviewed_at', $filterRange)
            ->sum('net_amount') ?? 0;

        // Calculate average approval time
        $approvedInvoices = Invoice::approved()
            ->whereNotNull('si_received_at')
            ->whereNotNull('reviewed_at')
            ->when($start && $end, fn($q) => $q->whereBetween('reviewed_at', [$start, $end]))
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
            'approved_this_month' => (float) $approvedInRange,
            'average_approval_time' => round($avgApprovalTime, 1),
        ];
    }

    public function getInvoiceReviewQueue(?Carbon $start, ?Carbon $end, int $limit = 20): array
    {
        return Invoice::with(['vendor:vendors.id,name', 'purchaseOrder:id,po_number'])
            ->pending()
            ->inDateRange($start, $end)
            ->get()
            ->sortBy(function($invoice) {
                // Overdue invoices first
                if ($invoice->due_date && Carbon::parse($invoice->due_date)->isPast()) {
                    return 0;
                }
                return $invoice->due_date ? Carbon::parse($invoice->due_date)->timestamp : PHP_INT_MAX;
            })
            ->take($limit)
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
            })
            ->values()
            ->toArray();
    }

    public function getCRApprovalQueue(?Carbon $start, ?Carbon $end, int $limit = 10): array
    {
        return CheckRequisition::with(['generator:id,name', 'invoices:id'])
            ->pendingApproval()
            ->inDateRange($start, $end)
            ->orderBy('request_date', 'asc')
            ->limit($limit)
            ->get()
            ->map(function($cr) {
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
            })
            ->toArray();
    }

    public function getInvoiceAging(?Carbon $start, ?Carbon $end): array
    {
        $invoices = Invoice::whereIn('invoice_status', ['approved', 'pending_disbursement', 'received', 'in_progress'])
            ->whereNotNull('due_date')
            ->inDateRange($start, $end)
            ->get();

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
        })->filter(fn($item) => $item['count'] > 0)
            ->values()
            ->toArray();
    }

    public function getPaymentSchedule(?Carbon $start, ?Carbon $end): array
    {
        $invoices = Invoice::with(['vendor:vendors.id,name', 'purchaseOrder:id,po_number'])
            ->whereIn('invoice_status', ['approved', 'pending_disbursement'])
            ->whereNotNull('due_date')
            ->whereBetween('due_date', [
                Carbon::now(),
                Carbon::now()->addDays(30)
            ])
            ->orderBy('due_date')
            ->get();

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
    }

    private function getMonthRange(?Carbon $start, ?Carbon $end): array
    {
        return ($start && $end)
            ? [$start, $end]
            : [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()];
    }
}
