<?php

namespace App\Http\Controllers;

use App\Models\Remark;
use Illuminate\Http\Request;

class RemarksController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'remarkable_type' => 'required|string|in:App\\Models\\Invoice,App\\Models\\PurchaseOrder,App\\Models\\CheckRequisition,App\\Models\\Disbursement,App\\Models\\Vendor,App\\Models\\Project',
            'remarkable_id'   => 'required|integer',
            'remark_text'     => 'required|string|max:1000',
        ]);

        // Map model types to their corresponding module permissions
        $moduleMap = [
            'App\\Models\\Invoice' => 'invoices',
            'App\\Models\\PurchaseOrder' => 'purchase_orders',
            'App\\Models\\CheckRequisition' => 'check_requisitions',
            'App\\Models\\Disbursement' => 'disbursements',
            'App\\Models\\Vendor' => 'vendors',
            'App\\Models\\Project' => 'projects',
        ];

        $module = $moduleMap[$data['remarkable_type']] ?? null;

        // User must have read permission on the module to add remarks
        if (!$module || !auth()->user()->canRead($module)) {
            abort(403, 'You do not have permission to add remarks to this resource.');
        }

        // Verify the resource exists
        $modelClass = $data['remarkable_type'];
        if (!$modelClass::find($data['remarkable_id'])) {
            abort(404, 'Resource not found.');
        }

        $remark = Remark::create([
            'remarkable_type' => $data['remarkable_type'],
            'remarkable_id'   => $data['remarkable_id'],
            'remark_text'     => $data['remark_text'],
            'created_by'      => $request->user()->id,
        ])->load('user');

//        return back()->with('success', "Remark created successfully");
        return response()->json([
            'success' => true,
            'message' => 'Remark created successfully',
            'remark' => $remark,
        ], 201);
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
