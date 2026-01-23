<?php

namespace App\Http\Controllers;

use App\Http\Requests\Vendor\StoreVendorRequest;
use App\Http\Requests\Vendor\UpdateVendorRequest;
use App\Models\Vendor;
use Illuminate\Http\Request;

class VendorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Vendor::class);

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
    public function store(StoreVendorRequest $request)
    {
        $vendor = Vendor::create([
            ...$request->validated(),
            'created_by' => auth()->id(),
        ]);

        $vendor->logCreation();

        return back()->with('success', "Vendor $vendor->name created successfully.");
    }

    /**
     * Display the specified resource.
     */
    public function show(Vendor $vendor)
    {
        $this->authorize('view', $vendor);

        $vendor->load([
            'purchaseOrders.project',
            'purchaseOrders.invoices.checkRequisitions',
            'remarks.user',
            'activityLogs.user:id,name',
        ]);

        // Get all invoices for this vendor (both PO-based and direct)
        $invoices = $vendor->allInvoices()->with([
            'checkRequisitions',
            'purchaseOrder.project',  // For PO invoices
            'directProject'            // For direct invoices
        ])->get();

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

        $pendingInvoices = $invoices->where('invoice_status', '!=', 'paid')->count();

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
                'financial_summary' => $financialSummary,
                'all_invoices' => $invoices,  // Add all invoices (PO + direct)
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
    public function update(UpdateVendorRequest $request, Vendor $vendor)
    {
        $oldStatus = $vendor->is_active;

        $vendor->fill($request->validated());
        $vendor->save();

        $changes = $vendor->getChanges();

        if (isset($changes['is_active'])) {
            $vendor->logStatusChange(
                $oldStatus ? 'active' : 'inactive',
                $changes['is_active'] ? 'active' : 'inactive'
            );
        } elseif (! empty($changes)) {
            $vendor->logUpdate($changes);
        }

        return back()->with('success', "$vendor->name updated successfully.");
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
        $vendorIds = $this->validateBulkOperation($request);
        $count = Vendor::whereIn('id', $vendorIds)->update(['is_active' => 1]);

        return back()->with('success', "{$count} vendor(s) activated successfully.");
    }

    /**
     * Bulk deactivate vendors
     */
    public function bulkDeactivate(Request $request)
    {
        $vendorIds = $this->validateBulkOperation($request);
        $count = Vendor::whereIn('id', $vendorIds)->update(['is_active' => 0]);

        return back()->with('success', "{$count} vendor(s) deactivated successfully.");
    }

    /**
     * Bulk delete vendors
     */
    public function bulkDelete(Request $request)
    {
        $vendorIds = $this->validateBulkOperation($request);
        $count = Vendor::whereIn('id', $vendorIds)->delete();

        return back()->with('success', "{$count} vendor(s) deleted successfully.");
    }

    /**
     * Validate and authorize bulk operations
     */
    private function validateBulkOperation(Request $request): array
    {
        $this->authorize('bulkManage', Vendor::class);

        $validated = $request->validate([
            'vendor_ids' => 'required|array',
            'vendor_ids.*' => 'exists:vendors,id',
        ]);

        return $validated['vendor_ids'];
    }
}
