<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\PurchaseOrder;
use App\Models\CheckRequisition;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        // Financial Summary Calculations
        $summary = [
            // Total outstanding balance from approved and pending disbursement invoices
            'outstanding_balance' => Invoice::whereIn('invoice_status', ['approved', 'pending_disbursement'])
                ->sum('net_amount'),

            // Count of invoices awaiting review (in_progress or received status)
            'pending_invoices_count' => Invoice::whereIn('invoice_status', ['in_progress', 'received'])
                ->count(),

            // Total amount of invoices awaiting review
            'pending_invoices_amount' => Invoice::whereIn('invoice_status', ['in_progress', 'received'])
                ->sum('net_amount'),

            // Count of open/active purchase orders
            'active_pos_count' => PurchaseOrder::where('po_status', 'open')
                ->count(),

            // Total value of open purchase orders
            'active_pos_amount' => PurchaseOrder::where('po_status', 'open')
                ->sum('po_amount'),

            // Total payments made this month (paid invoices)
            'payments_this_month' => Invoice::where('invoice_status', 'paid')
                ->whereMonth('updated_at', Carbon::now()->month)
                ->whereYear('updated_at', Carbon::now()->year)
                ->sum('net_amount'),

            // Disbursement metrics
            'pending_disbursements_count' => \App\Models\Disbursement::whereNull('date_check_released_to_vendor')
                ->count(),

            'pending_disbursements_amount' => \App\Models\CheckRequisition::whereHas('disbursements', function ($query) {
                    $query->whereNull('date_check_released_to_vendor');
                })
                ->where('requisition_status', 'processed')
                ->sum('php_amount'),

            'checks_released_this_month' => \App\Models\Disbursement::whereNotNull('date_check_released_to_vendor')
                ->whereMonth('date_check_released_to_vendor', Carbon::now()->month)
                ->whereYear('date_check_released_to_vendor', Carbon::now()->year)
                ->count(),

            'aging_disbursements' => \App\Models\Disbursement::whereNull('date_check_released_to_vendor')
                ->where('date_check_scheduled', '<', Carbon::now()->subDays(7))
                ->count(),
        ];

        // Pending Actions Calculations
        $actions = [
            // Invoices awaiting review
            'invoices_for_review' => Invoice::whereIn('invoice_status', ['in_progress', 'received'])
                ->count(),

            // Check requisitions pending approval
            'check_reqs_for_approval' => CheckRequisition::where('requisition_status', 'pending_approval')
                ->count(),

            // Overdue invoices (past due date and not paid/cancelled)
            'overdue_invoices' => Invoice::where('due_date', '<', Carbon::now())
                ->whereNotIn('invoice_status', ['paid', 'rejected'])
                ->count(),

            // Purchase orders with expected delivery within next 7 days
            'pos_near_delivery' => PurchaseOrder::whereBetween('expected_delivery_date', [
                    Carbon::now(),
                    Carbon::now()->addDays(7)
                ])
                ->where('po_status', 'open')
                ->count(),

            // Disbursements pending release
            'disbursements_pending_release' => \App\Models\Disbursement::whereNull('date_check_released_to_vendor')
                ->whereNotNull('date_check_scheduled')
                ->where('date_check_scheduled', '<=', Carbon::now())
                ->count(),
        ];

        // Upcoming Payments (next 30 days)
        $upcomingPayments = Invoice::with(['vendor', 'purchaseOrder'])
            ->whereIn('invoice_status', ['approved', 'pending_disbursement'])
            ->whereNotNull('due_date')
            ->whereBetween('due_date', [
                Carbon::now(),
                Carbon::now()->addDays(30)
            ])
            ->orderBy('due_date', 'asc')
            ->get()
            ->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'si_number' => $invoice->si_number,
                    'due_date' => $invoice->due_date,
                    'net_amount' => $invoice->net_amount,
                    'invoice_status' => $invoice->invoice_status,
                    'vendor_name' => $invoice->vendor->name ?? 'Unknown Vendor',
                ];
            });

        // Recent disbursements (last 10)
        $recentDisbursements = \App\Models\Disbursement::with(['creator', 'checkRequisitions'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($disbursement) {
                return [
                    'id' => $disbursement->id,
                    'check_voucher_number' => $disbursement->check_voucher_number,
                    'date_check_scheduled' => $disbursement->date_check_scheduled,
                    'date_check_released_to_vendor' => $disbursement->date_check_released_to_vendor,
                    'total_amount' => $disbursement->checkRequisitions->sum('php_amount'),
                    'check_req_count' => $disbursement->checkRequisitions->count(),
                    'creator_name' => $disbursement->creator->name ?? 'Unknown',
                    'status' => $disbursement->date_check_released_to_vendor ? 'released' : 'pending',
                    'created_at' => $disbursement->created_at,
                ];
            });

        return inertia('dashboard/dashboard', [
            'summary' => $summary,
            'actions' => $actions,
            'upcomingPayments' => $upcomingPayments,
            'recentDisbursements' => $recentDisbursements,
        ]);
    }
}
