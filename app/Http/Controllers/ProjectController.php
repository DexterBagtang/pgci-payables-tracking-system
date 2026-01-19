<?php

namespace App\Http\Controllers;

use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Project::class);

        $query = Project::query();

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('project_title', 'like', "%{$search}%")
                    ->orWhere('cer_number', 'like', "%{$search}%")
                    ->orWhere('smpo_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('project_type')) {
            $query->where('project_type', $request->project_type);
        }

        if ($request->filled('project_status')) {
            $query->where('project_status', $request->project_status);
        }

        $sortField = $request->get('sort_field', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        $allowedSortFields = ['project_title', 'cer_number', 'total_project_cost', 'total_contract_cost', 'project_type', 'project_status', 'created_at'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection);
        }

        $perPage = $request->get('per_page', 15);
        $perPage = in_array($perPage, [10, 15, 25, 50]) ? $perPage : 15;

        $projects = $query->paginate($perPage);
        $projects->appends($request->query());

        $stats = [
            'total' => Project::count(),
            'active' => Project::where('project_status', 'active')->count(),
            'on_hold' => Project::where('project_status', 'on_hold')->count(),
            'completed' => Project::where('project_status', 'completed')->count(),
            'cancelled' => Project::where('project_status', 'cancelled')->count(),
            'total_budget' => Project::sum('total_project_cost'),
            'sm_projects' => Project::where('project_type', 'sm_project')->count(),
            'philcom_projects' => Project::where('project_type', 'philcom_project')->count(),
            'recent' => Project::where('created_at', '>=', now()->subDays(7))->count(),
        ];

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
            'stats' => $stats,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Project::class);

        return inertia('projects/create');
    }

    public function store(StoreProjectRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['created_by'] = auth()->id();

        $project = Project::create($validated);
        $project->logCreation();

        return redirect()->route('projects.index')->with('success', 'Project created successfully.');
    }

    public function show(Project $project): Response
    {
        $this->authorize('view', $project);

        return inertia('projects/show', [
            'project' => $project->load([
                'creator:id,name',
                'purchaseOrders.vendor',
                'purchaseOrders.invoices',
                'remarks.user:id,name',
                'activityLogs.user:id,name',
            ]),
        ]);
    }

    public function edit(Project $project): Response
    {
        $this->authorize('update', $project);

        return inertia('projects/edit', [
            'project' => $project,
        ]);
    }

    public function update(UpdateProjectRequest $request, Project $project): RedirectResponse
    {
        $validated = $request->validated();
        $oldStatus = $project->project_status;

        $project->fill($validated);
        $project->save();

        $changes = $project->getChanges();

        if (isset($changes['project_status'])) {
            $project->logStatusChange($oldStatus, $changes['project_status']);
        } elseif (! empty($changes)) {
            $project->logUpdate($changes);
        }

        return back()->with('success', 'Project updated successfully.');
    }

    public function destroy(Project $project): RedirectResponse
    {
        $this->authorize('delete', $project);

        $project->delete();

        return redirect()->route('projects.index')->with('success', 'Project deleted successfully.');
    }
}
