<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\Dashboard\PurchasingMetricsService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PurchasingWidgetController extends Controller
{
    public function __construct(
        private PurchasingMetricsService $service
    ) {}

    public function financialCommitments(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        return response()->json(
            $this->service->getFinancialCommitments($start, $end)
        );
    }

    public function vendorPerformance(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        return response()->json(
            $this->service->getVendorPerformance($start, $end)
        );
    }

    public function poStatusSummary(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        return response()->json(
            $this->service->getPOStatusSummary($start, $end)
        );
    }

    public function currencySummary(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        return response()->json(
            $this->service->getCurrencySummary($start, $end)
        );
    }

    public function recentInvoices(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        return response()->json(
            $this->service->getRecentInvoices($start, $end)
        );
    }

    private function getDateRange(Request $request): array
    {
        $start = $request->input('start') ? Carbon::parse($request->input('start')) : null;
        $end = $request->input('end') ? Carbon::parse($request->input('end')) : null;

        return [$start, $end];
    }
}
