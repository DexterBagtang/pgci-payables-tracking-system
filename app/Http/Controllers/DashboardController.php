<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Display the dashboard page shell.
     *
     * Widgets fetch their own data independently via API endpoints.
     * This keeps the initial page load fast and allows progressive loading.
     */
    public function index(Request $request)
    {
        return inertia('dashboard/dashboard', [
            'role' => $request->user()->role->value,
            'alerts' => [], // TODO: Implement alert system in future phase
            'timeRange' => [
                'range' => $request->input('range', 'all'),
                'start' => $request->input('start'),
                'end' => $request->input('end'),
            ],
        ]);
    }
}
