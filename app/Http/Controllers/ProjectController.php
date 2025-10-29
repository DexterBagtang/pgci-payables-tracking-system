<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Project::query();

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('project_title', 'like', "%{$search}%")
                    ->orWhere('cer_number', 'like', "%{$search}%")
                    ->orWhere('smpo_number', 'like', "%{$search}%");
            });
        }

        // Filter by project type
        if ($request->filled('project_type')) {
            $query->where('project_type', $request->project_type);
        }

        // Filter by project status
        if ($request->filled('project_status')) {
            $query->where('project_status', $request->project_status);
        }

        // Sorting functionality
        $sortField = $request->get('sort_field', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        // Validate sort field to prevent SQL injection
        $allowedSortFields = ['project_title', 'cer_number', 'total_project_cost', 'total_contract_cost', 'project_type', 'project_status', 'created_at'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $perPage = in_array($perPage, [10, 15, 25, 50]) ? $perPage : 15;

        $projects = $query->paginate($perPage);

        // Append query parameters to pagination links - THIS IS THE KEY FIX
        $projects->appends($request->query());

        return inertia('projects/index', [
            'projects' => $projects,
            'filters' => [
                'search' => $request->get('search', ''),
                'project_type' => $request->get('project_type', ''),
                'project_status' => $request->get('project_status', ''),
                'sort_field' => $sortField,
                'sort_direction' => $sortDirection,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Projects/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_title' => 'required|string|max:255',
            'cer_number' => 'required|string|max:255|unique:projects',
            'total_project_cost' => 'nullable|numeric|min:0',
            'total_contract_cost' => 'nullable|numeric|min:0',
            'project_status' => 'nullable|in:active,on_hold,completed,cancelled',
            'description' => 'nullable|string',
            'project_type' => 'nullable|in:sm_project,philcom_project',
            'smpo_number' => 'required_if:project_type,sm_project|nullable|string|max:255',
            'philcom_category' => 'required_if:project_type,philcom_project|nullable|in:profit_and_loss,capital_expenditure,others',
            'team' => 'required_if:project_type,philcom_project',
        ]);

        $validated['created_by'] = auth()->id();

        $project = Project::create($validated);

        // Log creation to activity log
        $project->logCreation();

        return redirect()->route('projects.index')->with('success', 'Project created successfully.');
    }

    public function show(Project $project)
    {
        return Inertia::render('projects/show', [
            'project' => $project->load([
                'creator:id,name',
                'purchaseOrders.vendor',
                'purchaseOrders.invoices',
                'remarks.user:id,name',
                'activityLogs.user:id,name'
            ]),
        ]);
    }

    public function edit(Project $project)
    {
        return Inertia::render('Projects/Edit', [
            'project' => $project,
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'project_title' => 'required|string|max:255',
            'cer_number' => [
                'required',
                'string',
                'max:255',
                Rule::unique('projects', 'cer_number')->ignore($project->id)
            ],
            'total_project_cost' => 'required|numeric|min:0.01', // Made required and minimum 0.01
            'total_contract_cost' => 'required_if:project_type,sm_project', // Made required and minimum 0.01
            'project_type' => 'required|in:sm_project,philcom_project', // Made required
            'smpo_number' => 'required_if:project_type,sm_project|nullable|string|max:255',
            'philcom_category' => 'required_if:project_type,philcom_project|nullable|in:profit_and_loss,capital_expenditure,others',
            'team' => 'required_if:project_type,philcom_project',
            'description' => 'nullable|string|max:1000', // Added max length for description
        ]);

        // Capture old status if exists
        $oldStatus = $project->project_status;

        // Update the project
        $project->fill($validated);
        $project->save();

        $changes = $project->getChanges();

        // Check if status changed
        if (isset($changes['project_status'])) {
            $project->logStatusChange($oldStatus, $changes['project_status']);
        } else if (!empty($changes)) {
            // Log regular update
            $project->logUpdate($changes);
        }

        return back()->with('success', 'Project updated successfully.');
    }

    public function destroy(Project $project)
    {
        $project->delete();

        return redirect()->route('projects.index')->with('success', 'Project deleted successfully.');
    }
}
