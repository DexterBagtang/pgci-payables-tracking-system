<?php

namespace App\Enums;

enum InvoiceStatus: string
{
    case PENDING = 'pending';
    case RECEIVED = 'received';
    case IN_PROGRESS = 'in_progress';
    case APPROVED = 'approved';
    case PENDING_DISBURSEMENT = 'pending_disbursement';
    case REJECTED = 'rejected';
    case PAID = 'paid';
    case OVERDUE = 'overdue';

    /**
     * Get a human-readable label for the status
     */
    public function label(): string
    {
        return match($this) {
            self::PENDING => 'Pending',
            self::RECEIVED => 'Received',
            self::IN_PROGRESS => 'In Progress',
            self::APPROVED => 'Approved',
            self::PENDING_DISBURSEMENT => 'Pending Disbursement',
            self::REJECTED => 'Rejected',
            self::PAID => 'Paid',
            self::OVERDUE => 'Overdue',
        };
    }

    /**
     * Get the color class for the status (for UI badges)
     */
    public function color(): string
    {
        return match($this) {
            self::PENDING => 'gray',
            self::RECEIVED => 'blue',
            self::IN_PROGRESS => 'yellow',
            self::APPROVED => 'green',
            self::PENDING_DISBURSEMENT => 'purple',
            self::REJECTED => 'red',
            self::PAID => 'emerald',
            self::OVERDUE => 'orange',
        };
    }

    /**
     * Get valid transitions from this status
     *
     * @return array<InvoiceStatus>
     */
    public function allowedTransitions(): array
    {
        return match($this) {
            self::PENDING => [
                self::RECEIVED,
            ],
            self::RECEIVED => [
                self::APPROVED,
                self::REJECTED,
            ],
            self::APPROVED => [
                self::PENDING_DISBURSEMENT,
            ],
            self::REJECTED => [
                self::PENDING, // Manual reset by admin only
            ],
            self::PENDING_DISBURSEMENT => [
                self::PAID,
                self::APPROVED, // When check requisition is rejected
            ],
            self::PAID => [], // Final status - no transitions allowed
            self::IN_PROGRESS => [
                self::RECEIVED,
                self::PENDING,
            ],
            self::OVERDUE => [], // System status - managed automatically
        };
    }

    /**
     * Check if transition to another status is allowed
     */
    public function canTransitionTo(InvoiceStatus $newStatus): bool
    {
        return in_array($newStatus, $this->allowedTransitions(), true);
    }

    /**
     * Get all statuses that can be manually set by users
     *
     * @return array<InvoiceStatus>
     */
    public static function manuallySettableStatuses(): array
    {
        return [
            self::PENDING,
            self::RECEIVED,
            self::APPROVED,
            self::REJECTED,
        ];
    }

    /**
     * Get all statuses that are set automatically by the system
     *
     * @return array<InvoiceStatus>
     */
    public static function automaticStatuses(): array
    {
        return [
            self::PENDING_DISBURSEMENT,
            self::PAID,
            self::OVERDUE,
        ];
    }

    /**
     * Get statuses that can be edited
     *
     * @return array<InvoiceStatus>
     */
    public static function editableStatuses(): array
    {
        return [
            self::PENDING,
            self::RECEIVED,
            self::REJECTED,
        ];
    }

    /**
     * Check if this status allows invoice editing
     */
    public function isEditable(): bool
    {
        return in_array($this, self::editableStatuses(), true);
    }

    /**
     * Check if this is a final status (no further changes allowed)
     */
    public function isFinal(): bool
    {
        return $this === self::PAID;
    }
}
