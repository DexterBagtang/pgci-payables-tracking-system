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

        return inertia('dashboard/dashboard', [
            'summary' => $summary,
            'actions' => $actions,
            'upcomingPayments' => $upcomingPayments,
        ]);
    }
}
