<?php

namespace App\Observers;

use App\Models\Project;
use App\Models\AuditTrail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectObserver
{
    /**
     * Handle the Project "created" event.
     */
    public function created(Project $project): void
    {
        // Get the request instance if available
        $request = app(Request::class);

        AuditTrail::create([
            'table_name' => 'projects',
            'record_id' => $project->id,
            'action' => 'create',
            'changes' => ['created' => $project->toArray()],
            'user_id' => Auth::id(),
            'performed_at' => now(),
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }

    /**
     * Handle the Project "updated" event.
     */
    public function updated(Project $project): void
    {
        // Get original values before changes
        $original = $project->getOriginal();

        // Get only changed fields (excluding timestamps)
        $changes = [];
        foreach ($project->getChanges() as $field => $newValue) {
            if (!in_array($field, ['updated_at'])) {
                $changes[$field] = [
                    'old' => $original[$field] ?? null,
                    'new' => $newValue
                ];
            }
        }

        // Only log if there are actual changes
        if (!empty($changes)) {
            $request = app(Request::class);

            AuditTrail::create([
                'table_name' => 'projects',
                'record_id' => $project->id,
                'action' => 'update',
                'changes' => $changes,
                'user_id' => Auth::id(),
                'performed_at' => now(),
                'ip_address' => $request?->ip(),
                'user_agent' => $request?->userAgent(),
            ]);
        }
    }

    /**
     * Handle the Project "deleted" event.
     */
    public function deleted(Project $project): void
    {
        $request = app(Request::class);

        AuditTrail::create([
            'table_name' => 'projects',
            'record_id' => $project->id,
            'action' => 'delete',
            'changes' => ['deleted' => $project->toArray()],
            'user_id' => Auth::id(),
            'performed_at' => now(),
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }
}