<?php

namespace App\Http\Controllers;

use App\Models\CheckRequisition;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckRequisitionController extends Controller
{
    public function index()
    {

    }

    public function create()
    {
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'php_amount' => 'required|numeric|min:0',
            'payee_name' => 'required|string|max:255',
            'purpose' => 'required|string|max:1000',
            'po_number' => 'nullable|string|max:255',
            'cer_number' => 'nullable|string|max:255',
            'si_number' => 'nullable|string|max:255',
            'account_charge' => 'nullable|string|max:255',
            'service_line_dist' => 'nullable|string|max:500',
            'amount_in_words' => 'required|string|max:500',
        ]);

        // Generate unique requisition number using uniqid (KISS approach)
        $validatedData['requisition_number'] = 'REQ-' . strtoupper(uniqid());

        // Set system fields
        $validatedData['requisition_status'] = 'pending_approval';
        $validatedData['request_date'] = now();
        $validatedData['requested_by'] = Auth::id();
        $validatedData['generated_by'] = Auth::id();

        // Create the check requisition
        CheckRequisition::create($validatedData);

        $invoice = Invoice::find($validatedData['invoice_id']);

        $invoice->activityLogs()->create([
            'action' => 'check requisition created',
            'user_id' => auth()->id(),
            'ip_address' => $request->ip(),
            'changes' => json_encode($validatedData),
        ]);

        return back()->with('success', 'Check requisition created successfully!');
    }

    public function show($id)
    {
    }

    public function edit($id)
    {
    }

    public function update(Request $request, $id)
    {
    }

    public function destroy($id)
    {
    }
}
