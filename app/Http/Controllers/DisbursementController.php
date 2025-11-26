<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\CheckRequisition;
use App\Models\Disbursement;
use App\Models\File;
use App\Models\Invoice;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DisbursementController extends Controller
{
    /**
     * Display a listing of disbursements
     */
    public function index(Request $request)
    {
        $query = Disbursement::query();

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('check_voucher_number', 'like', "%{$search}%")
                    ->orWhere('remarks', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'released') {
                $query->whereNotNull('date_check_released_to_vendor');
            } elseif ($request->status === 'pending') {
                $query->whereNull('date_check_released_to_vendor');
            } elseif ($request->status === 'scheduled') {
                $query->whereNotNull('date_check_scheduled')
                      ->whereNull('date_check_released_to_vendor');
            }
        }

        // Date range filter
        if ($request->has('date_from') || $request->has('date_to')) {
            $dateField = $request->get('date_field', 'date_check_scheduled');

            // Whitelist date fields
            if (!in_array($dateField, ['date_check_scheduled', 'date_check_released_to_vendor',
                                         'date_check_printing', 'created_at'])) {
                $dateField = 'date_check_scheduled';
            }

            if ($request->filled('date_from')) {
                $query->whereDate($dateField, '>=', $request->date_from);
            }

            if ($request->filled('date_to')) {
                $query->whereDate($dateField, '<=', $request->date_to);
            }
        }

        // Vendor filter
        if ($request->filled('vendor_id')) {
            $query->whereHas('checkRequisitions.invoices', function ($q) use ($request) {
                $q->whereHas('purchaseOrder', function ($poQuery) use ($request) {
                    $poQuery->where('vendor_id', $request->vendor_id);
                });
            });
        }

        // Purchase Order filter
        if ($request->filled('purchase_order_id')) {
            $query->whereHas('checkRequisitions.invoices', function ($q) use ($request) {
                $q->where('purchase_order_id', $request->purchase_order_id);
            });
        }

        // Check Requisition filter
        if ($request->filled('check_requisition_id')) {
            $query->whereHas('checkRequisitions', function ($q) use ($request) {
                $q->where('check_requisitions.id', $request->check_requisition_id);
            });
        }

        // Amount range filter - using subquery for aggregated amounts
        if ($request->filled('amount_min') || $request->filled('amount_max')) {
            $query->whereHas('checkRequisitions', function ($q) use ($request) {
                // This creates a subquery that filters based on total amount
            })->when($request->filled('amount_min') || $request->filled('amount_max'), function ($q) use ($request) {
                $q->whereIn('id', function ($subQuery) use ($request) {
                    $subQuery->select('disbursement_id')
                        ->from('check_requisition_disbursement')
                        ->join('check_requisitions', 'check_requisitions.id', '=', 'check_requisition_disbursement.check_requisition_id')
                        ->groupBy('disbursement_id');

                    if ($request->filled('amount_min')) {
                        $subQuery->havingRaw('SUM(check_requisitions.php_amount) >= ?', [$request->amount_min]);
                    }
                    if ($request->filled('amount_max')) {
                        $subQuery->havingRaw('SUM(check_requisitions.php_amount) <= ?', [$request->amount_max]);
                    }
                });
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        $allowedSorts = [
            'check_voucher_number',
            'date_check_scheduled',
            'date_check_released_to_vendor',
            'date_check_printing',
            'created_at'
        ];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Calculate statistics (before pagination)
        $statsQuery = clone $query;

        // Count statistics with conditional aggregation
        $statsResult = DB::table(DB::raw("({$statsQuery->toSql()}) as filtered_disbursements"))
            ->mergeBindings($statsQuery->getQuery())
            ->selectRaw("
                COUNT(*) as total_count,
                SUM(CASE WHEN date_check_released_to_vendor IS NOT NULL THEN 1 ELSE 0 END) as released_count,
                SUM(CASE WHEN date_check_released_to_vendor IS NULL THEN 1 ELSE 0 END) as pending_count,
                SUM(CASE WHEN date_check_scheduled IS NOT NULL
                         AND date_check_released_to_vendor IS NULL THEN 1 ELSE 0 END) as scheduled_count
            ")
            ->first();

        $statistics = [
            'total' => (int) $statsResult->total_count,
            'released' => (int) $statsResult->released_count,
            'pending' => (int) $statsResult->pending_count,
            'scheduled' => (int) $statsResult->scheduled_count,
        ];

        // Calculate financial aggregations
        $financialQuery = clone $query;
        $financialStats = $financialQuery
            ->reorder() // Clear any existing order by clauses to avoid ambiguity
            ->join('check_requisition_disbursement', 'disbursements.id', '=',
                   'check_requisition_disbursement.disbursement_id')
            ->join('check_requisitions', 'check_requisition_disbursement.check_requisition_id', '=',
                   'check_requisitions.id')
            ->selectRaw("
                SUM(check_requisitions.php_amount) as total_amount,
                SUM(CASE WHEN disbursements.date_check_released_to_vendor IS NOT NULL
                         THEN check_requisitions.php_amount ELSE 0 END) as released_amount,
                SUM(CASE WHEN disbursements.date_check_released_to_vendor IS NULL
                         THEN check_requisitions.php_amount ELSE 0 END) as pending_amount,
                AVG(check_requisitions.php_amount) as average_amount
            ")
            ->first();

        $statistics['total_amount'] = (float) ($financialStats->total_amount ?? 0);
        $statistics['released_amount'] = (float) ($financialStats->released_amount ?? 0);
        $statistics['pending_amount'] = (float) ($financialStats->pending_amount ?? 0);
        $statistics['average_amount'] = (float) ($financialStats->average_amount ?? 0);

        // Paginate with improved eager loading
        $disbursements = $query->with([
            'creator:id,name',
            'checkRequisitions' => function ($q) {
                $q->select('check_requisitions.id', 'requisition_number', 'php_amount', 'payee_name');
            }
        ])
        ->paginate(15)
        ->withQueryString();

        // Transform collection to add computed fields
        $disbursements->getCollection()->transform(function ($disbursement) {
            $disbursement->total_amount = $disbursement->checkRequisitions->sum('php_amount');
            $disbursement->check_requisition_count = $disbursement->checkRequisitions->count();
            $disbursement->status = $disbursement->date_check_released_to_vendor ? 'released' : 'pending';
            return $disbursement;
        });

        return inertia('disbursements/index', [
            'disbursements' => $disbursements,
            'statistics' => $statistics,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status ?? 'all',
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
                'date_field' => $request->get('date_field', 'date_check_scheduled'),
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
                'vendor_id' => $request->vendor_id,
                'purchase_order_id' => $request->purchase_order_id,
                'check_requisition_id' => $request->check_requisition_id,
                'amount_min' => $request->amount_min,
                'amount_max' => $request->amount_max,
            ],
            'filterOptions' => [
                'vendors' => \App\Models\Vendor::select('id', 'name')
                    ->orderBy('name')
                    ->get(),
                'purchaseOrders' => \App\Models\PurchaseOrder::select('id', 'po_number')
                    ->orderBy('po_number', 'desc')
                    ->limit(100)
                    ->get(),
                'checkRequisitions' => \App\Models\CheckRequisition::select('id', 'requisition_number', 'payee_name')
                    ->whereIn('requisition_status', ['approved', 'processed', 'paid'])
                    ->orderBy('requisition_number', 'desc')
                    ->limit(100)
                    ->get(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new disbursement (select approved check requisitions)
     */
    public function create(Request $request)
    {
        $query = CheckRequisition::with(['invoices', 'generator'])
            ->where('requisition_status', 'approved');

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('requisition_number', 'like', "%{$search}%")
                    ->orWhere('payee_name', 'like', "%{$search}%")
                    ->orWhere('po_number', 'like', "%{$search}%");
            });
        }

        $checkRequisitions = $query->latest()->paginate(20);

        // Add invoice details and aging information to each check requisition
        $checkRequisitions->getCollection()->transform(function ($checkReq) {
            $invoices = $checkReq->invoices()->with('purchaseOrder.vendor')->get();

            // Calculate aging for each invoice
            $invoices->transform(function ($invoice) {
                if ($invoice->si_received_at) {
                    $invoice->aging_days = now()->diffInDays($invoice->si_received_at);
                } else {
                    $invoice->aging_days = null;
                }
                return $invoice;
            });

            $checkReq->invoices_with_aging = $invoices;
            return $checkReq;
        });

        return inertia('disbursements/create', [
            'checkRequisitions' => $checkRequisitions,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created disbursement
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'check_voucher_number' => 'required|string|unique:disbursements,check_voucher_number',
            'date_check_scheduled' => 'nullable|date',
            'date_check_released_to_vendor' => 'nullable|date',
            'date_check_printing' => 'nullable|date',
            'remarks' => 'nullable|string',
            'check_requisition_ids' => 'required|array',
            'check_requisition_ids.*' => 'exists:check_requisitions,id',
            'files.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240', // 10MB max per file
        ]);

        DB::beginTransaction();
        try {
            // Extract check_requisition_ids before creating the record
            $checkReqIds = $validated['check_requisition_ids'];
            unset($validated['check_requisition_ids']);

            // Create disbursement
            $disbursement = Disbursement::create([
                ...$validated,
                'created_by' => auth()->id(),
            ]);

            // Link check requisitions
            $disbursement->checkRequisitions()->attach($checkReqIds);

            // Update check requisitions to 'processed' status
            CheckRequisition::whereIn('id', $checkReqIds)
                ->update([
                    'requisition_status' => 'processed',
                    'processed_at' => now(),
                    'processed_by' => auth()->id()
                ]);

            // Get all invoices from the selected check requisitions
            $invoiceIds = CheckRequisition::whereIn('id', $checkReqIds)
                ->with('invoices')
                ->get()
                ->pluck('invoices')
                ->flatten()
                ->pluck('id')
                ->unique()
                ->toArray();

            // Update invoice and check requisition statuses based on whether check was released
            if (!empty($validated['date_check_released_to_vendor'])) {
                // Check was released - mark CRs as paid and invoices as paid
                CheckRequisition::whereIn('id', $checkReqIds)
                    ->update(['requisition_status' => 'paid']);
                Invoice::whereIn('id', $invoiceIds)->update(['invoice_status' => 'paid']);
            } else {
                // Check not yet released - mark invoices as pending_disbursement (CRs already 'processed')
                Invoice::whereIn('id', $invoiceIds)->update(['invoice_status' => 'pending_disbursement']);
            }

            // Handle file uploads
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $uploadedFile) {
                    $filename = 'disbursement_' . $disbursement->check_voucher_number . '_' . time() . '_' . uniqid() . '.' . $uploadedFile->getClientOriginalExtension();
                    $path = 'disbursements/' . $filename;

                    // Ensure directory exists
                    if (!Storage::disk('public')->exists('disbursements')) {
                        Storage::disk('public')->makeDirectory('disbursements');
                    }

                    // Store file
                    Storage::disk('public')->putFileAs(
                        'disbursements',
                        $uploadedFile,
                        $filename
                    );

                    // Create file record
                    File::create([
                        'fileable_type' => Disbursement::class,
                        'fileable_id' => $disbursement->id,
                        'file_name' => $uploadedFile->getClientOriginalName(),
                        'file_path' => $path,
                        'file_type' => $uploadedFile->getClientOriginalExtension(),
                        'file_category' => 'document',
                        'file_purpose' => 'disbursement_document',
                        'file_size' => $uploadedFile->getSize(),
                        'disk' => 'public',
                        'is_active' => true,
                        'uploaded_by' => auth()->id(),
                    ]);
                }
            }

            // Log creation
            $disbursement->logCreation([
                'check_requisition_count' => count($checkReqIds),
            ]);

            DB::commit();

            return redirect()
                ->route('disbursements.show', $disbursement)
                ->with('success', 'Disbursement created successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Disbursement creation error: ' . $e->getMessage());
            return back()
                ->withInput()
                ->with('error', 'Failed to create disbursement: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified disbursement
     */
    public function show($id)
    {
        $disbursement = Disbursement::with([
            'creator:id,name',
            'activityLogs.user:id,name',
            'remarks.user:id,name',
        ])->findOrFail($id);

        // Get associated check requisitions with their invoices
        $checkRequisitions = $disbursement->checkRequisitions()
            ->with([
                'invoices.purchaseOrder.vendor',
                'generator:id,name'
            ])
            ->get();

        // Calculate aging for each invoice
        $checkRequisitions->each(function ($checkReq) use ($disbursement) {
            $checkReq->invoices->each(function ($invoice) use ($disbursement) {
                if ($invoice->si_received_at) {
                    // If check was released, calculate aging up to release date
                    if ($disbursement->date_check_released_to_vendor) {
                        $invoice->aging_days = $disbursement->date_check_released_to_vendor->diffInDays($invoice->si_received_at);
                    } else {
                        // Otherwise, calculate current aging
                        $invoice->aging_days = now()->diffInDays($invoice->si_received_at);
                    }
                } else {
                    $invoice->aging_days = null;
                }
            });
        });

        // Get attached files
        $files = $disbursement->files()
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('disbursements/show', [
            'disbursement' => $disbursement,
            'checkRequisitions' => $checkRequisitions,
            'files' => $files,
        ]);
    }

    /**
     * Show the form for editing the specified disbursement
     */
    public function edit($id)
    {
        $disbursement = Disbursement::with(['checkRequisitions.invoices'])->findOrFail($id);

        // Get current check requisitions
        $currentCheckReqs = $disbursement->checkRequisitions()
            ->with(['invoices', 'generator'])
            ->get();

        // Get available approved check requisitions that can be added
        $availableCheckReqs = CheckRequisition::query()
            ->with(['invoices', 'generator'])
            ->where('requisition_status', 'approved')
            ->orWhereIn('id', $currentCheckReqs->pluck('id')) // Include current check reqs
            ->latest()
            ->paginate(50);

        return inertia('disbursements/edit', [
            'disbursement' => $disbursement,
            'currentCheckRequisitions' => $currentCheckReqs,
            'availableCheckRequisitions' => $availableCheckReqs,
            'filters' => request()->only(['search']),
        ]);
    }

    /**
     * Update the specified disbursement
     */
    public function update(Request $request, $id)
    {
        $disbursement = Disbursement::findOrFail($id);

        $validated = $request->validate([
            'check_voucher_number' => 'required|string|unique:disbursements,check_voucher_number,' . $disbursement->id,
            'date_check_scheduled' => 'nullable|date',
            'date_check_released_to_vendor' => 'nullable|date',
            'date_check_printing' => 'nullable|date',
            'remarks' => 'nullable|string',
            'check_requisition_ids' => 'required|array',
            'check_requisition_ids.*' => 'exists:check_requisitions,id',
            'files.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        DB::beginTransaction();
        try {
            $checkReqIds = $validated['check_requisition_ids'];
            unset($validated['check_requisition_ids']);

            // Track old vs new check requisitions
            $oldCheckReqIds = $disbursement->checkRequisitions()->pluck('check_requisitions.id')->toArray();
            $addedCheckReqIds = array_diff($checkReqIds, $oldCheckReqIds);
            $removedCheckReqIds = array_diff($oldCheckReqIds, $checkReqIds);

            // Update disbursement
            $disbursement->update($validated);

            // Sync check requisitions
            $disbursement->checkRequisitions()->sync($checkReqIds);

            // Revert removed CRs to 'approved' status
            if (!empty($removedCheckReqIds)) {
                CheckRequisition::whereIn('id', $removedCheckReqIds)
                    ->update([
                        'requisition_status' => 'approved',
                        'processed_at' => null,
                        'processed_by' => null
                    ]);
            }

            // Update newly added CRs to 'processed'
            if (!empty($addedCheckReqIds)) {
                CheckRequisition::whereIn('id', $addedCheckReqIds)
                    ->update([
                        'requisition_status' => 'processed',
                        'processed_at' => now(),
                        'processed_by' => auth()->id()
                    ]);
            }

            // Update status based on check release date
            if (!empty($validated['date_check_released_to_vendor'])) {
                // Mark all CRs in this disbursement as 'paid'
                CheckRequisition::whereIn('id', $checkReqIds)
                    ->update(['requisition_status' => 'paid']);

                // Get all invoices and mark as paid
                $newInvoiceIds = CheckRequisition::whereIn('id', $checkReqIds)
                    ->with('invoices')
                    ->get()
                    ->pluck('invoices')
                    ->flatten()
                    ->pluck('id')
                    ->unique()
                    ->toArray();

                Invoice::whereIn('id', $newInvoiceIds)->update(['invoice_status' => 'paid']);
            } else {
                // Check not yet released - mark CRs as 'processed'
                CheckRequisition::whereIn('id', $checkReqIds)
                    ->where('requisition_status', '!=', 'paid')
                    ->update(['requisition_status' => 'processed']);

                // Get new invoices
                $newInvoiceIds = CheckRequisition::whereIn('id', $checkReqIds)
                    ->with('invoices')
                    ->get()
                    ->pluck('invoices')
                    ->flatten()
                    ->pluck('id')
                    ->unique()
                    ->toArray();

                Invoice::whereIn('id', $newInvoiceIds)->update(['invoice_status' => 'pending_disbursement']);
            }

            // Handle removed invoices - revert to approved status
            $oldInvoiceIds = CheckRequisition::whereIn('id', $oldCheckReqIds)
                ->with('invoices')
                ->get()
                ->pluck('invoices')
                ->flatten()
                ->pluck('id')
                ->unique()
                ->toArray();

            $newInvoiceIds = CheckRequisition::whereIn('id', $checkReqIds)
                ->with('invoices')
                ->get()
                ->pluck('invoices')
                ->flatten()
                ->pluck('id')
                ->unique()
                ->toArray();

            $removedInvoiceIds = array_diff($oldInvoiceIds, $newInvoiceIds);
            if (!empty($removedInvoiceIds)) {
                Invoice::whereIn('id', $removedInvoiceIds)
                    ->update(['invoice_status' => 'approved']);
            }

            // Handle file uploads
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $uploadedFile) {
                    $filename = 'disbursement_' . $disbursement->check_voucher_number . '_' . time() . '_' . uniqid() . '.' . $uploadedFile->getClientOriginalExtension();
                    $path = 'disbursements/' . $filename;

                    if (!Storage::disk('public')->exists('disbursements')) {
                        Storage::disk('public')->makeDirectory('disbursements');
                    }

                    Storage::disk('public')->putFileAs(
                        'disbursements',
                        $uploadedFile,
                        $filename
                    );

                    File::create([
                        'fileable_type' => Disbursement::class,
                        'fileable_id' => $disbursement->id,
                        'file_name' => $uploadedFile->getClientOriginalName(),
                        'file_path' => $path,
                        'file_type' => $uploadedFile->getClientOriginalExtension(),
                        'file_category' => 'document',
                        'file_purpose' => 'disbursement_document',
                        'file_size' => $uploadedFile->getSize(),
                        'disk' => 'public',
                        'is_active' => true,
                        'uploaded_by' => auth()->id(),
                    ]);
                }
            }

            // Log update
            ActivityLog::create([
                'loggable_type' => Disbursement::class,
                'loggable_id' => $disbursement->id,
                'action' => 'updated',
                'notes' => 'Disbursement updated',
                'user_id' => auth()->id(),
                'ip_address' => $request->ip(),
            ]);

            DB::commit();

            return redirect()
                ->route('disbursements.show', $disbursement)
                ->with('success', 'Disbursement updated successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Disbursement update error: ' . $e->getMessage());
            return back()
                ->withInput()
                ->with('error', 'Failed to update disbursement: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified disbursement
     */
    public function destroy($id)
    {
        $disbursement = Disbursement::findOrFail($id);

        DB::beginTransaction();
        try {
            // Get check requisition IDs before deleting
            $checkReqIds = $disbursement->checkRequisitions->pluck('id');

            // Revert check requisition statuses to 'approved'
            CheckRequisition::whereIn('id', $checkReqIds)
                ->update([
                    'requisition_status' => 'approved',
                    'processed_at' => null,
                    'processed_by' => null
                ]);

            // Get all invoice IDs before deleting
            $invoiceIds = CheckRequisition::whereIn('id', $checkReqIds)
                ->with('invoices')
                ->get()
                ->pluck('invoices')
                ->flatten()
                ->pluck('id')
                ->unique()
                ->toArray();

            // Reset invoice statuses back to approved
            Invoice::whereIn('id', $invoiceIds)->update(['invoice_status' => 'approved']);

            // Delete the disbursement (cascade will handle pivot table)
            $disbursement->delete();

            DB::commit();

            return redirect()
                ->route('disbursements.index')
                ->with('success', 'Disbursement deleted successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Disbursement deletion error: ' . $e->getMessage());
            return back()->with('error', 'Failed to delete disbursement');
        }
    }
}
