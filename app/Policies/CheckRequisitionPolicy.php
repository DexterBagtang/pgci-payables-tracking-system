<?php

namespace App\Policies;

use App\Models\CheckRequisition;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CheckRequisitionPolicy
{
    /**
     * Determine if the user can view any check requisitions.
     */
    public function viewAny(User $user): Response
    {
        return $user->canRead('check_requisitions')
            ? Response::allow()
            : Response::deny('You do not have permission to view check requisitions.');
    }

    /**
     * Determine if the user can view the check requisition.
     */
    public function view(User $user, CheckRequisition $checkRequisition): Response
    {
        return $user->canRead('check_requisitions')
            ? Response::allow()
            : Response::deny('You do not have permission to view check requisitions.');
    }

    /**
     * Determine if the user can create check requisitions.
     */
    public function create(User $user): Response
    {
        return $user->canWrite('check_requisitions')
            ? Response::allow()
            : Response::deny('You do not have permission to create check requisitions.');
    }

    /**
     * Determine if the user can update the check requisition.
     *
     * Business Rules:
     * - User must have write permission for check_requisitions module
     * - Can only edit pending_approval or draft status
     * - Cannot edit once approved, processed, or paid
     */
    public function update(User $user, CheckRequisition $checkRequisition): Response
    {
        // Check user permission
        if (!$user->canWrite('check_requisitions')) {
            return Response::deny('You do not have permission to edit check requisitions.');
        }

        // Check CR state - locked statuses
        $lockedStatuses = ['approved', 'processed', 'paid'];

        if (in_array($checkRequisition->requisition_status, $lockedStatuses)) {
            return Response::deny(
                "Cannot edit check requisition in '{$checkRequisition->requisition_status}' status. " .
                "Check requisitions can only be edited when status is: pending_approval or draft."
            );
        }

        return Response::allow();
    }

    /**
     * Determine if the user can delete the check requisition.
     *
     * Business Rules:
     * - User must have write permission for check_requisitions module
     * - Can only delete draft or pending_approval
     * - Cannot delete once approved, processed, or paid
     */
    public function delete(User $user, CheckRequisition $checkRequisition): Response
    {
        // Check user permission
        if (!$user->canWrite('check_requisitions')) {
            return Response::deny('You do not have permission to delete check requisitions.');
        }

        // Can only delete if draft or pending_approval
        if (!in_array($checkRequisition->requisition_status, ['draft', 'pending_approval'])) {
            return Response::deny(
                "Cannot delete check requisition in '{$checkRequisition->requisition_status}' status. " .
                "Only draft or pending approval check requisitions can be deleted."
            );
        }

        return Response::allow();
    }

    /**
     * Determine if the user can approve the check requisition.
     *
     * Business Rules:
     * - User must have write permission for check_requisitions module
     * - CR must be in pending_approval status
     * - Cannot approve if already approved, rejected, processed, or paid
     */
    public function approve(User $user, CheckRequisition $checkRequisition): Response
    {
        // Check user permission
        if (!$user->canWrite('check_requisitions')) {
            return Response::deny('You do not have permission to approve check requisitions.');
        }

        // Can only approve if pending_approval
        if ($checkRequisition->requisition_status !== 'pending_approval') {
            return Response::deny(
                "Cannot approve check requisition in '{$checkRequisition->requisition_status}' status. " .
                "Only pending approval check requisitions can be approved."
            );
        }

        return Response::allow();
    }

    /**
     * Determine if the user can reject the check requisition.
     *
     * Business Rules:
     * - User must have write permission for check_requisitions module
     * - CR must be in pending_approval status
     * - Cannot reject if already approved, rejected, processed, or paid
     */
    public function reject(User $user, CheckRequisition $checkRequisition): Response
    {
        // Check user permission
        if (!$user->canWrite('check_requisitions')) {
            return Response::deny('You do not have permission to reject check requisitions.');
        }

        // Can only reject if pending_approval
        if ($checkRequisition->requisition_status !== 'pending_approval') {
            return Response::deny(
                "Cannot reject check requisition in '{$checkRequisition->requisition_status}' status. " .
                "Only pending approval check requisitions can be rejected."
            );
        }

        return Response::allow();
    }

    /**
     * Determine if the user can restore the check requisition (for soft deletes).
     */
    public function restore(User $user, CheckRequisition $checkRequisition): Response
    {
        return $user->canWrite('check_requisitions')
            ? Response::allow()
            : Response::deny('You do not have permission to restore check requisitions.');
    }

    /**
     * Determine if the user can permanently delete the check requisition.
     */
    public function forceDelete(User $user, CheckRequisition $checkRequisition): Response
    {
        return $user->isAdmin()
            ? Response::allow()
            : Response::deny('Only administrators can permanently delete check requisitions.');
    }
}
