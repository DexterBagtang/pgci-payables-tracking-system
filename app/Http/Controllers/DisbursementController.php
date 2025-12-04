<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\CheckRequisition;
use App\Models\Disbursement;
use App\Models\File;
use App\Models\Invoice;
use App\Models\PurchaseOrder;
use Carbon\Carbon;
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

        // Project filter
        if ($request->filled('project_id')) {
            $query->whereHas('checkRequisitions.invoices.purchaseOrder', function ($q) use ($request) {
                $q->where('project_id', $request->project_id);
            });
        }

        // Account Code filter
        if ($request->filled('account_code')) {
            $query->whereHas('checkRequisitions', function ($q) use ($request) {
                $q->where('account_charge', $request->account_code);
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
                $q->select('check_requisitions.id', 'requisition_number', 'php_amount', 'payee_name',
                          'po_number', 'cer_number', 'si_number', 'account_charge', 'service_line_dist', 'purpose')
                  ->with([
                      'invoices' => function ($invQuery) {
                          $invQuery->select('invoices.id', 'purchase_order_id', 'si_number', 'si_date',
                                           'si_received_at', 'invoice_amount', 'net_amount', 'due_date')
                                   ->with([
                                       'purchaseOrder' => function ($poQuery) {
                                           $poQuery->select('id', 'po_number', 'vendor_id', 'project_id')
                                                   ->with([
                                                       'vendor:id,name,payment_terms',
                                                       'project:id,project_title,cer_number,project_type'
                                                   ]);
                                       }
                                   ]);
                      }
                  ]);
            }
        ])
        ->paginate(15)
        ->withQueryString();

        // Transform collection to add computed fields
        $disbursements->getCollection()->transform(function ($disbursement) {
            // Ensure checkRequisitions is loaded and available
            $checkReqs = $disbursement->checkRequisitions;

            $disbursement->total_amount = $checkReqs->sum('php_amount');
            $disbursement->check_requisition_count = $checkReqs->count();
            $disbursement->status = $disbursement->date_check_released_to_vendor ? 'released' : 'pending';

            // Compute vendor information (most common vendor)
            $vendors = collect();
            $projects = collect();
            $poNumbers = collect();
            $invoiceNumbers = collect();
            $payeeNames = collect();
            $accountCodes = collect();
            $agingDays = collect();

            foreach ($checkReqs as $cr) {
                if ($cr->payee_name) {
                    $payeeNames->push($cr->payee_name);
                }
                if ($cr->account_charge) {
                    $accountCodes->push($cr->account_charge);
                }

                foreach ($cr->invoices as $invoice) {
                    if ($invoice->purchaseOrder) {
                        $po = $invoice->purchaseOrder;

                        if ($po->vendor) {
                            $vendors->push($po->vendor);
                        }
                        if ($po->project) {
                            $projects->push($po->project);
                        }
                        if ($po->po_number) {
                            $poNumbers->push($po->po_number);
                        }
                    }

                    if ($invoice->si_number) {
                        $invoiceNumbers->push($invoice->si_number);
                    }

                    // Calculate aging
                    if ($invoice->si_received_at) {
                        $endDate = $disbursement->date_check_released_to_vendor ?? now();
                        $agingDays->push(Carbon::parse($invoice->si_received_at)->diffInDays($endDate));
                    }
                }
            }

            // Set primary vendor (most common)
            $disbursement->primary_vendor = $vendors->unique('id')->first();
            $disbursement->vendor_count = $vendors->unique('id')->count();

            // Set primary project (most common)
            $disbursement->primary_project = $projects->unique('id')->first();
            $disbursement->project_count = $projects->unique('id')->count();

            // Set payee names
            $disbursement->payee_names = $payeeNames->unique()->values()->all();
            $disbursement->primary_payee = $payeeNames->first();

            // Set PO and Invoice numbers
            $disbursement->po_numbers = $poNumbers->unique()->values()->all();
            $disbursement->invoice_numbers = $invoiceNumbers->unique()->values()->all();

            // Set account codes
            $disbursement->account_codes = $accountCodes->unique()->values()->all();
            $disbursement->primary_account = $accountCodes->first();

            // Set aging information
            $disbursement->average_aging = $agingDays->avg();
            $disbursement->max_aging = $agingDays->max();

            // Remove checkRequisitions from response to reduce payload size
            // All necessary data has been extracted to computed fields above
            unset($disbursement->checkRequisitions);

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
                'project_id' => $request->project_id,
                'account_code' => $request->account_code,
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
                'projects' => \App\Models\Project::select('id', 'project_title', 'cer_number')
                    ->where('project_status', 'active')
                    ->orderBy('project_title')
                    ->get(),
                'accountCodes' => \App\Models\CheckRequisition::select('account_charge')
                    ->distinct()
                    ->whereNotNull('account_charge')
                    ->orderBy('account_charge')
                    ->pluck('account_charge')
                    ->filter()
                    ->values()
                    ->all(),
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
                    $invoice->aging_days = Carbon::parse($invoice->si_received_at)->diffInDays(now());
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
        // Debug logging
        \Log::info('Disbursement store request', [
            'has_files' => $request->hasFile('files'),
            'files_count' => $request->hasFile('files') ? count($request->file('files')) : 0,
            'all_input_keys' => array_keys($request->all()),
        ]);

        $validated = $request->validate([
            'check_voucher_number' => 'nullable|string|unique:disbursements,check_voucher_number',
            'date_check_scheduled' => 'nullable|date',
            'date_check_released_to_vendor' => 'nullable|date',
            'date_check_printing' => 'nullable|date',
            'remarks' => 'nullable|string',
            'check_requisition_ids' => 'required|array',
            'check_requisition_ids.*' => 'exists:check_requisitions,id',
            'files' => 'nullable|array',
            'files.*' => 'file|mimes:pdf,jpg,jpeg,png|max:10240', // 10MB max per file
        ]);

        DB::beginTransaction();
        try {
            // Extract check_requisition_ids and files before creating the record
            $checkReqIds = $validated['check_requisition_ids'];
            unset($validated['check_requisition_ids']);

            // Remove files from validated array (handled separately via polymorphic relationship)
            unset($validated['files']);

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

                // Update invoices individually to trigger observer (syncs PO financials)
                Invoice::whereIn('id', $invoiceIds)->each(function($invoice) {
                    $invoice->update(['invoice_status' => 'paid']);
                });

                // Check and close purchase orders if all invoices are paid
                $this->checkAndClosePurchaseOrders($invoiceIds);
            } else {
                // Check not yet released - mark invoices as pending_disbursement (CRs already 'processed')
                // Update invoices individually to trigger observer (syncs PO financials)
                Invoice::whereIn('id', $invoiceIds)->each(function($invoice) {
                    $invoice->update(['invoice_status' => 'pending_disbursement']);
                });
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
                ->route('disbursements.index')
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
                'invoices.purchaseOrder.project',
                'generator:id,name'
            ])
            ->get();

        // Calculate aging for each invoice
        $checkRequisitions->each(function ($checkReq) use ($disbursement) {
            $checkReq->invoices->each(function ($invoice) use ($disbursement) {
                if ($invoice->si_received_at) {
                    // If check was released, calculate aging up to release date
                    if ($disbursement->date_check_released_to_vendor) {
                        $invoice->aging_days = Carbon::parse($invoice->si_received_at)->diffInDays($disbursement->date_check_released_to_vendor);
                    } else {
                        // Otherwise, calculate current aging
                        $invoice->aging_days = Carbon::parse($invoice->si_received_at)->diffInDays(now());
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

        // Calculate financial metrics
        $totalAmount = $checkRequisitions->sum('php_amount');
        $totalInvoices = $checkRequisitions->sum(function ($cr) {
            return $cr->invoices->count();
        });

        // Get unique payees with their total amounts
        $payees = $checkRequisitions->groupBy('payee_name')->map(function ($crs, $payeeName) {
            return [
                'name' => $payeeName,
                'amount' => $crs->sum('php_amount'),
                'check_requisition_count' => $crs->count(),
            ];
        })->values();

        // Get unique projects/accounts
        $projects = $checkRequisitions->flatMap(function ($cr) {
            return $cr->invoices->map(function ($invoice) {
                return $invoice->purchaseOrder->project ?? null;
            })->filter();
        })->unique('id')->values();

        $accounts = $checkRequisitions->pluck('account_charge')->filter()->unique()->values();

        return inertia('disbursements/show', [
            'disbursement' => $disbursement,
            'checkRequisitions' => $checkRequisitions,
            'files' => $files,
            'financialMetrics' => [
                'total_amount' => $totalAmount,
                'check_requisition_count' => $checkRequisitions->count(),
                'invoice_count' => $totalInvoices,
                'payee_count' => $payees->count(),
            ],
            'payees' => $payees,
            'projects' => $projects,
            'accounts' => $accounts,
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

        // Add invoice details and aging information to current check requisitions
        $currentCheckReqs->transform(function ($checkReq) {
            $invoices = $checkReq->invoices()->with('purchaseOrder.vendor')->get();

            // Calculate aging for each invoice
            $invoices->transform(function ($invoice) {
                if ($invoice->si_received_at) {
                    $invoice->aging_days = Carbon::parse($invoice->si_received_at)->diffInDays(now());
                } else {
                    $invoice->aging_days = null;
                }
                return $invoice;
            });

            $checkReq->invoices_with_aging = $invoices;
            return $checkReq;
        });

        // Get available approved check requisitions that can be added
        $query = CheckRequisition::query()
            ->with(['invoices', 'generator'])
            ->where(function ($q) use ($currentCheckReqs) {
                $q->where('requisition_status', 'approved')
                    ->orWhereIn('id', $currentCheckReqs->pluck('id')); // Include current check reqs
            });

        // Search filter
        if (request()->filled('search')) {
            $search = request()->search;
            $query->where(function ($q) use ($search) {
                $q->where('requisition_number', 'like', "%{$search}%")
                    ->orWhere('payee_name', 'like', "%{$search}%")
                    ->orWhere('po_number', 'like', "%{$search}%");
            });
        }

        $availableCheckReqs = $query->latest()->paginate(50);

        // Add invoice details and aging information to each check requisition
        $availableCheckReqs->getCollection()->transform(function ($checkReq) {
            $invoices = $checkReq->invoices()->with('purchaseOrder.vendor')->get();

            // Calculate aging for each invoice
            $invoices->transform(function ($invoice) {
                if ($invoice->si_received_at) {
                    $invoice->aging_days = Carbon::parse($invoice->si_received_at)->diffInDays(now());
                } else {
                    $invoice->aging_days = null;
                }
                return $invoice;
            });

            $checkReq->invoices_with_aging = $invoices;
            return $checkReq;
        });

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
            'check_voucher_number' => 'nullable|string|unique:disbursements,check_voucher_number,' . $disbursement->id,
            'date_check_scheduled' => 'nullable|date',
            'date_check_released_to_vendor' => 'nullable|date',
            'date_check_printing' => 'nullable|date',
            'remarks' => 'nullable|string',
            'check_requisition_ids' => 'required|array',
            'check_requisition_ids.*' => 'exists:check_requisitions,id',
            'files' => 'nullable|array',
            'files.*' => 'file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        DB::beginTransaction();
        try {
            $checkReqIds = $validated['check_requisition_ids'];
            unset($validated['check_requisition_ids']);

            // Remove files from validated array (handled separately via polymorphic relationship)
            unset($validated['files']);

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

                // Update invoices individually to trigger observer (syncs PO financials)
                Invoice::whereIn('id', $newInvoiceIds)->each(function($invoice) {
                    $invoice->update(['invoice_status' => 'paid']);
                });

                // Check and close purchase orders if all invoices are paid
                $this->checkAndClosePurchaseOrders($newInvoiceIds);
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

                // Update invoices individually to trigger observer (syncs PO financials)
                Invoice::whereIn('id', $newInvoiceIds)->each(function($invoice) {
                    $invoice->update(['invoice_status' => 'pending_disbursement']);
                });
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
                // Update invoices individually to trigger observer (syncs PO financials)
                Invoice::whereIn('id', $removedInvoiceIds)->each(function($invoice) {
                    $invoice->update(['invoice_status' => 'approved']);
                });
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
            // Update invoices individually to trigger observer (syncs PO financials)
            Invoice::whereIn('id', $invoiceIds)->each(function($invoice) {
                $invoice->update(['invoice_status' => 'approved']);
            });

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

    /**
     * Check if a check voucher number is unique
     */
    public function checkVoucherUnique(Request $request)
    {
        $voucherNumber = $request->get('voucher_number');
        $disbursementId = $request->get('disbursement_id'); // For edit mode

        if (empty($voucherNumber)) {
            return response()->json(['available' => true]);
        }

        $query = Disbursement::where('check_voucher_number', $voucherNumber);

        // Exclude current disbursement if editing
        if ($disbursementId) {
            $query->where('id', '!=', $disbursementId);
        }

        $exists = $query->exists();

        return response()->json(['available' => !$exists]);
    }

    /**
     * Check and close purchase orders if all their invoices are paid
     *
     * @param array $invoiceIds
     * @return void
     */
    private function checkAndClosePurchaseOrders(array $invoiceIds): void
    {
        if (empty($invoiceIds)) {
            return;
        }

        // Get all unique purchase order IDs from the invoices
        $purchaseOrderIds = Invoice::whereIn('id', $invoiceIds)
            ->distinct()
            ->pluck('purchase_order_id')
            ->filter()
            ->toArray();

        if (empty($purchaseOrderIds)) {
            return;
        }

        // For each purchase order, check if all invoices are paid
        foreach ($purchaseOrderIds as $poId) {
            $purchaseOrder = PurchaseOrder::find($poId);

            if (!$purchaseOrder) {
                continue;
            }

            // Skip if already closed or cancelled
            if (in_array($purchaseOrder->po_status, ['closed', 'cancelled'])) {
                continue;
            }

            // Check if all invoices are paid
            if ($purchaseOrder->allInvoicesPaid()) {
                // Ensure financials are synced (in case observer hasn't run yet)
                $purchaseOrder->syncFinancials();

                // Refresh to get updated values
                $purchaseOrder->refresh();

                // Only close if there's no outstanding amount
                if ($purchaseOrder->outstanding_amount <= 0) {
                    $purchaseOrder->update([
                        'po_status' => 'closed',
                        'closed_by' => auth()->id(),
                        'closed_at' => now(),
                        'closure_remarks' => 'Automatically closed - all invoices paid'
                    ]);

                    // Log the closure
                    ActivityLog::create([
                        'loggable_type' => PurchaseOrder::class,
                        'loggable_id' => $purchaseOrder->id,
                        'action' => 'status_changed',
                        'notes' => "Purchase order automatically closed after all invoices were paid via disbursement",
                        'user_id' => auth()->id(),
                        'ip_address' => request()->ip(),
                    ]);
                }
            }
        }
    }

    /**
     * Quick release a disbursement
     */
    public function quickRelease(Request $request, $id)
    {
        $disbursement = Disbursement::findOrFail($id);

        $validated = $request->validate([
            'date_check_released_to_vendor' => 'required|date',
            'release_notes' => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();
        try {
            $disbursement->update([
                'date_check_released_to_vendor' => $validated['date_check_released_to_vendor'],
            ]);

            // Get check requisition IDs
            $checkReqIds = $disbursement->checkRequisitions()->pluck('check_requisitions.id')->toArray();

            // Mark all CRs as paid
            CheckRequisition::whereIn('id', $checkReqIds)
                ->update(['requisition_status' => 'paid']);

            // Get all invoices and mark as paid
            $invoiceIds = CheckRequisition::whereIn('id', $checkReqIds)
                ->with('invoices')
                ->get()
                ->pluck('invoices')
                ->flatten()
                ->pluck('id')
                ->unique()
                ->toArray();

            // Update invoices individually to trigger observer (syncs PO financials)
            Invoice::whereIn('id', $invoiceIds)->each(function($invoice) {
                $invoice->update(['invoice_status' => 'paid']);
            });

            // Check and close purchase orders if all invoices are paid
            $this->checkAndClosePurchaseOrders($invoiceIds);

            // Log the quick release
            ActivityLog::create([
                'loggable_type' => Disbursement::class,
                'loggable_id' => $disbursement->id,
                'action' => 'quick_released',
                'notes' => $validated['release_notes'] ?? 'Check released via quick release action',
                'user_id' => auth()->id(),
                'ip_address' => $request->ip(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Disbursement released successfully',
                'disbursement' => $disbursement->fresh(),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Quick release error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to release disbursement: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk release multiple disbursements
     */
    public function bulkRelease(Request $request)
    {
        $validated = $request->validate([
            'disbursement_ids' => 'required|array',
            'disbursement_ids.*' => 'exists:disbursements,id',
            'date_check_released_to_vendor' => 'required|date',
            'release_notes' => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();
        try {
            $disbursements = Disbursement::whereIn('id', $validated['disbursement_ids'])
                ->whereNull('date_check_released_to_vendor')
                ->get();

            $releasedCount = 0;
            $totalAmount = 0;

            foreach ($disbursements as $disbursement) {
                $disbursement->update([
                    'date_check_released_to_vendor' => $validated['date_check_released_to_vendor'],
                ]);

                // Get check requisition IDs
                $checkReqIds = $disbursement->checkRequisitions()->pluck('check_requisitions.id')->toArray();

                // Mark all CRs as paid
                CheckRequisition::whereIn('id', $checkReqIds)
                    ->update(['requisition_status' => 'paid']);

                // Get all invoices and mark as paid
                $invoiceIds = CheckRequisition::whereIn('id', $checkReqIds)
                    ->with('invoices')
                    ->get()
                    ->pluck('invoices')
                    ->flatten()
                    ->pluck('id')
                    ->unique()
                    ->toArray();

                // Update invoices individually to trigger observer (syncs PO financials)
                Invoice::whereIn('id', $invoiceIds)->each(function($invoice) {
                    $invoice->update(['invoice_status' => 'paid']);
                });

                // Check and close purchase orders if all invoices are paid
                $this->checkAndClosePurchaseOrders($invoiceIds);

                // Calculate total amount
                $totalAmount += $disbursement->checkRequisitions()->sum('php_amount');

                // Log the release
                ActivityLog::create([
                    'loggable_type' => Disbursement::class,
                    'loggable_id' => $disbursement->id,
                    'action' => 'bulk_released',
                    'notes' => $validated['release_notes'] ?? 'Check released via bulk release action',
                    'user_id' => auth()->id(),
                    'ip_address' => $request->ip(),
                ]);

                $releasedCount++;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Successfully released {$releasedCount} disbursement(s)",
                'released_count' => $releasedCount,
                'total_amount' => $totalAmount,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Bulk release error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to release disbursements: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Undo release of a disbursement
     */
    public function undoRelease(Request $request, $id)
    {
        $disbursement = Disbursement::findOrFail($id);

        if (!$disbursement->date_check_released_to_vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Disbursement is not released',
            ], 400);
        }

        DB::beginTransaction();
        try {
            $disbursement->update([
                'date_check_released_to_vendor' => null,
            ]);

            // Get check requisition IDs
            $checkReqIds = $disbursement->checkRequisitions()->pluck('check_requisitions.id')->toArray();

            // Revert CRs to processed
            CheckRequisition::whereIn('id', $checkReqIds)
                ->update(['requisition_status' => 'processed']);

            // Get all invoices and revert to pending_disbursement
            $invoiceIds = CheckRequisition::whereIn('id', $checkReqIds)
                ->with('invoices')
                ->get()
                ->pluck('invoices')
                ->flatten()
                ->pluck('id')
                ->unique()
                ->toArray();

            // Update invoices individually to trigger observer (syncs PO financials)
            Invoice::whereIn('id', $invoiceIds)->each(function($invoice) {
                $invoice->update(['invoice_status' => 'pending_disbursement']);
            });

            // Log the undo
            ActivityLog::create([
                'loggable_type' => Disbursement::class,
                'loggable_id' => $disbursement->id,
                'action' => 'release_undone',
                'notes' => 'Check release was undone',
                'user_id' => auth()->id(),
                'ip_address' => $request->ip(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Disbursement release undone successfully',
                'disbursement' => $disbursement->fresh(),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Undo release error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to undo release: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get smart grouping suggestions for creating disbursements
     */
    public function smartGrouping(Request $request)
    {
        $query = CheckRequisition::query()
            ->with(['invoices.purchaseOrder.vendor', 'invoices.purchaseOrder.project'])
            ->where('requisition_status', 'approved');

        $checkRequisitions = $query->get();

        $suggestions = [];

        // Group by vendor
        $vendorGroups = $checkRequisitions->groupBy(function ($cr) {
            return $cr->invoices->first()?->purchaseOrder?->vendor?->id;
        })->filter(function ($group, $key) {
            return $key !== null && $group->count() > 1;
        });

        foreach ($vendorGroups as $vendorId => $crs) {
            $vendor = $crs->first()->invoices->first()->purchaseOrder->vendor;
            $totalAmount = $crs->sum('php_amount');

            // Calculate max aging
            $maxAging = 0;
            foreach ($crs as $cr) {
                foreach ($cr->invoices as $invoice) {
                    if ($invoice->si_received_at) {
                        $aging = Carbon::parse($invoice->si_received_at)->diffInDays(now());
                        if ($aging > $maxAging) {
                            $maxAging = $aging;
                        }
                    }
                }
            }

            $suggestions[] = [
                'type' => 'same_vendor',
                'title' => "Same Vendor - {$vendor->name}",
                'description' => "{$crs->count()} CRs · " . number_format($totalAmount, 2) . " PHP",
                'check_requisition_ids' => $crs->pluck('id')->toArray(),
                'count' => $crs->count(),
                'total_amount' => $totalAmount,
                'vendor_name' => $vendor->name,
                'max_aging' => $maxAging,
                'priority' => ($maxAging > 60 ? 'high' : ($maxAging > 30 ? 'medium' : 'low')),
                'suggested_date' => ($maxAging > 60 ? now()->toDateString() : now()->addDays(3)->toDateString()),
            ];
        }

        // Group by project
        $projectGroups = $checkRequisitions->groupBy(function ($cr) {
            return $cr->invoices->first()?->purchaseOrder?->project?->id;
        })->filter(function ($group, $key) {
            return $key !== null && $group->count() > 1;
        });

        foreach ($projectGroups as $projectId => $crs) {
            $project = $crs->first()->invoices->first()->purchaseOrder->project;
            $totalAmount = $crs->sum('php_amount');

            // Calculate max aging
            $maxAging = 0;
            foreach ($crs as $cr) {
                foreach ($cr->invoices as $invoice) {
                    if ($invoice->si_received_at) {
                        $aging = Carbon::parse($invoice->si_received_at)->diffInDays(now());
                        if ($aging > $maxAging) {
                            $maxAging = $aging;
                        }
                    }
                }
            }

            $suggestions[] = [
                'type' => 'same_project',
                'title' => "Same Project - {$project->cer_number}",
                'description' => "{$crs->count()} CRs · " . number_format($totalAmount, 2) . " PHP",
                'check_requisition_ids' => $crs->pluck('id')->toArray(),
                'count' => $crs->count(),
                'total_amount' => $totalAmount,
                'project_name' => $project->project_title,
                'max_aging' => $maxAging,
                'priority' => ($maxAging > 60 ? 'high' : ($maxAging > 30 ? 'medium' : 'low')),
                'suggested_date' => now()->addDays(5)->toDateString(),
            ];
        }

        // Find urgent aging items
        $urgentCrs = $checkRequisitions->filter(function ($cr) {
            foreach ($cr->invoices as $invoice) {
                if ($invoice->si_received_at) {
                    $aging = Carbon::parse($invoice->si_received_at)->diffInDays(now());
                    if ($aging > 60) {
                        return true;
                    }
                }
            }
            return false;
        });

        if ($urgentCrs->count() > 0) {
            $totalAmount = $urgentCrs->sum('php_amount');
            $suggestions[] = [
                'type' => 'urgent_aging',
                'title' => "Urgent - Invoices >60 Days Aging",
                'description' => "{$urgentCrs->count()} CRs · " . number_format($totalAmount, 2) . " PHP",
                'check_requisition_ids' => $urgentCrs->pluck('id')->toArray(),
                'count' => $urgentCrs->count(),
                'total_amount' => $totalAmount,
                'max_aging' => 60,
                'priority' => 'high',
                'suggested_date' => now()->toDateString(),
            ];
        }

        // Sort by priority
        usort($suggestions, function ($a, $b) {
            $priority = ['high' => 0, 'medium' => 1, 'low' => 2];
            return $priority[$a['priority']] - $priority[$b['priority']];
        });

        return response()->json([
            'suggestions' => array_slice($suggestions, 0, 5), // Top 5 suggestions
        ]);
    }

    /**
     * Get calendar data for disbursements
     */
    public function calendarData(Request $request)
    {
        $startDate = $request->get('start', now()->startOfMonth()->toDateString());
        $endDate = $request->get('end', now()->endOfMonth()->toDateString());

        $disbursements = Disbursement::query()
            ->with(['checkRequisitions'])
            ->whereBetween('date_check_scheduled', [$startDate, $endDate])
            ->get();

        $calendarEvents = $disbursements->map(function ($disbursement) {
            $totalAmount = $disbursement->checkRequisitions->sum('php_amount');
            $isReleased = $disbursement->date_check_released_to_vendor !== null;

            return [
                'id' => $disbursement->id,
                'title' => $disbursement->check_voucher_number,
                'start' => $disbursement->date_check_scheduled,
                'amount' => $totalAmount,
                'cr_count' => $disbursement->checkRequisitions->count(),
                'is_released' => $isReleased,
                'status' => $isReleased ? 'released' : 'pending',
                'color' => $isReleased ? '#10b981' : ($totalAmount > 100000 ? '#ef4444' : ($totalAmount > 50000 ? '#f59e0b' : '#3b82f6')),
            ];
        });

        // Group by date for summary
        $dailySummary = $disbursements->groupBy(function ($disbursement) {
            return $disbursement->date_check_scheduled;
        })->map(function ($group, $date) {
            return [
                'date' => $date,
                'count' => $group->count(),
                'total_amount' => $group->sum(function ($d) {
                    return $d->checkRequisitions->sum('php_amount');
                }),
            ];
        })->values();

        return response()->json([
            'events' => $calendarEvents,
            'daily_summary' => $dailySummary,
        ]);
    }

    /**
     * Get kanban data for aging-aware release queue
     */
    public function kanbanData(Request $request)
    {
        $disbursements = Disbursement::query()
            ->with(['checkRequisitions.invoices'])
            ->get();

        $kanbanColumns = [
            'overdue' => [],
            'due_this_week' => [],
            'scheduled_later' => [],
            'released' => [],
        ];

        foreach ($disbursements as $disbursement) {
            $totalAmount = $disbursement->checkRequisitions->sum('php_amount');
            $crCount = $disbursement->checkRequisitions->count();

            // Calculate max aging
            $maxAging = 0;
            foreach ($disbursement->checkRequisitions as $cr) {
                foreach ($cr->invoices as $invoice) {
                    if ($invoice->si_received_at) {
                        $endDate = $disbursement->date_check_released_to_vendor ?? now();
                        $aging = Carbon::parse($invoice->si_received_at)->diffInDays($endDate);
                        if ($aging > $maxAging) {
                            $maxAging = $aging;
                        }
                    }
                }
            }

            $card = [
                'id' => $disbursement->id,
                'check_voucher_number' => $disbursement->check_voucher_number,
                'date_check_scheduled' => $disbursement->date_check_scheduled,
                'date_check_released_to_vendor' => $disbursement->date_check_released_to_vendor,
                'total_amount' => $totalAmount,
                'cr_count' => $crCount,
                'max_aging' => $maxAging,
                'aging_status' => ($maxAging > 60 ? 'critical' : ($maxAging > 30 ? 'warning' : 'good')),
            ];

            // Categorize into columns
            if ($disbursement->date_check_released_to_vendor) {
                $kanbanColumns['released'][] = $card;
            } else if ($disbursement->date_check_scheduled && $disbursement->date_check_scheduled < now()->toDateString()) {
                $kanbanColumns['overdue'][] = $card;
            } else if ($disbursement->date_check_scheduled && $disbursement->date_check_scheduled <= now()->addDays(7)->toDateString()) {
                $kanbanColumns['due_this_week'][] = $card;
            } else {
                $kanbanColumns['scheduled_later'][] = $card;
            }
        }

        // Calculate summary statistics
        $summary = [
            'overdue_count' => count($kanbanColumns['overdue']),
            'overdue_amount' => collect($kanbanColumns['overdue'])->sum('total_amount'),
            'due_this_week_count' => count($kanbanColumns['due_this_week']),
            'due_this_week_amount' => collect($kanbanColumns['due_this_week'])->sum('total_amount'),
            'critical_aging_count' => collect($disbursements)->filter(function ($d) {
                foreach ($d->checkRequisitions as $cr) {
                    foreach ($cr->invoices as $invoice) {
                        if ($invoice->si_received_at) {
                            $aging = now()->diffInDays($invoice->si_received_at);
                            if ($aging > 60) return true;
                        }
                    }
                }
                return false;
            })->count(),
        ];

        return response()->json([
            'columns' => $kanbanColumns,
            'summary' => $summary,
        ]);
    }
}
