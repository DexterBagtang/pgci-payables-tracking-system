<?php

namespace App\Http\Controllers;

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
                'statuses' => ['draft', 'open', 'payable','closed', 'cancelled'],
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
        $vendors = Vendor::where('is_active', true)->orderBy('name')->get();
        $projects = Project::all();

        return inertia('purchase-orders/create', [
            'vendors' => $vendors,
            'projects' => $projects,
            'project_id' => $request->get('project_id'),
        ]);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'po_number' => $request->po_status === 'draft' ? 'nullable|string|unique:purchase_orders' : 'required|string|unique:purchase_orders',
            'project_id' => $request->po_status === 'draft' ? 'nullable|exists:projects,id' : 'required|exists:projects,id',
            'vendor_id' => $request->po_status === 'draft' ? 'nullable|exists:vendors,id' : 'required|exists:vendors,id',
            'po_amount' => $request->po_status === 'draft' ? 'nullable|numeric|min:0' : 'required|numeric|min:0',
            'currency' => 'nullable|in:PHP,USD',
            'payment_term' => 'nullable|string',
            'po_date' => $request->po_status === 'draft' ? 'nullable|date' : 'required|date',
            'expected_delivery_date' => 'nullable|date|after:po_date',
            'description' => 'nullable|string',
            'files' => 'nullable|array',
            'files.*' => 'file|max:10240', // 10MB max per file
        ]);

        $validated['po_status'] = $request->po_status;
        $validated['created_by'] = auth()->id();

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

        return back()->with('success', 'Purchase Order created.');
    }







    /**
     * Display the specified resource.
     */
    public function show(Request $request,PurchaseOrder $purchaseOrder)
    {
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
        $purchaseOrder->load(['files']);
        $vendors = Vendor::where('is_active', true)->orderBy('name')->get();
        $projects = Project::all();

        return inertia('purchase-orders/edit', [
            'purchaseOrder' => $purchaseOrder,
            'vendors' => $vendors,
            'projects' => $projects,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PurchaseOrder $purchaseOrder)
    {
        $validated = $request->validate([
            'po_number' => [
                $request->po_status === 'draft' ? 'nullable' : 'required',
                'string',
                'unique:purchase_orders,po_number,' . $purchaseOrder->id
            ],
            'project_id' => $request->po_status === 'draft' ? 'nullable|exists:projects,id' : 'required|exists:projects,id',
            'vendor_id' => $request->po_status === 'draft' ? 'nullable|exists:vendors,id' : 'required|exists:vendors,id',
            'po_amount' => $request->po_status === 'draft' ? 'nullable|numeric|min:0' : 'required|numeric|min:0',
            'currency' => 'nullable|in:PHP,USD',
            'payment_term' => 'nullable|string',
            'po_date' => $request->po_status === 'draft' ? 'nullable|date' : 'required|date',
            'expected_delivery_date' => 'nullable|date|after:po_date',
            'description' => 'nullable|string',
            'po_status' => 'required|in:draft,open,approved,completed,cancelled',
        ]);


//        $validated['updated_by'] = auth()->id();


//        $purchaseOrder->update($validated);
//        dd($validated);
        $oldStatus = $purchaseOrder->po_status;
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
        return back()->with('message', 'Purchase Order updated successfully.');
    }

    /**
     * Close/override a purchase order manually
     */
    public function close(Request $request, PurchaseOrder $purchaseOrder)
    {
        // Validate request
        $validated = $request->validate([
            'closure_remarks' => 'required|string|max:1000',
            'files' => 'nullable|array',
            'files.*' => 'file|max:10240', // 10MB max per file
        ]);

        // Check if user has purchasing role
        if (auth()->user()->role !== 'purchasing' && auth()->user()->role !== 'admin') {
            return back()->withErrors(['error' => 'Only users with Purchasing role can close purchase orders.']);
        }

        // Check if PO is already closed
        if ($purchaseOrder->po_status === 'closed') {
            return back()->withErrors(['error' => 'This purchase order is already closed.']);
        }

        // Check if all invoices are paid
        if (!$purchaseOrder->allInvoicesPaid()) {
            return back()->withErrors(['error' => 'Cannot close purchase order. All associated invoices must be in "paid" status before closing.']);
        }

        // Update PO status and closure details
        $oldStatus = $purchaseOrder->po_status;
        $purchaseOrder->update([
            'po_status' => 'closed',
            'closed_by' => auth()->id(),
            'closed_at' => now(),
            'closure_remarks' => $validated['closure_remarks'],
        ]);

        // Log status change
        $purchaseOrder->logStatusChange($oldStatus, 'closed');

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
    public function destroy(string $id)
    {
        //
    }
}
