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

        // Log to AuditTrail
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

        // Log to parent entity's activity log
        if ($file->fileable && method_exists($file->fileable, 'activityLogs')) {
            $fileSize = $this->formatFileSize($file->file_size);
            $file->fileable->activityLogs()->create([
                'action' => 'file_uploaded',
                'user_id' => $file->uploaded_by ?? Auth::id(),
                'ip_address' => $request?->ip(),
                'notes' => "Uploaded {$file->file_name} ({$fileSize}, {$file->file_category})",
                'changes' => json_encode([
                    'file_id' => $file->id,
                    'file_name' => $file->file_name,
                    'file_type' => $file->file_type,
                    'file_category' => $file->file_category,
                    'file_purpose' => $file->file_purpose,
                    'file_size' => $file->file_size,
                ]),
            ]);
        }
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

        // Log to AuditTrail
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

        // Log to parent entity's activity log
        if ($file->fileable && method_exists($file->fileable, 'activityLogs')) {
            $file->fileable->activityLogs()->create([
                'action' => 'file_removed',
                'user_id' => Auth::id(),
                'ip_address' => $request?->ip(),
                'notes' => "Removed {$file->file_name}",
                'changes' => json_encode([
                    'file_id' => $file->id,
                    'file_name' => $file->file_name,
                    'file_type' => $file->file_type,
                ]),
            ]);
        }
    }

    /**
     * Format file size for display
     */
    private function formatFileSize($bytes): string
    {
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        }
        return $bytes . ' bytes';
    }
}
