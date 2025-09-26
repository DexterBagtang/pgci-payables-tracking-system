<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Project;
use App\Models\PurchaseOrder;
use App\Models\Vendor;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class InvoiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Invoice::with([
            'purchaseOrder.project',
            'purchaseOrder.vendor'
        ])
            ->select('invoices.*')
            ->leftJoin('purchase_orders', 'purchase_orders.id', '=', 'invoices.purchase_order_id');

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

        if ($request->has('vendor') && $request->vendor !== 'all') {
            $query->whereHas('purchaseOrder.vendor', function ($q) use ($request) {
                $q->where('vendor_id', $request->vendor);
            });
        }

        if ($request->has('project') && $request->project !== 'all') {
            $query->whereHas('purchaseOrder.project', function ($q) use ($request) {
                $q->where('project_id', $request->project);
            });
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('invoice_status', $request->status);
        }

        $sortField = $request->get('sort_field', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        $sortMapping = [
            'si_number' => 'si_number',
            'created_at' => 'invoices.created_at',
        ];

        if (array_key_exists($sortField, $sortMapping)) {
            $query->orderBy($sortMapping[$sortField], $sortDirection);
        } else {
            $query->orderBy('updated_at', 'desc');
        }

        $perPage = $request->get('per_page', 10);
        $perPage = in_array($perPage, [10, 15, 25, 50]) ? $perPage : 10;

        $invoices = $query->paginate($request->get($perPage));

        $invoices->appends($request->query());

        $vendors = Vendor::where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $projects = Project::all(['id', 'project_title']);

        return inertia('invoices/index', [
            'invoices' => $invoices,
            'filters' => [
                'search' => $request->get('search', ''),
                'sort_field' => $request->get('sort_field', 'po_date'),
                'vendor' => $request->vendor !== 'all' ? (int)$request->vendor : 'all',
                'project' => $request->project !== 'all' ? (int)$request->project : 'all',
                'status' => $request->status !== 'all' ? $request->status : 'all',
                'sort_direction' => $request->get('sort_direction', 'desc'),
                'per_page' => $request->get('per_page', 10),
            ],
            'filterOptions' => [
                'vendors' => $vendors,
                'projects' => $projects,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('invoices/create', [
            'purchaseOrders' => PurchaseOrder::with(['project', 'vendor'])->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
//    public function store(Request $request)
//    {
//
//        $validated = $request->validate([
//            'purchase_order_id' => 'required|exists:purchase_orders,id',
//            'si_number' => 'required|string|max:255|unique:invoices',
//            'si_date' => 'required|date',
//            'received_date' => 'nullable|date',
//            'invoice_amount' => 'required|numeric|min:0',
//            'tax_amount' => 'nullable|numeric|min:0',
//            'discount_amount' => 'nullable|numeric|min:0',
//            'due_date' => 'required|date',
//            'notes' => 'nullable|string',
//            'submitted_at' => 'nullable|date',
//            'submitted_to' => 'nullable|string|max:255',
//            'files.*' => 'file|max:10240|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png',
//        ]);
//
//        unset($validated['files']);
//
//        $validated['net_amount'] = $validated['invoice_amount'];
//
//        // Create invoice
//        $invoice = Invoice::create([
//            ...$validated,
//            'si_received_at' => now(),
//            'created_by' => auth()->id(),
//        ]);
//
//        $invoice->activityLogs()->create([
//           'action' => 'created',
//           'user_id' => auth()->id(),
//            'ip_address' => $request->ip(),
//            'changes' => json_encode($invoice->toArray()),
//            'notes' => $validated['notes'],
//        ]);
//
//        // Handle file uploads
//        if ($request->hasFile('files')) {
//            foreach ($request->file('files') as $file) {
//                $filePath = $file->store('invoices/files', 'public');
//
//                $invoice->files()->create([
//                    'file_name' => $file->getClientOriginalName(),
//                    'file_path' => $filePath,
//                    'file_type' => $file->getClientMimeType(),
//                    'file_category' => 'invoice',
//                    'file_purpose' => 'documentation',
//                    'file_size' => $file->getSize(),
//                    'disk' => 'public',
//                    'uploaded_by' => auth()->id(),
//                    'is_active' => true,
//                ]);
//            }
//        }
//
//        return back()->with('success', 'Invoice created successfully!');
//
//    }

    public function store(Request $request)
    {
//        dd($request->all());
        $validated = $request->validate([
            'invoices' => 'required|array|min:1',
            'invoices.*.purchase_order_id' => 'required|exists:purchase_orders,id',
            'invoices.*.si_number' => 'required|string|max:255|unique:invoices,si_number',
            'invoices.*.si_date' => 'required|date',
            'invoices.*.si_received_at' => 'required|date',
            'invoices.*.invoice_amount' => 'required|numeric|min:0',
            'invoices.*.tax_amount' => 'nullable|numeric|min:0',
            'invoices.*.discount_amount' => 'nullable|numeric|min:0',
            'invoices.*.due_date' => 'nullable|date',
            'invoices.*.notes' => 'nullable|string',
            'invoices.*.submitted_at' => 'nullable|date',
            'invoices.*.submitted_to' => 'nullable|string|max:255',
            'invoices.*.files.*' => 'file|max:10240|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png',
        ]);

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
}
