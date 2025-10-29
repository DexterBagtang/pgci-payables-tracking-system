<?php

namespace App\Traits;

use App\Models\ActivityLog;

trait LogsActivity
{
    /**
     * Log an activity for this model
     */
    public function logActivity(string $action, ?string $notes = null, array $changes = []): ActivityLog
    {
        return $this->activityLogs()->create([
            'action' => $action,
            'user_id' => auth()->id(),
            'ip_address' => request()?->ip(),
            'notes' => $notes,
            'changes' => !empty($changes) ? json_encode($changes) : null,
        ]);
    }

    /**
     * Log a creation event with context
     */
    public function logCreation(array $additionalData = []): ActivityLog
    {
        return $this->logActivity(
            'created',
            $this->getCreationMessage(),
            array_merge($this->toArray(), $additionalData)
        );
    }

    /**
     * Log an update with specific changes
     */
    public function logUpdate(array $changes, ?string $customMessage = null): ?ActivityLog
    {
        if (empty($changes)) {
            return null;
        }

        return $this->logActivity(
            'updated',
            $customMessage ?? $this->getUpdateMessage($changes),
            $changes
        );
    }

    /**
     * Log a status change
     */
    public function logStatusChange(string $from, string $to, ?string $reason = null): ActivityLog
    {
        $notes = $this->getStatusChangeMessage($from, $to);
        if ($reason) {
            $notes .= "\nReason: {$reason}";
        }

        return $this->logActivity(
            'status_changed',
            $notes,
            ['status' => ['from' => $from, 'to' => $to]]
        );
    }

    /**
     * Log a relationship addition
     */
    public function logRelationshipAdded(string $relationType, $relatedModel, ?string $customMessage = null): ActivityLog
    {
        $action = strtolower($relationType) . '_added';
        $notes = $customMessage ?? $this->getRelationshipAddedMessage($relationType, $relatedModel);

        return $this->logActivity(
            $action,
            $notes,
            $this->getRelationshipData($relatedModel)
        );
    }

    /**
     * Log a relationship removal
     */
    public function logRelationshipRemoved(string $relationType, $relatedModel, ?string $customMessage = null): ActivityLog
    {
        $action = strtolower($relationType) . '_removed';
        $notes = $customMessage ?? $this->getRelationshipRemovedMessage($relationType, $relatedModel);

        return $this->logActivity(
            $action,
            $notes,
            $this->getRelationshipData($relatedModel)
        );
    }

    /**
     * Override these methods in each model for custom messages
     */
    protected function getCreationMessage(): string
    {
        return class_basename($this) . ' created';
    }

    protected function getUpdateMessage(array $changes): string
    {
        return 'Updated ' . strtolower(class_basename($this)) . ' details';
    }

    protected function getStatusChangeMessage(string $from, string $to): string
    {
        return "Status changed from {$from} to {$to}";
    }

    protected function getRelationshipAddedMessage(string $relationType, $relatedModel): string
    {
        return "{$relationType} added";
    }

    protected function getRelationshipRemovedMessage(string $relationType, $relatedModel): string
    {
        return "{$relationType} removed";
    }

    protected function getRelationshipData($relatedModel): array
    {
        if (is_array($relatedModel)) {
            return $relatedModel;
        }

        return [
            'id' => $relatedModel->id ?? null,
            'type' => class_basename($relatedModel),
        ];
    }

    /**
     * Format currency for display
     */
    protected function formatCurrency($amount): string
    {
        return '₱' . number_format($amount, 2);
    }

    /**
     * Format file size for display
     */
    protected function formatFileSize($bytes): string
    {
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        }
        return $bytes . ' bytes';
    }
}
