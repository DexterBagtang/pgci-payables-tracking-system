<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\Dashboard\DisbursementMetricsService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DisbursementWidgetController extends Controller
{
    public function __construct(
        private DisbursementMetricsService $service
    ) {}

    public function financialMetrics(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        return response()->json(
            $this->service->getFinancialMetrics($start, $end)
        );
    }

    public function printingQueue(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        return response()->json(
            $this->service->getPrintingQueue($start, $end)
        );
    }

    public function pendingReleases(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        return response()->json(
            $this->service->getPendingReleases($start, $end)
        );
    }

    public function checkSchedule(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        return response()->json(
            $this->service->getCheckSchedule($start, $end)
        );
    }

    public function checkAging(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        return response()->json(
            $this->service->getCheckAging($start, $end)
        );
    }

    private function getDateRange(Request $request): array
    {
        $start = $request->input('start') ? Carbon::parse($request->input('start')) : null;
        $end = $request->input('end') ? Carbon::parse($request->input('end')) : null;

        return [$start, $end];
    }
}
