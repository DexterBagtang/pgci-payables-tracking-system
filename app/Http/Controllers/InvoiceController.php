<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Invoice;
use App\Models\Project;
use App\Models\PurchaseOrder;
use App\Models\Remark;
use App\Models\Vendor;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class InvoiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $baseQuery = Invoice::with(['vendor','project',
            'purchaseOrder' => function ($q) {
                $q->with(['project', 'vendor']);
            }
        ])
        ->select('invoices.*')
            ->leftJoin('purchase_orders', 'purchase_orders.id', '=', 'invoices.purchase_order_id');

        if ($request->has('search')) {
            $baseQuery->where(function ($query) use ($request) {
                $query->where('si_number', 'like', '%' . $request->search . '%')
                    ->orWhereHas('purchaseOrder.project', function ($q) use ($request) {
                        $q->where('project_title', 'like', '%' . $request->search . '%')
                            ->orWhere('cer_number', 'like', '%' . $request->search . '%');
                    })
                    ->orWhereHas('purchaseOrder.vendor', function ($q) use ($request) {
                        $q->where('name', 'like', '%' . $request->search . '%');
                    })
                    ->orWhereHas('purchaseOrder', function ($q) use ($request) {
                        $q->where('po_number', 'like', '%' . $request->search . '%');
                    });
            });
        }

        if ($request->has('vendor') && $request->vendor !== 'all') {
            $baseQuery->whereHas('purchaseOrder.vendor', function ($q) use ($request) {
                $q->where('vendor_id', $request->vendor);
            });
        }

        if ($request->has('project') && $request->project !== 'all') {
            $baseQuery->whereHas('purchaseOrder.project', function ($q) use ($request) {
                $q->where('project_id', $request->project);
            });
        }

        if ($request->has('purchase_order') && $request->purchase_order !== 'all') {
            $baseQuery->where('purchase_order_id', $request->purchase_order);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $baseQuery->where('invoice_status', $request->status);
        }

        // Calculate status counts BEFORE pagination (counts all matching records)
        $statusCounts = [
            'all' => (clone $baseQuery)->count(),
            'pending' => (clone $baseQuery)->where('invoice_status', 'pending')->count(),
            'received' => (clone $baseQuery)->where('invoice_status', 'received')->count(),
            'approved' => (clone $baseQuery)->where('invoice_status', 'approved')->count(),
            'rejected' => (clone $baseQuery)->where('invoice_status', 'rejected')->count(),
            'pending_disbursement' => (clone $baseQuery)->where('invoice_status', 'pending_disbursement')->count(),
        ];

        $sortField = $request->get('sort_field', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        $sortMapping = [
            'si_number' => 'si_number',
            'created_at' => 'invoices.created_at',
            'invoice_amount' => 'invoice_amount',
            'due_date' => 'due_date',
        ];

        if (array_key_exists($sortField, $sortMapping)) {
            $baseQuery->orderBy($sortMapping[$sortField], $sortDirection);
        } else {
            $baseQuery->orderBy('invoices.updated_at', 'desc');
        }

        $perPage = $request->get('per_page', 10);
        $perPage = in_array($perPage, [10, 15, 25, 50]) ? $perPage : 10;

        $invoices = $baseQuery->paginate($perPage);

        $invoices->appends($request->query());

        // Calculate financial total for current page
        $currentPageTotal = $invoices->sum(function ($invoice) {
            return (float) $invoice->invoice_amount;
        });

        $vendors = Vendor::where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $projects = Project::all(['id', 'project_title']);
        $purchaseOrders = PurchaseOrder::with(['vendor:id,name'])
            ->orderBy('po_number')
            ->get(['id', 'po_number', 'vendor_id']);

        return inertia('invoices/index', [
            'invoices' => $invoices,
            'statusCounts' => $statusCounts,
            'currentPageTotal' => $currentPageTotal,
            'filters' => [
                'search' => $request->get('search', ''),
                'sort_field' => $request->get('sort_field', 'created_at'),
                'vendor' => $request->vendor !== 'all' ? (int)$request->vendor : 'all',
                'project' => $request->project !== 'all' ? (int)$request->project : 'all',
                'purchase_order' => $request->purchase_order !== 'all' ? (int)$request->purchase_order : 'all',
                'status' => $request->status !== 'all' ? $request->status : 'all',
                'sort_direction' => $request->get('sort_direction', 'desc'),
                'per_page' => $request->get('per_page', 10),
            ],
            'filterOptions' => [
                'vendors' => $vendors,
                'projects' => $projects,
                'purchaseOrders' => $purchaseOrders,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('invoices/create', [
            'purchaseOrders' => PurchaseOrder::with(['project', 'vendor'])->where('po_status','open')->get(),
        ]);
    }


    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'invoices' => 'required|array|min:1',
            'invoices.*.purchase_order_id' => 'required|exists:purchase_orders,id',
            'invoices.*.si_number' => 'required|string|max:255',
            'invoices.*.si_date' => 'required|date',
            'invoices.*.si_received_at' => 'required|date',
            'invoices.*.invoice_amount' => 'required|numeric|min:0',
            'invoices.*.tax_amount' => 'nullable|numeric|min:0',
            'invoices.*.discount_amount' => 'nullable|numeric|min:0',
            'invoices.*.terms_of_payment' => 'required|string',
            'invoices.*.other_payment_terms' => 'nullable|string',
            'invoices.*.due_date' => 'nullable|date',
            'invoices.*.notes' => 'nullable|string',
            'invoices.*.submitted_at' => 'nullable|date',
            'invoices.*.submitted_to' => 'nullable|string|max:255',
            'invoices.*.files.*' => 'file|max:10240|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png',
        ]);

        $validator->after(function ($validator) use ($request) {
            $invoices = $request->input('invoices', []);

            foreach ($invoices as $index => $invoice) {
                $exists = \App\Models\Invoice::where('purchase_order_id', $invoice['purchase_order_id'])
                    ->where('si_number', $invoice['si_number'])
                    ->exists();

                if ($exists) {
                    $validator->errors()->add(
                        "invoices.{$index}.si_number",
                        "The SI number already exists for this purchase order."
                    );
                }
            }
        });

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        $validated = $validator->validated();

        $createdInvoices = [];

        foreach ($validated['invoices'] as $invoiceData) {

            // Extract and remove files from validation
            $files = $invoiceData['files'] ?? [];
            unset($invoiceData['files']);

            // Add computed fields
            $invoiceData['net_amount'] = $invoiceData['invoice_amount'];
            if ($invoiceData['due_date'] == null) {
                $invoiceData['due_date'] = Carbon::parse($invoiceData['si_received_at'])->addDays(30);
            }
            // Create invoice
            $invoice = Invoice::create([
                ...$invoiceData,
                'invoice_status' => 'pending',
                'created_by' => auth()->id(),
            ]);

            // Log activity
            $invoice->activityLogs()->create([
                'action' => 'created',
                'user_id' => auth()->id(),
                'ip_address' => $request->ip(),
                'changes' => json_encode($invoice->toArray()),
                'notes' => $invoiceData['notes'] ?? null,
            ]);

            // Handle file uploads
            if (!empty($files)) {
                foreach ($files as $file) {
                    if ($file && $file->isValid()) {
                        $filePath = $file->store('invoices/files', 'public');

                        $invoice->files()->create([
                            'file_name' => $file->getClientOriginalName(),
                            'file_path' => $filePath,
                            'file_type' => $file->getClientMimeType(),
                            'file_category' => 'invoice',
                            'file_purpose' => 'documentation',
                            'file_size' => $file->getSize(),
                            'disk' => 'public',
                            'uploaded_by' => auth()->id(),
                            'is_active' => true,
                        ]);
                    }
                }
            }

            $createdInvoices[] = $invoice;
        }

        return back()->with('success', count($createdInvoices) . ' invoice(s) created successfully!');
    }


    /**
     * Display the specified resource.
     */
    public function show(Invoice $invoice)
    {
        $invoice->load('purchaseOrder.project',
            'purchaseOrder.vendor',
            'purchaseOrder.files',
            'files',
            'activityLogs.user',
            'checkRequisitions',
            'remarks.user:id,name'
        );
        return inertia('invoices/show', [
            'invoice' => $invoice,
            'purchaseOrders' => PurchaseOrder::with(['project', 'vendor'])->get(),
        ]);

    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Invoice $invoice)
    {
        $invoice->load('purchaseOrder.project', 'purchaseOrder.vendor');
        return inertia('invoices/edit', [
            'invoice' => $invoice,
            'purchaseOrders' => PurchaseOrder::with(['project', 'vendor'])->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'purchase_order_id' => 'required|exists:purchase_orders,id',
            'si_number' => 'required|string|max:255|unique:invoices,si_number,' . $invoice->id,
            'si_date' => 'required|date',
            'si_received_at' => 'nullable|date',
            'invoice_amount' => 'required|numeric|min:0',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'submitted_at' => 'nullable|date',
            'submitted_to' => 'nullable|string|max:255',
            'files.*' => 'file|max:10240|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png',
        ]);

        // Remove files array from validated data for mass assignment
        $fileData = $validated['files'] ?? [];
        unset($validated['files']);

        $validated['net_amount'] = $validated['invoice_amount'];
        $validated['invoice_status'] = 'pending';


//        $dirty = $invoice->getDirty();

        // Update invoice
//        $invoice->update($validated);
        $invoice->fill($validated)->save();

        $changes = $invoice->getChanges();

        $invoice->activityLogs()->create([
            'action' => 'updated',
            'user_id' => auth()->id(),
            'ip_address' => $request->ip(),
            'changes' => json_encode($changes),
            'notes' => $validated['notes'],
        ]);

        // Handle new file uploads only (no deletion)
        if (!empty($fileData)) {
            foreach ($fileData as $file) {
                $filePath = $file->store('invoices/files', 'public');

                $invoice->files()->create([
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $filePath,
                    'file_type' => $file->getClientMimeType(),
                    'file_category' => 'invoice',
                    'file_purpose' => 'documentation',
                    'file_size' => $file->getSize(),
                    'disk' => 'public',
                    'uploaded_by' => auth()->id(),
                    'is_active' => true,
                ]);
            }
        }

        return redirect()
            ->route('invoices.show', $invoice)
            ->with('success', 'Invoice updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function review(Invoice $invoice, Request $request)
    {
        $invoice->fill([
            'invoice_status' => $request->approvalStatus,
        ])->save();

        $changes = $invoice->getChanges();

        $invoice->activityLogs()->create([
            'action' => $request->approvalStatus,
            'user_id' => auth()->id(),
            'ip_address' => $request->ip(),
            'changes' => json_encode($changes),
            'notes' => $request->remarks,
        ]);

        return back()->with('success', 'Invoice reviewed successfully!');
    }

    public function bulkReview(Request $request)
    {
        $query = Invoice::with([
            'purchaseOrder' => function ($q) {
                $q->with(['project', 'vendor']);
            },
            'files'
        ])
            ->select('invoices.*')
            ->leftJoin('purchase_orders', 'purchase_orders.id', '=', 'invoices.purchase_order_id')
            ->whereNotIn('invoices.invoice_status', ['approved','pending_disbursement']);

        // Search
        if ($request->has('search')) {
            $query->where(function ($query) use ($request) {
                $query->where('si_number', 'like', '%' . $request->search . '%')
                    ->orWhereHas('purchaseOrder.project', function ($q) use ($request) {
                        $q->where('project_title', 'like', '%' . $request->search . '%')
                            ->orWhere('cer_number', 'like', '%' . $request->search . '%');
                    })
                    ->orWhereHas('purchaseOrder.vendor', function ($q) use ($request) {
                        $q->where('name', 'like', '%' . $request->search . '%');
                    })
                    ->orWhereHas('purchaseOrder', function ($q) use ($request) {
                        $q->where('po_number', 'like', '%' . $request->search . '%');
                    });
            });
        }

        // Vendor filter
        if ($request->has('vendor') && $request->vendor !== 'all') {
            $query->whereHas('purchaseOrder', function ($q) use ($request) {
                $q->where('vendor_id', $request->vendor);
            });
        }

        // Purchase Order filter
        if ($request->has('purchase_order') && $request->purchase_order !== 'all') {
            $query->where('purchase_order_id', $request->purchase_order);
        }

        // Status filter
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('invoice_status', $request->status);
        }

        // Date range filter
        if ($request->has('date_from')) {
            $query->where('si_date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('si_date', '<=', $request->date_to);
        }

        // Sorting
        $sortField = $request->get('sort_field', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        $sortMapping = [
            'si_number' => 'si_number',
            'created_at' => 'invoices.created_at',
        ];

        if (array_key_exists($sortField, $sortMapping)) {
            $query->orderBy($sortMapping[$sortField], $sortDirection);
        } else {
            $query->orderBy('invoices.created_at', 'desc');
        }

        $perPage = $request->get('per_page', 10);
        $perPage = in_array($perPage, [10, 15, 25, 50]) ? $perPage : 10;

        $invoices = $query->paginate($perPage);
        $invoices->appends($request->query());

        $vendors = Vendor::where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $purchaseOrders = PurchaseOrder::with(['vendor:id,name'])
            ->orderBy('po_number')
            ->get(['id', 'po_number', 'vendor_id']);

        return inertia('invoices/bulk-review', [
            'invoices' => $invoices,
            'filters' => [
                'search' => $request->get('search', ''),
                'sort_field' => $request->get('sort_field', 'created_at'),
                'vendor' => $request->vendor !== 'all' ? (int)$request->vendor : 'all',
                'purchase_order' => $request->purchase_order !== 'all' ? (int)$request->purchase_order : 'all',
                'status' => $request->status !== 'all' ? $request->status : 'all',
                'sort_direction' => $request->get('sort_direction', 'desc'),
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
                'per_page' => $request->get('per_page', 10),
            ],
            'filterOptions' => [
                'vendors' => $vendors,
                'purchaseOrders' => $purchaseOrders,
            ],
        ]);
    }

    // Bulk Mark Files Received
    public function bulkMarkReceived(Request $request)
    {
        $request->validate([
            'invoice_ids' => 'required|array',
            'invoice_ids.*' => 'exists:invoices,id',
            'notes' => 'nullable|string|max:1000',
        ]);

        DB::beginTransaction();

        try {
            $updated = Invoice::whereIn('id', $request->invoice_ids)
                ->update([
                    'files_received_at' => now(),
                    'invoice_status' => 'received',
                    'updated_at' => now(),
                ]);

            // Log activity for each invoice
            foreach ($request->invoice_ids as $invoiceId) {
                ActivityLog::create([
                    'loggable_type' => 'App\Models\Invoice',
                    'loggable_id' => $invoiceId,
                    'action' => 'bulk_mark_received',
                    'changes' => json_encode([
                        'files_received_at' => now(),
                        'invoice_status' => 'received',
                    ]),
                    'user_id' => auth()->id(),
                    'ip_address' => $request->ip(),
                    'notes' => $request->notes,
                ]);
            }

            DB::commit();

            return redirect()->back()->with('success', "Successfully marked {$updated} invoice(s) as received.");
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to update invoices: ' . $e->getMessage());
        }
    }

// Bulk Approve
    public function bulkApprove(Request $request)
    {
        $request->validate([
            'invoice_ids' => 'required|array',
            'invoice_ids.*' => 'exists:invoices,id',
            'notes' => 'nullable|string|max:1000',
        ]);

        DB::beginTransaction();

        try {
            // Validate all invoices have files received
            $invalidInvoices = Invoice::whereIn('id', $request->invoice_ids)
                ->whereNull('files_received_at')
                ->count();

            if ($invalidInvoices > 0) {
                throw ValidationException::withMessages([
                    'invoice_ids' => ["{$invalidInvoices} invoice(s) don't have files received yet. Mark them as received first before approving."],
                ]);
            }

            $updated = Invoice::whereIn('id', $request->invoice_ids)
                ->update([
                    'invoice_status' => 'approved',
                    'reviewed_by' => auth()->id(),
                    'reviewed_at' => now(),
                    'updated_at' => now(),
                ]);

            // Add remarks if provided
            if ($request->notes) {
                foreach ($request->invoice_ids as $invoiceId) {
                    Remark::create([
                        'remarkable_type' => 'App\Models\Invoice',
                        'remarkable_id' => $invoiceId,
                        'remark_text' => $request->notes,
                        'created_by' => auth()->id(),
                    ]);
                }
            }

            // Log activity
            foreach ($request->invoice_ids as $invoiceId) {
                ActivityLog::create([
                    'loggable_type' => 'App\Models\Invoice',
                    'loggable_id' => $invoiceId,
                    'action' => 'bulk_approve',
                    'changes' => json_encode([
                        'invoice_status' => 'approved',
                        'reviewed_by' => auth()->id(),
                        'reviewed_at' => now(),
                    ]),
                    'user_id' => auth()->id(),
                    'ip_address' => $request->ip(),
                    'notes' => $request->notes,
                ]);
            }

            DB::commit();

            return redirect()->back()->with('success', "Successfully approved {$updated} invoice(s).");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['Failed to approve invoices: '. $e->getMessage()]);
//            return redirect()->back()->with('error', 'Failed to approve invoices: ' . $e->getMessage());
        }
    }

// Bulk Reject
    public function bulkReject(Request $request)
    {
        $request->validate([
            'invoice_ids' => 'required|array',
            'invoice_ids.*' => 'exists:invoices,id',
            'notes' => 'required|string|max:1000',
        ]);

        DB::beginTransaction();

        try {
            $updated = Invoice::whereIn('id', $request->invoice_ids)
                ->update([
                    'invoice_status' => 'rejected',
                    'reviewed_by' => auth()->id(),
                    'reviewed_at' => now(),
                    'updated_at' => now(),
                ]);

            // Add rejection remarks (required)
            foreach ($request->invoice_ids as $invoiceId) {
                Remark::create([
                    'remarkable_type' => 'App\Models\Invoice',
                    'remarkable_id' => $invoiceId,
                    'remark_text' => 'REJECTION: ' . $request->notes,
                    'created_by' => auth()->id(),
                ]);

                ActivityLog::create([
                    'loggable_type' => 'App\Models\Invoice',
                    'loggable_id' => $invoiceId,
                    'action' => 'bulk_reject',
                    'changes' => json_encode([
                        'invoice_status' => 'rejected',
                        'reviewed_by' => auth()->id(),
                        'reviewed_at' => now(),
                    ]),
                    'user_id' => auth()->id(),
                    'ip_address' => $request->ip(),
                    'notes' => $request->notes,
                ]);
            }

            DB::commit();

            return redirect()->back()->with('warning', "Rejected {$updated} invoice(s). Reason: {$request->notes}");
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to reject invoices: ' . $e->getMessage());
        }
    }

    public function checkRequisition(Request $request)
    {
        $query = Invoice::with([
            'purchaseOrder' => function ($q) {
                $q->with(['project', 'vendor']);
            },
            'files'
        ])
            ->select('invoices.*')
            ->leftJoin('purchase_orders', 'purchase_orders.id', '=', 'invoices.purchase_order_id')
            ->where('invoices.invoice_status','!=', 'approved');

        // Search
        if ($request->has('search')) {
            $query->where(function ($query) use ($request) {
                $query->where('si_number', 'like', '%' . $request->search . '%')
                    ->orWhereHas('purchaseOrder.project', function ($q) use ($request) {
                        $q->where('project_title', 'like', '%' . $request->search . '%')
                            ->orWhere('cer_number', 'like', '%' . $request->search . '%');
                    })
                    ->orWhereHas('purchaseOrder.vendor', function ($q) use ($request) {
                        $q->where('name', 'like', '%' . $request->search . '%');
                    })
                    ->orWhereHas('purchaseOrder', function ($q) use ($request) {
                        $q->where('po_number', 'like', '%' . $request->search . '%');
                    });
            });
        }

        // Vendor filter
        if ($request->has('vendor') && $request->vendor !== 'all') {
            $query->whereHas('purchaseOrder', function ($q) use ($request) {
                $q->where('vendor_id', $request->vendor);
            });
        }

        // Status filter
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('invoice_status', $request->status);
        }

        // Date range filter
        if ($request->has('date_from')) {
            $query->where('si_date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('si_date', '<=', $request->date_to);
        }

        // Sorting
        $sortField = $request->get('sort_field', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        $sortMapping = [
            'si_number' => 'si_number',
            'created_at' => 'invoices.created_at',
        ];

        if (array_key_exists($sortField, $sortMapping)) {
            $query->orderBy($sortMapping[$sortField], $sortDirection);
        } else {
            $query->orderBy('invoices.created_at', 'desc');
        }

        $perPage = $request->get('per_page', 10);
        $perPage = in_array($perPage, [10, 15, 25, 50]) ? $perPage : 10;

        $invoices = $query->paginate($perPage);
        $invoices->appends($request->query());

        $vendors = Vendor::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return inertia('invoices/check-requisition', [
            'invoices' => $invoices,
            'filters' => [
                'search' => $request->get('search', ''),
                'sort_field' => $request->get('sort_field', 'created_at'),
                'vendor' => $request->vendor !== 'all' ? (int)$request->vendor : 'all',
                'status' => $request->status !== 'all' ? $request->status : 'all',
                'sort_direction' => $request->get('sort_direction', 'desc'),
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
                'per_page' => $request->get('per_page', 10),
            ],
            'filterOptions' => [
                'vendors' => $vendors,
            ],
        ]);

    }
}
