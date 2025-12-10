<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\Dashboard\UnifiedMetricsService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class UnifiedDashboardController extends Controller
{
    public function __construct(
        private UnifiedMetricsService $service
    ) {}

    public function apAgingSummary(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        return response()->json(
            $this->service->getAPAgingSummary($start, $end)
        );
    }

    public function invoicePipelineStatus(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        return response()->json(
            $this->service->getInvoicePipelineStatus($start, $end)
        );
    }

    public function poUtilizationSnapshot(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        return response()->json(
            $this->service->getPOUtilizationSnapshot($start, $end)
        );
    }

    public function upcomingCashOut(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        return response()->json(
            $this->service->getUpcomingCashOut($start, $end)
        );
    }

    public function topVendorsByOutstanding(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        return response()->json(
            $this->service->getTopVendorsByOutstanding($start, $end)
        );
    }

    public function processBottleneckIndicators(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        return response()->json(
            $this->service->getProcessBottleneckIndicators($start, $end)
        );
    }

    public function projectSpendSummary(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        return response()->json(
            $this->service->getProjectSpendSummary($start, $end)
        );
    }

    public function pendingApprovalsByRole(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        return response()->json(
            $this->service->getPendingApprovalsByRole($start, $end)
        );
    }

    public function complianceMissingDocuments(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        return response()->json(
            $this->service->getComplianceMissingDocuments($start, $end)
        );
    }

    public function recentActivityFeed(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);
        $page = $request->input('page', 1);

        return response()->json(
            $this->service->getRecentActivityFeed($start, $end, $page)
        );
    }

    private function getDateRange(Request $request): array
    {
        $start = $request->input('start') ? Carbon::parse($request->input('start')) : null;
        $end = $request->input('end') ? Carbon::parse($request->input('end')) : null;

        return [$start, $end];
    }
}
