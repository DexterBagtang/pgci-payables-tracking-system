<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VendorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        abort_unless(auth()->user()->canRead('vendors'), 403);

        $query = Vendor::query()->withCount(['purchaseOrders', 'invoices']);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $statuses = explode(',', $request->get('status'));
            $query->whereIn('is_active', $statuses);
        }

        // Category filter
        if ($request->filled('category')) {
            $categories = explode(',', $request->get('category'));
            $query->whereIn('category', $categories);
        }

        // Sorting functionality
        $sortField = $request->get('sort_field', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        // Validate sort field to prevent SQL injection
        $allowedSortFields = ['name', 'email', 'phone', 'category', 'created_at', 'updated_at', 'purchase_orders_count', 'invoices_count'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $perPage = in_array($perPage, [10, 15, 25, 50]) ? $perPage : 15;

        $vendors = $query->paginate($perPage);

        // Append query parameters to pagination links
        $vendors->appends($request->query());

        // Calculate stats
        $stats = [
            'total' => Vendor::count(),
            'active' => Vendor::where('is_active', 1)->count(),
            'inactive' => Vendor::where('is_active', 0)->count(),
            'sap' => Vendor::where('category', 'SAP')->count(),
            'manual' => Vendor::where('category', 'Manual')->count(),
            'recent' => Vendor::where('created_at', '>=', now()->subDays(7))->count(),
        ];

        return inertia('vendors/index', [
            'vendors' => $vendors,
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
                'category' => $request->get('category', ''),
                'sort_field' => $sortField,
                'sort_direction' => $sortDirection,
                'per_page' => $perPage,
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        abort_unless(auth()->user()->canWrite('vendors'), 403);

        $request->validate([
            'name' => 'required|string|max:255|unique:vendors,name',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:1000',
            'category' => 'required|in:SAP,Manual',
            'payment_terms' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        $vendor = Vendor::create([
            'name' => $request->name,
            'contact_person' => $request->contact_person,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'category' => $request->category,
            'payment_terms' => $request->payment_terms,
            'created_by' => auth()->id(),
        ]);

        // Log creation to activity log
        $vendor->logCreation();

        return back()->with('success', 'Vendor created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Vendor $vendor)
    {
        abort_unless(auth()->user()->canRead('vendors'), 403);

        $vendor->load([
            'purchaseOrders.project',
            'purchaseOrders.invoices.checkRequisitions',
            'remarks.user',
            'activityLogs.user:id,name'
        ]);

        // Get all invoices for this vendor
        $invoices = $vendor->invoices()->with(['checkRequisitions'])->get();

        // Total paid is based on invoices marked as 'paid'
        $totalPaid = $invoices->where('invoice_status', 'paid')->sum('invoice_amount');

        $totalInvoiced = $invoices->sum('invoice_amount');
        $outstandingBalance = $totalInvoiced - $totalPaid;

        // Calculate overdue invoices (not paid and past due date)
        $today = now();
        $overdueInvoices = $invoices->filter(function ($invoice) use ($today) {
            return $invoice->due_date &&
                $invoice->due_date < $today &&
                $invoice->invoice_status !== 'paid';
        });

        $overdueAmount = $overdueInvoices->sum('invoice_amount');

        // Count invoice statuses
        $paidInvoices = $invoices->where('invoice_status', 'paid')->count();

        $pendingInvoices = $invoices->where('invoice_status','!=','paid')->count();

        $overdueInvoicesCount = $overdueInvoices->count();

        // Calculate average payment days (from SI date to when invoice status changed to 'paid')
        $paidInvoicesWithDates = $invoices->filter(function ($invoice) {
            return $invoice->invoice_status === 'paid' &&
                $invoice->si_date &&
                $invoice->updated_at; // When it was marked as paid
        });

        $averagePaymentDays = 0;
        if ($paidInvoicesWithDates->count() > 0) {
            $totalDays = $paidInvoicesWithDates->sum(function ($invoice) {
                // Calculate days from SI date to when invoice was marked as paid
                return \Carbon\Carbon::parse($invoice->si_date)
                    ->diffInDays(\Carbon\Carbon::parse($invoice->updated_at));
            });

            $averagePaymentDays = round($totalDays / $paidInvoicesWithDates->count());
        }

        $financialSummary = [
            'total_po_amount' => $vendor->purchaseOrders->sum('po_amount'),
            'total_po_invoiced' => $vendor->purchaseOrders->sum('total_invoiced'),
            'total_po_paid' => $vendor->purchaseOrders->sum('total_paid'),
            'total_po_outstanding' => $vendor->purchaseOrders->sum('outstanding_amount'),
            'total_invoice' => $invoices->count(),
            'total_invoiced' => $totalInvoiced,
            'total_paid' => $totalPaid,
            'outstanding_balance' => $outstandingBalance,
            'overdue_amount' => $overdueAmount,
            'pending_invoices' => $pendingInvoices,
            'paid_invoices' => $paidInvoices,
            'overdue_invoices' => $overdueInvoicesCount,
            'average_payment_days' => $averagePaymentDays,
        ];

        return inertia('vendors/show', [
            'vendor' => array_merge($vendor->toArray(), [
                'financial_summary' => $financialSummary
            ]),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Vendor $vendor)
    {
        abort_unless(auth()->user()->canWrite('vendors'), 403);

        $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('vendors','name')->ignore($vendor->id,'id'),
            ],
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:1000',
            'category' => 'required|in:SAP,Manual',
            'payment_terms' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Capture old status before update
        $oldStatus = $vendor->is_active;

        // Update the vendor details
        $vendor->fill([
            'name' => $request->name,
            'contact_person' => $request->contact_person,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'category' => $request->category,
            'payment_terms' => $request->payment_terms,
            'is_active' => $request->is_active,
        ]);

        $vendor->save();

        $changes = $vendor->getChanges();

        // Check if status changed (activation/deactivation)
        if (isset($changes['is_active'])) {
            $vendor->logStatusChange($oldStatus ? 'active' : 'inactive', $changes['is_active'] ? 'active' : 'inactive');
        } else if (!empty($changes)) {
            // Log regular update
            $vendor->logUpdate($changes);
        }

        return back()->with('success', 'Vendor updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Bulk activate vendors
     */
    public function bulkActivate(Request $request)
    {
        abort_unless(auth()->user()->canWrite('vendors'), 403);

        $request->validate([
            'vendor_ids' => 'required|array',
            'vendor_ids.*' => 'exists:vendors,id',
        ]);

        $count = Vendor::whereIn('id', $request->vendor_ids)
            ->update(['is_active' => 1]);

        return back()->with('success', "{$count} vendor(s) activated successfully.");
    }

    /**
     * Bulk deactivate vendors
     */
    public function bulkDeactivate(Request $request)
    {
        abort_unless(auth()->user()->canWrite('vendors'), 403);

        $request->validate([
            'vendor_ids' => 'required|array',
            'vendor_ids.*' => 'exists:vendors,id',
        ]);

        $count = Vendor::whereIn('id', $request->vendor_ids)
            ->update(['is_active' => 0]);

        return back()->with('success', "{$count} vendor(s) deactivated successfully.");
    }

    /**
     * Bulk delete vendors
     */
    public function bulkDelete(Request $request)
    {
        abort_unless(auth()->user()->canWrite('vendors'), 403);

        $request->validate([
            'vendor_ids' => 'required|array',
            'vendor_ids.*' => 'exists:vendors,id',
        ]);

        $count = Vendor::whereIn('id', $request->vendor_ids)->delete();

        return back()->with('success', "{$count} vendor(s) deleted successfully.");
    }
}
