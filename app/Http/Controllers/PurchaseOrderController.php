<?php

namespace App\Http\Controllers;

use App\Http\Requests\PurchaseOrder\StorePurchaseOrderRequest;
use App\Http\Requests\PurchaseOrder\UpdatePurchaseOrderRequest;
use App\Models\PoLineItem;
use App\Models\Project;
use App\Models\PurchaseOrder;
use App\Models\Vendor;
use Dflydev\DotAccessData\Data;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseOrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    // In the PurchaseOrderController.php

    public function index(Request $request)
    {
        $this->authorize('viewAny', PurchaseOrder::class);

        $query = PurchaseOrder::with(['vendor', 'project', 'creator'])
            ->select('purchase_orders.*')
            ->leftJoin('vendors', 'purchase_orders.vendor_id', '=', 'vendors.id')
            ->leftJoin('projects', 'purchase_orders.project_id', '=', 'projects.id');

        // Apply filters
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('po_status', $request->status);
        }

        if ($request->has('vendor') && $request->vendor !== 'all') {
            $query->where('vendor_id', $request->vendor);
        }

        if ($request->has('project') && $request->project !== 'all') {
            $query->where('project_id', $request->project);
        }

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('po_number', 'like', "%{$search}%")
                    ->orWhereHas('vendor', function($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('project', function($q) use ($search) {
                        $q->where('project_title', 'like', "%{$search}%")
                            ->orWhere('cer_number', 'like', "%{$search}%");
                    });
            });
        }

        // Date range filter
        if ($request->has('date_from') || $request->has('date_to')) {
            $dateField = $request->get('date_field', 'po_date');

            // Validate date_field to prevent SQL injection
            if (!in_array($dateField, ['po_date', 'created_at'])) {
                $dateField = 'po_date';
            }

            if ($request->has('date_from') && !empty($request->date_from)) {
                $query->whereDate("purchase_orders.{$dateField}", '>=', $request->date_from);
            }

            if ($request->has('date_to') && !empty($request->date_to)) {
                $query->whereDate("purchase_orders.{$dateField}", '<=', $request->date_to);
            }
        }

        // Apply sorting - KISS approach
        $sortField = $request->get('sort_field', 'po_date');
        $sortDirection = $request->get('sort_direction', 'desc');

        // Map frontend fields to database columns
        $sortMapping = [
            'po_number' => 'purchase_orders.po_number',
            'po_date' => 'purchase_orders.po_date',
            'expected_delivery_date' => 'purchase_orders.expected_delivery_date',
            'po_amount' => 'purchase_orders.po_amount',
            'po_status' => 'purchase_orders.po_status',
            'vendor.name' => 'vendors.name',
            'project.project_title' => 'projects.project_title',
        ];

        if (array_key_exists($sortField, $sortMapping)) {
            $query->orderBy($sortMapping[$sortField], $sortDirection);
        } else {
            $query->orderBy('purchase_orders.po_date', 'desc');
        }

        // Get paginated results
        $purchaseOrders = $query->paginate($request->get('per_page', 15));

        $purchaseOrders->appends($request->query());

        // Get filter options
        $vendors = Vendor::where('is_active', true)->orderBy('name')->get(['id', 'name','category']);
        $projects = Project::all(['id', 'project_title','total_project_cost','cer_number']);

        return inertia('purchase-orders/index', [
            'purchaseOrders' => $purchaseOrders,
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', 'all'),
                'vendor' => $request->vendor !== 'all' ? (int) $request->vendor : 'all',
                'project' => $request->project !== 'all' ? (int) $request->project : 'all',
                'date_field' => $request->get('date_field', 'po_date'),
                'date_from' => $request->get('date_from', null),
                'date_to' => $request->get('date_to', null),
                'sort_field' => $request->get('sort_field', 'po_date'),
                'sort_direction' => $request->get('sort_direction', 'desc'),
            ],
            'filterOptions' => [
                'statuses' => ['draft', 'open', 'closed', 'cancelled'],
                'vendors' => $vendors,
                'projects' => $projects,
            ],
        ]);

    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $this->authorize('create', PurchaseOrder::class);

        $vendors = Vendor::where('is_active', true)->orderBy('name')->get();
        $projects = Project::all();

        return inertia('purchase-orders/create', [
            'vendors' => $vendors,
            'projects' => $projects,
            'project_id' => $request->get('project_id'),
        ]);
    }


    public function store(StorePurchaseOrderRequest $request)
    {
        $validated = $request->validated();

        $validated['po_status'] = $request->po_status;
        $validated['created_by'] = auth()->id();

        // Track finalization if PO is created as 'open'
        if ($request->po_status === 'open') {
            $validated['finalized_by'] = auth()->id();
            $validated['finalized_at'] = now();
        }

        unset($validated['files']);

        // Create the purchase order
        $purchaseOrder = PurchaseOrder::create($validated);

        // Log creation using trait
        $purchaseOrder->logCreation();

        // Log to parent Project if exists
        if ($purchaseOrder->project_id) {
            $purchaseOrder->project->logRelationshipAdded('purchase_order', [
                'po_number' => $purchaseOrder->po_number,
                'po_amount' => $purchaseOrder->po_amount,
                'vendor' => $purchaseOrder->vendor?->name,
            ]);
        }

        // Log to Vendor if exists
        if ($purchaseOrder->vendor_id) {
            $purchaseOrder->vendor->logRelationshipAdded('purchase_order', [
                'po_number' => $purchaseOrder->po_number,
                'po_amount' => $purchaseOrder->po_amount,
                'project' => $purchaseOrder->project?->project_title,
            ]);
        }


        // Handle file uploads
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $originalName = $file->getClientOriginalName();
                $fileName = time() . '_' . $originalName;
                $filePath = $file->store('purchase-orders/files', 'public');

                $purchaseOrder->files()->create([
                    'file_name' => $originalName,
                    'file_path' => $filePath,
                    'file_type' => $file->getClientMimeType(),
                    'file_category' => 'purchase_order',
                    'file_purpose' => 'documentation',
                    'file_size' => $file->getSize(),
                    'disk' => 'public',
                    'uploaded_by' => auth()->id(),
                    'is_active' => true,
                ]);
            }
        }

        return back()->with('success', "Purchase Order $purchaseOrder->po_number created.");
    }







    /**
     * Display the specified resource.
     */
    public function show(Request $request, PurchaseOrder $purchaseOrder)
    {
        $this->authorize('view', $purchaseOrder);

        $purchaseOrder->load([
            'project:id,project_title,cer_number,total_project_cost,total_contract_cost,project_status,description,project_type,smpo_number,philcom_category',
            'vendor:id,name,category',
            'creator:id,name',
            'files.uploader:id,name',
            'invoices',
            'activityLogs.user',
            'remarks.user'
        ]);

        // Get vendors and projects for edit mode
        $vendors = Vendor::select('id', 'name', 'category')->where('is_active', true)->orderBy('name')->get();
        $projects = Project::select('id', 'project_title', 'cer_number', 'project_type', 'smpo_number', 'philcom_category')->orderBy('project_title')->get();

        return inertia('purchase-orders/show', [
            'purchaseOrder' => $purchaseOrder,
            'vendors' => $vendors,
            'projects' => $projects,
            'backUrl' => url()->previous() ?: '/purchase-orders',
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PurchaseOrder $purchaseOrder)
    {
        $this->authorize('update', $purchaseOrder);

        $purchaseOrder->load(['files', 'project:id,project_title,cer_number', 'vendor:id,name']);
        $vendors = Vendor::where('is_active', true)->orderBy('name')->get();
        $projects = Project::all();

        return inertia('purchase-orders/edit', [
            'purchaseOrder' => $purchaseOrder,
            'vendors' => $vendors,
            'projects' => $projects,
            'backUrl' => url()->previous() ?: '/purchase-orders',
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePurchaseOrderRequest $request, PurchaseOrder $purchaseOrder)
    {
        $validated = $request->validated();

        // Track finalization if PO transitions from draft to open
        $oldStatus = $purchaseOrder->po_status;
        if ($request->po_status === 'open' && $oldStatus === 'draft') {
            $validated['finalized_by'] = auth()->id();
            $validated['finalized_at'] = now();
        }

//        $purchaseOrder->update($validated);
//        dd($validated);
        $purchaseOrder->fill($validated);

//        dd($purchaseOrder);

        $purchaseOrder->save();

        $changes = $purchaseOrder->getChanges();

        // Check if status changed
        if (isset($changes['po_status'])) {
            $purchaseOrder->logStatusChange($oldStatus, $changes['po_status']);
        } else {
            // Log regular update
            $purchaseOrder->logUpdate($changes);
        }

        // In your update method, add file handling
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $originalName = $file->getClientOriginalName();
                $fileName = time() . '_' . $originalName;
                $filePath = $file->store('purchase-orders/files', 'public');

                $purchaseOrder->files()->create([
                    'file_name' => $originalName,
                    'file_path' => $filePath,
                    'file_type' => $file->getClientMimeType(),
                    'file_category' => 'purchase_order',
                    'file_purpose' => 'documentation',
                    'file_size' => $file->getSize(),
                    'disk' => 'public',
                    'uploaded_by' => auth()->id(),
                    'is_active' => true,
                ]);
            }
        }

//        return to_route('purchase-orders.show',$purchaseOrder->id)->with('message', 'Purchase Order updated successfully.');
        return back()->with('message', "Purchase Order #$purchaseOrder->po_number updated successfully.");
    }

    /**
     * Close/override a purchase order manually
     * This allows closing a PO even when not 100% complete, as an override mechanism
     * Financial data (invoiced, paid, outstanding, completion %) will reflect actual status
     */
    public function close(Request $request, PurchaseOrder $purchaseOrder)
    {
        $this->authorize('close', $purchaseOrder);

        // Validate request
        $validated = $request->validate([
            'closure_remarks' => 'required|string|max:1000',
            'force_close' => 'sometimes', // Allow any value, will be converted to boolean later
            'files' => 'nullable|array',
            'files.*' => 'file|max:10240', // 10MB max per file
        ]);

        // Check if PO is already closed
        if ($purchaseOrder->po_status === 'closed') {
            return back()->withErrors([
                'status_error' => 'This purchase order is already closed.'
            ]);
        }

        // Ensure financial summary is up-to-date
        $purchaseOrder->syncFinancials();
        $purchaseOrder->refresh();

        // Get financial status from stored columns
        $totalInvoiced = $purchaseOrder->total_invoiced;
        $totalNetAmount = $purchaseOrder->invoices()->sum('net_amount');
        $paidAmount = $purchaseOrder->total_paid;
        $unpaidInvoices = $purchaseOrder->invoices()->where('invoice_status', '!=', 'paid')->count();
        $totalInvoices = $purchaseOrder->invoices()->count();

        // Perform validations but allow override with force_close
        $warnings = [];

        // Warning: No invoices exist
        if ($totalInvoices === 0) {
            $warnings[] = "No invoices have been created for this PO. PO Amount: ₱" . number_format($purchaseOrder->po_amount, 2) . " remains uninvoiced";
        }

        // Warning: Not all invoices are paid
        if ($unpaidInvoices > 0) {
            $warnings[] = "{$unpaidInvoices} out of {$totalInvoices} invoice(s) are not yet paid. Outstanding amount: ₱" . number_format($totalNetAmount - $paidAmount, 2);
        }

        // Warning: PO not fully invoiced
        if ($totalInvoices > 0 && $totalInvoiced < $purchaseOrder->po_amount) {
            $uninvoiced = $purchaseOrder->po_amount - $totalInvoiced;
            $warnings[] = "PO is not fully invoiced. Uninvoiced amount: ₱" . number_format($uninvoiced, 2) . " (Invoiced: " . number_format(($totalInvoiced / $purchaseOrder->po_amount) * 100, 1) . "%)";
        }

        // Warning: Total invoiced exceeds PO amount
        if ($totalInvoiced > $purchaseOrder->po_amount) {
            $overage = $totalInvoiced - $purchaseOrder->po_amount;
            $warnings[] = "Total invoiced amount (₱" . number_format($totalInvoiced, 2) .
                          ") exceeds PO amount (₱" . number_format($purchaseOrder->po_amount, 2) .
                          ") by ₱" . number_format($overage, 2) . " (" . number_format(($overage / $purchaseOrder->po_amount) * 100, 1) . "% over budget)";
        }

        // If there are warnings and user hasn't confirmed force_close, return with warnings
        if (!empty($warnings) && !$request->boolean('force_close')) {
            return back()->withErrors([
                'warnings' => $warnings,
                'requires_confirmation' => true
            ])->withInput();
        }

        // Update PO status and closure details
        // Note: We do NOT manipulate financial data - it stays as actual values
        $oldStatus = $purchaseOrder->po_status;
        $purchaseOrder->update([
            'po_status' => 'closed',
            'closed_by' => auth()->id(),
            'closed_at' => now(),
            'closure_remarks' => $validated['closure_remarks'],
        ]);

        // Log status change - always include financial snapshot for transparency
        $closureReason = null;

        // Add financial status snapshot at time of closure
        $financialSnapshot = sprintf(
            "PO: ₱%s | Invoiced: ₱%s (%.1f%%) | Paid: ₱%s (%.1f%%) | Outstanding: ₱%s",
            number_format($purchaseOrder->po_amount, 2),
            number_format($totalInvoiced, 2),
            $purchaseOrder->po_amount > 0 ? ($totalInvoiced / $purchaseOrder->po_amount * 100) : 0,
            number_format($paidAmount, 2),
            $purchaseOrder->po_amount > 0 ? ($paidAmount / $purchaseOrder->po_amount * 100) : 0,
            number_format($purchaseOrder->po_amount - $paidAmount, 2)
        );

        // Determine if this was a manual override (warnings exist or force_close was used)
        if (!empty($warnings) || $request->boolean('force_close')) {
            // This was a manual override - log it clearly
            $closureReason = "⚠️ MANUAL OVERRIDE - Force closed by " . auth()->user()->name;

            if (!empty($warnings)) {
                $closureReason .= "\n\n⚠️ WARNINGS AT TIME OF CLOSURE:\n• " . implode("\n• ", $warnings);
            }

            $closureReason .= "\n\n📊 Financial Status at Closure:\n" . $financialSnapshot;
        } else {
            // Normal closure - all complete
            $closureReason = "Closed successfully. All invoices settled.\n\n📊 Final Status:\n" . $financialSnapshot;
        }

        $purchaseOrder->logStatusChange($oldStatus, 'closed', $closureReason);

        // Handle file uploads
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $originalName = $file->getClientOriginalName();
                $filePath = $file->store('purchase-orders/closure-files', 'public');

                $purchaseOrder->files()->create([
                    'file_name' => $originalName,
                    'file_path' => $filePath,
                    'file_type' => $file->getClientMimeType(),
                    'file_category' => 'purchase_order',
                    'file_purpose' => 'closure_documentation',
                    'file_size' => $file->getSize(),
                    'disk' => 'public',
                    'uploaded_by' => auth()->id(),
                    'is_active' => true,
                ]);
            }
        }

        return back()->with('message', 'Purchase Order closed successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PurchaseOrder $purchaseOrder)
    {
        $this->authorize('delete', $purchaseOrder);

        // Implementation pending
    }
}
