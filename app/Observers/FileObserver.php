<?php

namespace App\Observers;

use App\Models\File;
use App\Models\AuditTrail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FileObserver
{
    /**
     * Handle the File "created" event.
     */
    public function created(File $file): void
    {
        // Get the request instance if available
        $request = app(Request::class);

        AuditTrail::create([
            'table_name' => 'files',
            'record_id' => $file->id,
            'action' => 'create',
            'changes' => ['created' => $file->toArray()],
            'user_id' => Auth::id(),
            'performed_at' => now(),
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }

    /**
     * Handle the File "updated" event.
     */
    public function updated(File $file): void
    {
        // Get original values before changes
        $original = $file->getOriginal();

        // Get only changed fields (excluding timestamps)
        $changes = [];
        foreach ($file->getChanges() as $field => $newValue) {
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
                'table_name' => 'files',
                'record_id' => $file->id,
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
     * Handle the File "deleted" event.
     */
    public function deleted(File $file): void
    {
        $request = app(Request::class);

        AuditTrail::create([
            'table_name' => 'files',
            'record_id' => $file->id,
            'action' => 'delete',
            'changes' => ['deleted' => $file->toArray()],
            'user_id' => Auth::id(),
            'performed_at' => now(),
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }
}
