<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\CheckRequisition;
use App\Models\File;
use App\Models\Invoice;
use App\Models\PurchaseOrder;
use App\Models\Vendor;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Spatie\Browsershot\Browsershot;


class CheckRequisitionController extends Controller
{
    public function index(Request $request)
    {
        $query = CheckRequisition::query();

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('requisition_number', 'like', "%{$search}%")
                    ->orWhere('payee_name', 'like', "%{$search}%")
                    ->orWhere('po_number', 'like', "%{$search}%")
                    ->orWhere('cer_number', 'like', "%{$search}%")
                    ->orWhere('si_number', 'like', "%{$search}%")
                    ->orWhere('purpose', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('requisition_status', $request->status);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        $allowedSorts = [
            'requisition_number',
            'php_amount',
            'requisition_status',
            'request_date',
            'created_at'
        ];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $checkRequisitions = $query->paginate(15)->withQueryString();

        return inertia('check-requisitions/index', [
            'checkRequisitions' => $checkRequisitions,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
        ]);
    }

    public function create(Request $request)
    {
        $query = Invoice::with(['purchaseOrder.vendor', 'purchaseOrder.project'])
            ->where('invoice_status', 'approved');

        // Filter by vendor
        if ($request->filled('vendor')) {
            $query->whereHas('purchaseOrder', function ($q) use ($request) {
                $q->where('vendor_id', $request->vendor);
            });
        }

        // Search
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('si_number', 'like', '%' . $request->search . '%')
                    ->orWhereHas('purchaseOrder', function ($vq) use ($request) {
                        $vq->whereHas('vendor', function ($vr) use ($request) {
                            $vr->where('name', 'like', '%' . $request->search . '%');
                        });
                    });
            });
        }

        $invoices = $query->latest()->paginate(20);

        $filterOptions = [
            'vendors' => \App\Models\Vendor::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name'])
        ];

        return inertia('invoices/check-requisition', [
            'invoices' => $invoices,
            'filters' => $request->only(['search', 'vendor']),
            'filterOptions' => $filterOptions
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'request_date' => 'required|date',
            'payee_name' => 'required|string',
            'purpose' => 'required|string',
            'po_number' => 'required|string',
            'cer_number' => 'nullable|string',
            'si_number' => 'required|string',
            'account_charge' => 'nullable|string',
            'service_line_dist' => 'nullable|string',
            'php_amount' => 'required|numeric|min:0',
            'requested_by' => 'required|string',
            'reviewed_by' => 'nullable|string',
            'approved_by' => 'nullable|string',
            'amount_in_words' => 'required|string',
            'invoice_ids' => 'required|array',
            'invoice_ids.*' => 'exists:invoices,id'
        ]);

        // Extract invoice_ids before creating the record
        $invoiceIds = $validated['invoice_ids'];
        unset($validated['invoice_ids']); // Remove from validated data

        // Generate requisition number
        $lastReq = CheckRequisition::latest('id')->first();
        $nextNumber = $lastReq ? (int)substr($lastReq->requisition_number, -5) + 1 : 1;
        $validated['requisition_number'] = 'CR-' . date('Y') . '-' . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
        $validated['requisition_status'] = 'pending_approval';
        $validated['generated_by'] = auth()->id();

        // Create check requisition
        $checkReq = CheckRequisition::create($validated);

        // Link invoices using the junction table
        $checkReq->invoices()->attach($invoiceIds);

        Invoice::whereIn('id', $invoiceIds)->update(['invoice_status' => 'pending_disbursement']);

        try {
            // Render blade view to HTML
            $html = view('pdf.check-requisition-v2', [
                'checkReq' => $checkReq
            ])->render();

            // Generate filename and path
            $filename = 'check_requisition_' . $checkReq->requisition_number . '.pdf';
            $path = 'check_requisitions/' . $filename;

            // Ensure directory exists
            if (!Storage::disk('public')->exists('check_requisitions')) {
                Storage::disk('public')->makeDirectory('check_requisitions');
            }

            // Generate PDF with Browsershot
            $browsershot = Browsershot::html($html)
                ->format('A4')
                ->showBackground()
                ->setOption('args', ['--no-sandbox', '--disable-setuid-sandbox'])
                ->margins(10, 10, 10, 10);

            if (PHP_OS_FAMILY === 'Linux') {
                $browsershot->setOption(
                    'executablePath',
                    '/var/www/.cache/puppeteer/chrome-headless-shell/linux-141.0.7390.76/chrome-headless-shell-linux64/chrome-headless-shell'
                );
            }
            $browsershot->save(storage_path('app/public/' . $path));

            // Save to files table
            File::create([
                'fileable_type' => CheckRequisition::class,
                'fileable_id' => $checkReq->id,
                'file_name' => $filename,
                'file_path' => $path,
                'file_type' => 'pdf',
                'file_category' => 'document',
                'file_purpose' => 'check_requisition',
                'file_size' => Storage::disk('public')->size($path),
                'disk' => 'public',
                'is_active' => true,
                'uploaded_by' => auth()->id()
            ]);

        } catch (\Exception $e) {
            \Log::error('PDF Generation Error (Browsershot): ' . $e->getMessage());
        }

        return redirect()->back()->with('success', 'Check requisition created successfully');
    }

    public function show($id)
    {
        $checkRequisition = CheckRequisition::with([
            'generator:id,name',
            'processor:id,name'
        ])->findOrFail($id);

        // Get associated invoices through the junction table
        $invoices = $checkRequisition->invoices()
            ->select([
                'invoices.id',
                'invoices.si_number',
                'invoices.si_date',
                'invoices.invoice_amount',
                'invoices.tax_amount',
                'invoices.discount_amount',
                'invoices.net_amount',
                'invoices.invoice_status',
                'invoices.payment_type'
            ])
            ->get();

        // Get attached files
        $files = $checkRequisition->files()
            ->where('is_active', true)
            ->orderByRaw("CASE WHEN file_purpose = 'check_requisition' THEN 0 ELSE 1 END")
            ->orderBy('created_at', 'desc')
            ->get();

        // Get related purchase order for additional context
        $purchaseOrder = null;
        if ($checkRequisition->po_number) {
            $purchaseOrder = PurchaseOrder::where('po_number', $checkRequisition->po_number)
                ->select('id', 'po_number', 'po_amount', 'po_status', 'po_date')
                ->first();
        }

        return inertia('check-requisitions/show', [
            'checkRequisition' => $checkRequisition,
            'invoices' => $invoices,
            'files' => $files,
            'purchaseOrder' => $purchaseOrder,
        ]);
    }

    public function edit(CheckRequisition $checkRequisition)
    {
        // Only allow editing if status is pending_approval
        if ($checkRequisition->requisition_status == 'approved') {
            return redirect()
                ->route('check-requisitions.show', $checkRequisition)
                ->with('error', 'Cannot edit check requisition with status: ' . $checkRequisition->requisition_status);
        }

        // Get current invoices attached to this requisition
        $currentInvoices = $checkRequisition->invoices()
            ->with(['purchaseOrder.vendor', 'purchaseOrder.project'])
            ->get();

        // Get available approved invoices that can be added
        $availableInvoices = Invoice::query()
            ->with(['purchaseOrder.vendor', 'purchaseOrder.project'])
            ->where('invoice_status', 'approved')
            ->orWhereIn('id', $currentInvoices->pluck('id')) // Include current invoices
            ->latest()
            ->paginate(50);

        // Get filter options
        $vendors = Vendor::orderBy('name')->get(['id', 'name']);

        return inertia('check-requisitions/edit', [
            'checkRequisition' => $checkRequisition,
            'currentInvoices' => $currentInvoices,
            'availableInvoices' => $availableInvoices,
            'filters' => request()->only(['search', 'vendor']),
            'filterOptions' => [
                'vendors' => $vendors,
            ],
        ]);
    }

    public function update(Request $request, CheckRequisition $checkRequisition)
    {
        // Validate the request
        $validated = $request->validate([
            'request_date' => 'required|date',
            'payee_name' => 'required|string',
            'purpose' => 'required|string',
            'po_number' => 'required|string',
            'cer_number' => 'nullable|string',
            'si_number' => 'required|string',
            'account_charge' => 'nullable|string',
            'service_line_dist' => 'nullable|string',
            'php_amount' => 'required|numeric|min:0',
            'requested_by' => 'required|string',
            'reviewed_by' => 'nullable|string',
            'approved_by' => 'nullable|string',
            'amount_in_words' => 'required|string',
            'invoice_ids' => 'required|array',
            'invoice_ids.*' => 'exists:invoices,id'
        ]);

        // Extract invoice_ids before updating
        $invoiceIds = $validated['invoice_ids'];
        unset($validated['invoice_ids']);

        // Get old invoice IDs before syncing
        $oldInvoiceIds = $checkRequisition->invoices()->pluck('invoices.id')->toArray();

        // Update check requisition
        $checkRequisition->update([
            ...$validated,
            'requisition_status' => 'pending_approval',
            ]);

        // Sync invoices (this will add new ones and remove old ones)
        $checkRequisition->invoices()->sync($invoiceIds);

        // Update invoice statuses
        // Reset old invoices that were removed
        $removedInvoiceIds = array_diff($oldInvoiceIds, $invoiceIds);
        if (!empty($removedInvoiceIds)) {
            Invoice::whereIn('id', $removedInvoiceIds)
                ->update(['invoice_status' => 'approved']); // or whatever the previous status should be
        }

        // Set new invoices to pending_disbursement
        $newInvoiceIds = array_diff($invoiceIds, $oldInvoiceIds);
        if (!empty($newInvoiceIds)) {
            Invoice::whereIn('id', $newInvoiceIds)
                ->update(['invoice_status' => 'pending_disbursement']);
        }

        try {
            // Delete old PDF if exists
            $oldPdf = $checkRequisition->files()
                ->where('file_purpose', 'check_requisition')
                ->first();

            if ($oldPdf) {
                // Delete physical file
//                if (Storage::disk('public')->exists($oldPdf->file_path)) {
//                    Storage::disk('public')->delete($oldPdf->file_path);
//                }
                // Delete database record
//                $oldPdf->delete();
                // Instead of deleting, mark as inactive
                $oldPdf->update(['is_active' => false]);
            }

            // Regenerate PDF with updated data
            $html = view('pdf.check-requisition-v2', [
                'checkReq' => $checkRequisition->fresh(['invoices'])
            ])->render();

            $filename = 'check_requisition_' . $checkRequisition->requisition_number . '.pdf';
            $path = 'check_requisitions/' . $filename;

            if (!Storage::disk('public')->exists('check_requisitions')) {
                Storage::disk('public')->makeDirectory('check_requisitions');
            }

            Browsershot::html($html)
                ->format('A4')
                ->showBackground()
                ->margins(10, 10, 10, 10)
                ->save(storage_path('app/public/' . $path));

            // Create new file record
            File::create([
                'fileable_type' => CheckRequisition::class,
                'fileable_id' => $checkRequisition->id,
                'file_name' => $filename,
                'file_path' => $path,
                'file_type' => 'pdf',
                'file_category' => 'document',
                'file_purpose' => 'check_requisition',
                'file_size' => Storage::disk('public')->size($path),
                'disk' => 'public',
                'is_active' => true,
                'uploaded_by' => auth()->id()
            ]);

        } catch (\Exception $e) {
            \Log::error('PDF Regeneration Error (Browsershot): ' . $e->getMessage());
        }

        return redirect()
            ->route('check-requisitions.show', $checkRequisition)
            ->with('success', 'Check requisition updated successfully');
    }

    public function destroy($id)
    {
    }

    /**
     * Show the review page for a check requisition
     */
    public function review(CheckRequisition $checkRequisition)
    {
        // Load relationships
        $checkRequisition->load(['invoices', 'files', 'activityLogs.user']);

        return Inertia::render('check-requisitions/review', [
            'checkRequisition' => $checkRequisition,
            'invoices' => $checkRequisition->invoices,
            'files' => $checkRequisition->files,
            'activityLogs' => $checkRequisition->activityLogs()->with('user')->latest()->get(),
        ]);
    }

    /**
     * Approve a check requisition
     */
    public function approve(Request $request, CheckRequisition $checkRequisition)
    {
        // Validate that it's in the correct status
        if ($checkRequisition->requisition_status !== 'pending_approval') {
            return back()->with('error', 'Check requisition cannot be approved in current status');
        }

        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Update check requisition status
            $checkRequisition->update([
                'requisition_status' => 'approved',
                'approved_at' => now(),
                'processed_by' => auth()->id(),
            ]);

            // Update related invoices status
//            $checkRequisition->invoices()->update([
//                'invoice_status' => 'approved_for_payment'
//            ]);

            // Create activity log
            ActivityLog::create([
                'loggable_type' => CheckRequisition::class,
                'loggable_id' => $checkRequisition->id,
                'action' => 'approved',
                'notes' => $validated['notes'] ?? 'Check requisition approved digitally',
                'user_id' => auth()->id(),
                'ip_address' => $request->ip(),
                'changes' => json_encode([
                    'status' => [
                        'from' => 'pending_approval',
                        'to' => 'approved'
                    ],
                    'approved_at' => now()->toDateTimeString(),
                    'approved_by' => auth()->user()->name,
                ]),
            ]);

            DB::commit();

            return redirect()
                ->route('check-requisitions.show', $checkRequisition)
                ->with('success', 'Check requisition approved successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Check requisition approval error: ' . $e->getMessage());
//            return back()->with('error', 'Failed to approve check requisition');
            throw new \Exception($e->getMessage());
        }
    }

    /**
     * Reject a check requisition
     */
    public function reject(Request $request, CheckRequisition $checkRequisition)
    {
        // Validate that it's in the correct status
        if ($checkRequisition->requisition_status !== 'pending_approval') {
            return back()->with('error', 'Check requisition cannot be rejected in current status');
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Update check requisition status
            $checkRequisition->update([
                'requisition_status' => 'rejected',
                'processed_by' => auth()->id(),
            ]);

            // Revert related invoices back to approved status
            $checkRequisition->invoices()->update([
                'invoice_status' => 'approved'
            ]);

            // Create activity log
            ActivityLog::create([
                'loggable_type' => CheckRequisition::class,
                'loggable_id' => $checkRequisition->id,
                'action' => 'rejected',
                'notes' => "Rejection Reason: {$validated['rejection_reason']}" .
                    ($validated['notes'] ? "\nAdditional Notes: {$validated['notes']}" : ''),
                'user_id' => auth()->id(),
                'ip_address' => $request->ip(),
                'changes' => json_encode([
                    'status' => [
                        'from' => 'pending_approval',
                        'to' => 'rejected'
                    ],
                    'rejected_at' => now()->toDateTimeString(),
                    'rejected_by' => auth()->user()->name,
                    'rejection_reason' => $validated['rejection_reason'],
                ]),
            ]);

            DB::commit();

            return redirect()
                ->route('check-requisitions.show', $checkRequisition)
                ->with('success', 'Check requisition rejected');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Check requisition rejection error: ' . $e->getMessage());
            return back()->with('error', 'Failed to reject check requisition');
        }
    }

    /**
     * Upload signed document and approve
     */
    public function uploadSigned(Request $request, CheckRequisition $checkRequisition)
    {
        // Validate that it's in the correct status
        if ($checkRequisition->requisition_status !== 'pending_approval') {
            return back()->with('error', 'Check requisition cannot be processed in current status');
        }

        $validated = $request->validate([
            'signed_document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240', // 10MB
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Store the uploaded file
            $file = $request->file('signed_document');
            $filename = 'signed_cr_' . $checkRequisition->requisition_number . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = 'check_requisitions/signed/' . $filename;

            // Ensure directory exists
            if (!Storage::disk('public')->exists('check_requisitions/signed')) {
                Storage::disk('public')->makeDirectory('check_requisitions/signed');
            }

            // Store file
            Storage::disk('public')->putFileAs(
                'check_requisitions/signed',
                $file,
                $filename
            );

            // Create file record
            File::create([
                'fileable_type' => CheckRequisition::class,
                'fileable_id' => $checkRequisition->id,
                'file_name' => $filename,
                'file_path' => $path,
                'file_type' => $file->getClientOriginalExtension(),
                'file_category' => 'document',
                'file_purpose' => 'signed_check_requisition',
                'file_size' => $file->getSize(),
                'disk' => 'public',
                'description' => 'Physically signed check requisition',
                'is_active' => true,
                'uploaded_by' => auth()->id(),
            ]);

            // Update check requisition status
            $checkRequisition->update([
                'requisition_status' => 'approved',
                'approved_at' => now(),
                'processed_by' => auth()->id(),
            ]);

//            // Update related invoices status
//            $checkRequisition->invoices()->update([
//                'invoice_status' => 'approved_for_payment'
//            ]);

            // Create activity log
            ActivityLog::create([
                'loggable_type' => CheckRequisition::class,
                'loggable_id' => $checkRequisition->id,
                'action' => 'approved_with_signed_document',
                'notes' => ($validated['notes'] ?? 'Signed document uploaded') . "\nFile: {$filename}",
                'user_id' => auth()->id(),
                'ip_address' => $request->ip(),
                'changes' => json_encode([
                    'status' => [
                        'from' => 'pending_approval',
                        'to' => 'approved'
                    ],
                    'approved_at' => now()->toDateTimeString(),
                    'approved_by' => auth()->user()->name,
                    'approval_method' => 'physical_document',
                    'file_uploaded' => $filename,
                ]),
            ]);

            DB::commit();

            return redirect()
                ->route('check-requisitions.show', $checkRequisition)
                ->with('success', 'Signed document uploaded and check requisition approved');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Signed document upload error: ' . $e->getMessage());
            throw new \Exception($e->getMessage());
        }
    }

}
