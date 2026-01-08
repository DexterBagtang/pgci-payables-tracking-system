<?php

namespace App\Policies;

use App\Models\PurchaseOrder;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PurchaseOrderPolicy
{
    /**
     * Determine if the user can view any purchase orders.
     */
    public function viewAny(User $user): Response
    {
        return $user->canRead('purchase_orders')
            ? Response::allow()
            : Response::deny('You do not have permission to view purchase orders.');
    }

    /**
     * Determine if the user can view the purchase order.
     */
    public function view(User $user, PurchaseOrder $purchaseOrder): Response
    {
        return $user->canRead('purchase_orders')
            ? Response::allow()
            : Response::deny('You do not have permission to view purchase orders.');
    }

    /**
     * Determine if the user can create purchase orders.
     */
    public function create(User $user): Response
    {
        return $user->canWrite('purchase_orders')
            ? Response::allow()
            : Response::deny('You do not have permission to create purchase orders.');
    }

    /**
     * Determine if the user can update the purchase order.
     *
     * Business Rules:
     * - User must have write permission for purchase_orders module
     * - Can only edit draft or open POs
     * - Cannot edit closed or cancelled POs
     */
    public function update(User $user, PurchaseOrder $purchaseOrder): Response
    {
        // Check user permission
        if (!$user->canWrite('purchase_orders')) {
            return Response::deny('You do not have permission to edit purchase orders.');
        }

        // Check PO state - locked statuses
        $lockedStatuses = ['closed', 'cancelled'];

        if (in_array($purchaseOrder->po_status, $lockedStatuses)) {
            return Response::deny(
                "Cannot edit purchase order in '{$purchaseOrder->po_status}' status. " .
                "Only draft or open purchase orders can be edited."
            );
        }

        return Response::allow();
    }

    /**
     * Determine if the user can update the vendor on a purchase order.
     *
     * Business Rules:
     * - User must have write permission for purchase_orders module
     * - PO must be in editable state (draft or open)
     * - Cannot change vendor if PO has invoices
     */
    public function updateVendor(User $user, PurchaseOrder $purchaseOrder): Response
    {
        // Check user permission
        if (!$user->canWrite('purchase_orders')) {
            return Response::deny('You do not have permission to edit purchase orders.');
        }

        // Check PO state
        $lockedStatuses = ['closed', 'cancelled'];

        if (in_array($purchaseOrder->po_status, $lockedStatuses)) {
            return Response::deny(
                "Cannot edit purchase order in '{$purchaseOrder->po_status}' status."
            );
        }

        // Check if PO has invoices
        if ($purchaseOrder->invoices()->exists()) {
            return Response::deny(
                'Cannot change vendor on this purchase order because it has associated invoices. ' .
                'Please remove or reassign invoices first.'
            );
        }

        return Response::allow();
    }

    /**
     * Determine if the user can delete the purchase order.
     *
     * Business Rules:
     * - User must have write permission for purchase_orders module
     * - Can only delete draft POs
     * - Cannot delete if finalized, closed, or cancelled
     */
    public function delete(User $user, PurchaseOrder $purchaseOrder): Response
    {
        // Check user permission
        if (!$user->canWrite('purchase_orders')) {
            return Response::deny('You do not have permission to delete purchase orders.');
        }

        // Can only delete if still in draft
        if ($purchaseOrder->po_status !== 'draft') {
            return Response::deny(
                "Cannot delete purchase order in '{$purchaseOrder->po_status}' status. " .
                "Only draft purchase orders can be deleted."
            );
        }

        return Response::allow();
    }

    /**
     * Determine if the user can close the purchase order.
     *
     * Business Rules:
     * - User must have write permission for purchase_orders module
     * - PO must be in open status
     * - Can force close with warnings
     */
    public function close(User $user, PurchaseOrder $purchaseOrder): Response
    {
        // Check user permission
        if (!$user->canWrite('purchase_orders')) {
            return Response::deny('You do not have permission to close purchase orders.');
        }

        // Can only close if currently open
        if ($purchaseOrder->po_status !== 'open') {
            return Response::deny(
                "Cannot close purchase order in '{$purchaseOrder->po_status}' status. " .
                "Only open purchase orders can be closed."
            );
        }

        return Response::allow();
    }

    /**
     * Determine if the user can finalize (change from draft to open) the purchase order.
     *
     * Business Rules:
     * - User must have write permission for purchase_orders module
     * - PO must be in draft status
     */
    public function finalize(User $user, PurchaseOrder $purchaseOrder): Response
    {
        // Check user permission
        if (!$user->canWrite('purchase_orders')) {
            return Response::deny('You do not have permission to finalize purchase orders.');
        }

        // Can only finalize if currently draft
        if ($purchaseOrder->po_status !== 'draft') {
            return Response::deny(
                "Cannot finalize purchase order in '{$purchaseOrder->po_status}' status. " .
                "Only draft purchase orders can be finalized."
            );
        }

        return Response::allow();
    }

    /**
     * Determine if the user can cancel the purchase order.
     *
     * Business Rules:
     * - User must have write permission for purchase_orders module
     * - Can cancel from draft or open status
     * - Cannot cancel if already closed or cancelled
     */
    public function cancel(User $user, PurchaseOrder $purchaseOrder): Response
    {
        // Check user permission
        if (!$user->canWrite('purchase_orders')) {
            return Response::deny('You do not have permission to cancel purchase orders.');
        }

        // Cannot cancel if already closed or cancelled
        $nonCancellableStatuses = ['closed', 'cancelled'];

        if (in_array($purchaseOrder->po_status, $nonCancellableStatuses)) {
            return Response::deny(
                "Cannot cancel purchase order in '{$purchaseOrder->po_status}' status. " .
                "Only draft or open purchase orders can be cancelled."
            );
        }

        return Response::allow();
    }

    /**
     * Determine if the user can restore the purchase order (for soft deletes).
     */
    public function restore(User $user, PurchaseOrder $purchaseOrder): Response
    {
        return $user->canWrite('purchase_orders')
            ? Response::allow()
            : Response::deny('You do not have permission to restore purchase orders.');
    }

    /**
     * Determine if the user can permanently delete the purchase order.
     */
    public function forceDelete(User $user, PurchaseOrder $purchaseOrder): Response
    {
        return $user->isAdmin()
            ? Response::allow()
            : Response::deny('Only administrators can permanently delete purchase orders.');
    }
}
