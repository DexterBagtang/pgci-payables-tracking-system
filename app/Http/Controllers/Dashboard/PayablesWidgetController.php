<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\Dashboard\PayablesMetricsService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PayablesWidgetController extends Controller
{
    public function __construct(
        private PayablesMetricsService $service
    ) {}

    public function financialMetrics(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        return response()->json(
            $this->service->getFinancialMetrics($start, $end)
        );
    }

    public function invoiceReviewQueue(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        return response()->json(
            $this->service->getInvoiceReviewQueue($start, $end)
        );
    }

    public function crApprovalQueue(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        return response()->json(
            $this->service->getCRApprovalQueue($start, $end)
        );
    }

    public function invoiceAging(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        return response()->json(
            $this->service->getInvoiceAging($start, $end)
        );
    }

    public function paymentSchedule(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        return response()->json(
            $this->service->getPaymentSchedule($start, $end)
        );
    }

    public function actionableItems(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        return response()->json(
            $this->service->getActionableItems($start, $end)
        );
    }

    public function invoiceStatusPipeline(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        return response()->json(
            $this->service->getInvoiceStatusPipeline($start, $end)
        );
    }

    public function activityTimeline(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        return response()->json(
            $this->service->getActivityTimeline($start, $end)
        );
    }

    private function getDateRange(Request $request): array
    {
        $start = $request->input('start') ? Carbon::parse($request->input('start')) : null;
        $end = $request->input('end') ? Carbon::parse($request->input('end')) : null;

        return [$start, $end];
    }
}
