<?php

namespace App\Services\Dashboard;

use App\Models\Disbursement;
use Carbon\Carbon;

class DisbursementMetricsService
{
    public function getFinancialMetrics(?Carbon $start, ?Carbon $end): array
    {
        $filterRange = $this->getMonthRange($start, $end);

        $checksReadyToPrint = Disbursement::pendingPrinting()
            ->inDateRange($start, $end)
            ->count();

        $checksPendingRelease = Disbursement::pendingRelease()
            ->when($start && $end, fn($q) => $q->whereBetween('date_check_printing', [$start, $end]))
            ->count();

        $releasedInRange = Disbursement::with('checkRequisitions')
            ->released()
            ->whereBetween('date_check_released_to_vendor', $filterRange)
            ->get()
            ->sum(function($disbursement) {
                return $disbursement->checkRequisitions->sum('php_amount');
            });

        $totalPendingValue = Disbursement::with('checkRequisitions')
            ->whereNull('date_check_released_to_vendor')
            ->scheduled()
            ->inDateRange($start, $end)
            ->get()
            ->sum(function($disbursement) {
                return $disbursement->checkRequisitions->sum('php_amount');
            });

        return [
            'checks_ready_to_print' => $checksReadyToPrint,
            'checks_pending_release' => $checksPendingRelease,
            'released_this_month' => (float) $releasedInRange,
            'total_pending_value' => (float) $totalPendingValue,
        ];
    }

    public function getPrintingQueue(?Carbon $start, ?Carbon $end, int $limit = 15): array
    {
        return Disbursement::with(['checkRequisitions'])
            ->pendingPrinting()
            ->inDateRange($start, $end)
            ->orderBy('date_check_scheduled')
            ->limit($limit)
            ->get()
            ->map(function($disbursement) {
                $checkReq = $disbursement->checkRequisitions->first();
                return [
                    'id' => $disbursement->id,
                    'requisition_number' => $checkReq->requisition_number ?? 'N/A',
                    'payee_name' => $checkReq->payee_name ?? 'N/A',
                    'php_amount' => (float) $disbursement->checkRequisitions->sum('php_amount'),
                    'date_check_scheduled' => $disbursement->date_check_scheduled,
                    'days_waiting' => Carbon::parse($disbursement->date_check_scheduled)->diffInDays(Carbon::now()),
                ];
            })
            ->toArray();
    }

    public function getPendingReleases(?Carbon $start, ?Carbon $end, int $limit = 20): array
    {
        return Disbursement::with(['checkRequisitions'])
            ->pendingRelease()
            ->when($start && $end, fn($q) => $q->whereBetween('date_check_printing', [$start, $end]))
            ->orderBy('date_check_printing')
            ->limit($limit)
            ->get()
            ->map(function($disbursement) {
                $checkReq = $disbursement->checkRequisitions->first();
                return [
                    'id' => $disbursement->id,
                    'check_number' => $disbursement->check_voucher_number,
                    'requisition_number' => $checkReq->requisition_number ?? 'N/A',
                    'payee_name' => $checkReq->payee_name ?? 'N/A',
                    'php_amount' => (float) $disbursement->checkRequisitions->sum('php_amount'),
                    'date_check_printed' => $disbursement->date_check_printing,
                    'days_pending' => $disbursement->date_check_printing
                        ? Carbon::parse($disbursement->date_check_printing)->diffInDays(Carbon::now())
                        : 0,
                    'payment_method' => 'check',
                ];
            })
            ->toArray();
    }

    public function getCheckSchedule(?Carbon $start, ?Carbon $end): array
    {
        $checks = Disbursement::with(['checkRequisitions.invoices', 'checkRequisitions.generator'])
            ->scheduled()
            ->whereNull('date_check_released_to_vendor')
            ->whereBetween('date_check_scheduled', [
                Carbon::now(),
                Carbon::now()->addDays(30)
            ])
            ->orderBy('date_check_scheduled')
            ->get();

        $grouped = $checks->groupBy(function($disbursement) {
            return Carbon::parse($disbursement->date_check_scheduled)->format('Y-W');
        });

        return $grouped->map(function($weekChecks, $weekKey) {
            $firstCheck = $weekChecks->first();
            $weekStart = Carbon::parse($firstCheck->date_check_scheduled)->startOfWeek();

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
                        'payment_method' => 'check',
                        'requisition_number' => $checkReq->requisition_number ?? 'N/A',
                    ];
                })->toArray(),
            ];
        })->values()->toArray();
    }

    public function getCheckAging(?Carbon $start, ?Carbon $end): array
    {
        $disbursements = Disbursement::with('checkRequisitions')
            ->scheduled()
            ->whereNull('date_check_released_to_vendor')
            ->inDateRange($start, $end)
            ->get();

        $buckets = [
            'Overdue for Printing' => ['count' => 0, 'total_amount' => 0],
            'Scheduled (Not Printed)' => ['count' => 0, 'total_amount' => 0],
            'Printed (0-7 days)' => ['count' => 0, 'total_amount' => 0],
            'Printed (8-14 days)' => ['count' => 0, 'total_amount' => 0],
            'Printed (>14 days)' => ['count' => 0, 'total_amount' => 0],
        ];

        foreach ($disbursements as $disbursement) {
            if ($disbursement->date_check_printing === null) {
                $scheduledDate = Carbon::parse($disbursement->date_check_scheduled);
                $bucket = $scheduledDate->isPast() ? 'Overdue for Printing' : 'Scheduled (Not Printed)';
            } else {
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
        })->filter(fn($item) => $item['count'] > 0)
            ->values()
            ->toArray();
    }

    private function getMonthRange(?Carbon $start, ?Carbon $end): array
    {
        return ($start && $end)
            ? [$start, $end]
            : [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()];
    }
}
