<?php

namespace App\Observers;

use App\Models\Remark;
use Illuminate\Support\Str;

class RemarkObserver
{
    /**
     * Handle the Remark "created" event.
     */
    public function created(Remark $remark): void
    {
        // Log to the parent entity's activity log
        if ($remark->remarkable && method_exists($remark->remarkable, 'activityLogs')) {
            $preview = Str::limit($remark->remark_text, 100);

            $remark->remarkable->activityLogs()->create([
                'action' => 'commented',
                'user_id' => $remark->created_by ?? auth()->id(),
                'ip_address' => request()?->ip(),
                'notes' => $preview,
                'changes' => json_encode([
                    'remark_id' => $remark->id,
                    'remark_text' => $remark->remark_text,
                ]),
            ]);
        }
    }

    /**
     * Handle the Remark "updated" event.
     */
    public function updated(Remark $remark): void
    {
        // Log to the parent entity's activity log
        if ($remark->remarkable && method_exists($remark->remarkable, 'activityLogs')) {
            $original = $remark->getOriginal('remark_text');
            $changes = $remark->getChanges();

            if (isset($changes['remark_text'])) {
                $remark->remarkable->activityLogs()->create([
                    'action' => 'comment_updated',
                    'user_id' => auth()->id(),
                    'ip_address' => request()?->ip(),
                    'notes' => 'Updated comment',
                    'changes' => json_encode([
                        'remark_id' => $remark->id,
                        'old_text' => $original,
                        'new_text' => $changes['remark_text'],
                    ]),
                ]);
            }
        }
    }

    /**
     * Handle the Remark "deleted" event.
     */
    public function deleted(Remark $remark): void
    {
        // Log to the parent entity's activity log
        if ($remark->remarkable && method_exists($remark->remarkable, 'activityLogs')) {
            $remark->remarkable->activityLogs()->create([
                'action' => 'comment_deleted',
                'user_id' => auth()->id(),
                'ip_address' => request()?->ip(),
                'notes' => 'Deleted comment: ' . Str::limit($remark->remark_text, 50),
                'changes' => json_encode([
                    'remark_id' => $remark->id,
                    'remark_text' => $remark->remark_text,
                ]),
            ]);
        }
    }
}
