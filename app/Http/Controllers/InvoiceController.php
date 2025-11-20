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

        // Date range filter
        if ($request->has('date_from') || $request->has('date_to')) {
            $dateField = $request->get('date_field', 'si_date');

            // Validate date_field to prevent SQL injection
            if (!in_array($dateField, ['si_date', 'si_received_at', 'created_at', 'due_date'])) {
                $dateField = 'si_date';
            }

            if ($request->has('date_from') && !empty($request->date_from)) {
                $baseQuery->whereDate("invoices.{$dateField}", '>=', $request->date_from);
            }

            if ($request->has('date_to') && !empty($request->date_to)) {
                $baseQuery->whereDate("invoices.{$dateField}", '<=', $request->date_to);
            }
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
                'date_field' => $request->get('date_field', 'si_date'),
                'date_from' => $request->get('date_from', null),
                'date_to' => $request->get('date_to', null),
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
        // Handle both regular form submission and optimized FormData submission
        $invoicesData = $request->has('_invoices_json')
            ? json_decode($request->input('_invoices_json'), true)
            : $request->input('invoices', []);

        // Handle deduplicated files from frontend (new optimized format)
        if ($request->has('unique_files')) {
            $uniqueFiles = $request->file('unique_files', []);

            // Map file references back to actual files for each invoice
            foreach ($invoicesData as $index => &$invoiceData) {
                $invoiceData['files'] = [];

                // Check if this invoice has file references
                $fileRefs = $request->input("invoices.{$index}.file_refs", []);

                foreach ($fileRefs as $refIndex) {
                    if (isset($uniqueFiles[$refIndex])) {
                        $invoiceData['files'][] = $uniqueFiles[$refIndex];
                    }
                }
            }
            unset($invoiceData); // Break reference
        }
        // Legacy format: files sent per invoice (backward compatibility)
        elseif ($request->has('invoices')) {
            foreach ($request->file('invoices', []) as $index => $fileData) {
                if (isset($fileData['files'])) {
                    $invoicesData[$index]['files'] = $fileData['files'];
                }
            }
        }

        $validator = Validator::make(['invoices' => $invoicesData], [
            'invoices' => 'required|array|min:1',
            'invoices.*.purchase_order_id' => 'required|exists:purchase_orders,id',
            'invoices.*.si_number' => 'required|string|max:255',
            'invoices.*.si_date' => 'required|date',
            'invoices.*.si_received_at' => 'required|date',
            'invoices.*.invoice_amount' => 'required|numeric|min:0',
            'invoices.*.currency' => 'nullable|in:PHP,USD',
            'invoices.*.tax_amount' => 'nullable|numeric|min:0',
            'invoices.*.discount_amount' => 'nullable|numeric|min:0',
            'invoices.*.terms_of_payment' => 'required|string',
            'invoices.*.other_payment_terms' => 'nullable|string',
            'invoices.*.due_date' => 'nullable|date',
            'invoices.*.notes' => 'nullable|string',
            'invoices.*.submitted_at' => 'nullable|date',
            'invoices.*.submitted_to' => 'nullable|string|max:255',
            'invoices.*.files' => 'nullable|array',
            'invoices.*.files.*' => 'file|max:20480|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png',
        ]);

        $validator->after(function ($validator) use ($invoicesData) {
            $invoices = $invoicesData;

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

        // Start transaction
        DB::beginTransaction();

        try {
            $now = now();
            $userId = auth()->id();

            // Prepare bulk data arrays
            $invoicesData = [];
            $filesData = [];
            $activityLogsData = [];

            // File deduplication map: hash => [file object, stored path]
            $uniqueFiles = [];
            $fileHashMap = [];

            // First pass - Prepare invoice data and identify unique files
            foreach ($validated['invoices'] as $index => $invoiceData) {
                $files = $invoiceData['files'] ?? [];
                unset($invoiceData['files']);

                // Add computed fields
                $invoiceData['net_amount'] = $invoiceData['invoice_amount'];
                if ($invoiceData['due_date'] == null) {
                    $invoiceData['due_date'] = Carbon::parse($invoiceData['si_received_at'])->addDays(30);
                }

                // Prepare invoice data for bulk insert
                $invoicesData[] = [
                    ...$invoiceData,
                    'invoice_status' => 'pending',
                    'created_by' => $userId,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                // Process files for deduplication
                $processedFiles = [];
                foreach ($files as $file) {
                    if ($file && $file->isValid()) {
                        // Create a unique identifier based on file name, size, and content hash
                        $fileHash = md5($file->getClientOriginalName() . $file->getSize() . file_get_contents($file->getRealPath()));

                        if (!isset($uniqueFiles[$fileHash])) {
                            // This is a new unique file
                            $uniqueFiles[$fileHash] = [
                                'file' => $file,
                                'original_name' => $file->getClientOriginalName(),
                                'mime_type' => $file->getClientMimeType(),
                                'size' => $file->getSize(),
                            ];
                        }

                        $processedFiles[] = ['hash' => $fileHash];
                    }
                }

                // Store files for later processing (after we get invoice IDs)
                $invoicesData[$index]['_files_to_upload'] = $processedFiles;
            }

            // Store unique files only once
            foreach ($uniqueFiles as $hash => $fileData) {
                $file = $fileData['file'];
                $filePath = $file->store('invoices/files', 'public');
                $fileHashMap[$hash] = [
                    'file_path' => $filePath,
                    'file_name' => $fileData['original_name'],
                    'file_type' => $fileData['mime_type'],
                    'file_size' => $fileData['size'],
                ];
            }

            // Bulk insert invoices
            DB::table('invoices')->insert(array_map(function($inv) {
                unset($inv['_files_to_upload']);
                return $inv;
            }, $invoicesData));

            // Get the inserted invoice IDs
            $firstInvoice = DB::table('invoices')
                ->where('created_by', $userId)
                ->where('created_at', $now)
                ->orderBy('id')
                ->first();

            if (!$firstInvoice) {
                throw new \Exception('Failed to retrieve created invoices');
            }

            $startId = $firstInvoice->id;

            // Second pass - Prepare file records and activity logs
            foreach ($invoicesData as $index => $invoiceData) {
                $invoiceId = $startId + $index;
                $files = $invoiceData['_files_to_upload'] ?? [];

                // Prepare activity log
                $activityLogsData[] = [
                    'loggable_type' => 'App\Models\Invoice',
                    'loggable_id' => $invoiceId,
                    'action' => 'created',
                    'changes' => json_encode([
                        'si_number' => $invoiceData['si_number'],
                        'invoice_amount' => $invoiceData['invoice_amount'],
                    ]),
                    'user_id' => $userId,
                    'ip_address' => request()->ip(),
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                // Create file records using deduplicated file paths
                foreach ($files as $fileRef) {
                    $hash = $fileRef['hash'];
                    if (isset($fileHashMap[$hash])) {
                        $fileInfo = $fileHashMap[$hash];

                        // Prepare file record (reusing same file_path for duplicates)
                        $filesData[] = [
                            'fileable_type' => 'App\Models\Invoice',
                            'fileable_id' => $invoiceId,
                            'file_name' => $fileInfo['file_name'],
                            'file_path' => $fileInfo['file_path'],
                            'file_type' => $fileInfo['file_type'],
                            'file_category' => 'invoice',
                            'file_purpose' => 'documentation',
                            'file_size' => $fileInfo['file_size'],
                            'disk' => 'public',
                            'uploaded_by' => $userId,
                            'is_active' => true,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];
                    }
                }
            }

            // Bulk insert files (if any)
            if (!empty($filesData)) {
                foreach (array_chunk($filesData, 100) as $chunk) {
                    DB::table('files')->insert($chunk);
                }
            }

            // Bulk insert activity logs
            if (!empty($activityLogsData)) {
                foreach (array_chunk($activityLogsData, 100) as $chunk) {
                    DB::table('activity_logs')->insert($chunk);
                }
            }

            DB::commit();

            $count = count($invoicesData);

            // Redirect to invoices index with success message
            return redirect()->route('invoices.index')
                ->with('success', "{$count} invoice(s) created successfully!");

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Bulk invoice creation failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            // Return back with error
            return back()
                ->withErrors(['error' => 'Failed to create invoices: ' . $e->getMessage()])
                ->withInput();
        }
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
            'currency' => 'nullable|in:PHP,USD',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'submitted_at' => 'nullable|date',
            'submitted_to' => 'nullable|string|max:255',
            'files.*' => 'file|max:20480|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png',
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

        // Log update using trait
        $invoice->logUpdate($changes);

        // Handle new file uploads only (no deletion)
        if (!empty($fileData)) {
            foreach ($fileData as $file) {
                $originalName = $file->getClientOriginalName();
                $filePath = $file->store('invoices/files', 'public');

                $invoice->files()->create([
                    'file_name' => $originalName,
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

//        return redirect()
//            ->route('invoices.show', $invoice)
        return back()
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
        $oldStatus = $invoice->invoice_status;

        $invoice->fill([
            'invoice_status' => $request->approvalStatus,
        ])->save();

        // Log status change using trait
        $invoice->logStatusChange($oldStatus, $request->approvalStatus, $request->remarks);

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
            ->whereNotIn('invoices.invoice_status', ['approved', 'pending_disbursement', 'paid']);

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

        $perPage = $request->get('per_page', 100);
        $perPage = in_array($perPage, [10, 15, 25, 50, 100, 200, 500]) ? $perPage : 100;

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
                'per_page' => $request->get('per_page', 100),
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
