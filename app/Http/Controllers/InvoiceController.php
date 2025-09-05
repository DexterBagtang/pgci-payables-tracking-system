<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\PurchaseOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class InvoiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return inertia('invoices/index', [
            'invoices' => Invoice::with(['purchaseOrder.project', 'purchaseOrder.vendor'])->get(),
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
    public function store(Request $request)
    {
        $validated = $request->validate([
            'purchase_order_id' => 'required|exists:purchase_orders,id',
            'si_number' => 'required|string|max:255|unique:invoices',
            'si_date' => 'required|date',
            'received_date' => 'nullable|date',
//            'payment_type' => ['required', Rule::in(['cash', 'check', 'bank_transfer', 'credit_card', 'other'])],
            'invoice_amount' => 'required|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
//            'net_amount' => 'required|numeric|min:0',
//            'invoice_status' => ['required', Rule::in(['received', 'under_review', 'approved', 'rejected', 'paid', 'overdue'])],
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'submitted_at' => 'nullable|date',
            'submitted_to' => 'nullable|string|max:255',
            'files.*' => 'file|max:10240|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png',
        ]);

        unset($validated['files']);

        $validated['net_amount'] = $validated['invoice_amount'];

        // Create invoice
        $invoice = Invoice::create([
            ...$validated,
            'si_received_at' => now(),
            'created_by' => auth()->id(),
        ]);

        // Handle file uploads
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
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
            ->with('success', 'Invoice created successfully!');

    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
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
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
