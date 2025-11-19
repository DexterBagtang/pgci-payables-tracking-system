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

        $disbursements = $query->with(['creator:id,name', 'checkRequisitions'])
            ->paginate(15)
            ->withQueryString();

        return inertia('disbursements/index', [
            'disbursements' => $disbursements,
            'filters' => [
                'search' => $request->search,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
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

            // Get all invoices from the selected check requisitions
            $invoiceIds = CheckRequisition::whereIn('id', $checkReqIds)
                ->with('invoices')
                ->get()
                ->pluck('invoices')
                ->flatten()
                ->pluck('id')
                ->unique()
                ->toArray();

            // Update invoice statuses based on whether check was released
            if (!empty($validated['date_check_released_to_vendor'])) {
                // Check was released - mark invoices as paid
                Invoice::whereIn('id', $invoiceIds)->update(['invoice_status' => 'paid']);
            } else {
                // Check not yet released - mark invoices as pending_disbursement
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

            // Track old check req IDs to determine changes
            $oldCheckReqIds = $disbursement->checkRequisitions()->pluck('check_requisitions.id')->toArray();

            // Get old invoices
            $oldInvoiceIds = CheckRequisition::whereIn('id', $oldCheckReqIds)
                ->with('invoices')
                ->get()
                ->pluck('invoices')
                ->flatten()
                ->pluck('id')
                ->unique()
                ->toArray();

            // Update disbursement
            $disbursement->update($validated);

            // Sync check requisitions
            $disbursement->checkRequisitions()->sync($checkReqIds);

            // Get new invoices
            $newInvoiceIds = CheckRequisition::whereIn('id', $checkReqIds)
                ->with('invoices')
                ->get()
                ->pluck('invoices')
                ->flatten()
                ->pluck('id')
                ->unique()
                ->toArray();

            // Reset removed invoices to pending_disbursement
            $removedInvoiceIds = array_diff($oldInvoiceIds, $newInvoiceIds);
            if (!empty($removedInvoiceIds)) {
                Invoice::whereIn('id', $removedInvoiceIds)
                    ->update(['invoice_status' => 'pending_disbursement']);
            }

            // Update invoice statuses based on whether check was released
            if (!empty($validated['date_check_released_to_vendor'])) {
                Invoice::whereIn('id', $newInvoiceIds)->update(['invoice_status' => 'paid']);
            } else {
                Invoice::whereIn('id', $newInvoiceIds)->update(['invoice_status' => 'pending_disbursement']);
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
            // Get all invoice IDs before deleting
            $invoiceIds = CheckRequisition::whereIn('id', $disbursement->checkRequisitions->pluck('id'))
                ->with('invoices')
                ->get()
                ->pluck('invoices')
                ->flatten()
                ->pluck('id')
                ->unique()
                ->toArray();

            // Reset invoice statuses back to pending_disbursement
            Invoice::whereIn('id', $invoiceIds)->update(['invoice_status' => 'pending_disbursement']);

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
