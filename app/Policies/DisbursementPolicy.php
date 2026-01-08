<?php

namespace App\Policies;

use App\Models\Disbursement;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class DisbursementPolicy
{
    /**
     * Determine if the user can view any disbursements.
     */
    public function viewAny(User $user): Response
    {
        return $user->canRead('disbursements')
            ? Response::allow()
            : Response::deny('You do not have permission to view disbursements.');
    }

    /**
     * Determine if the user can view the disbursement.
     */
    public function view(User $user, Disbursement $disbursement): Response
    {
        return $user->canRead('disbursements')
            ? Response::allow()
            : Response::deny('You do not have permission to view disbursements.');
    }

    /**
     * Determine if the user can create disbursements.
     */
    public function create(User $user): Response
    {
        return $user->canWrite('disbursements')
            ? Response::allow()
            : Response::deny('You do not have permission to create disbursements.');
    }

    /**
     * Determine if the user can update the disbursement.
     *
     * Business Rules:
     * - User must have write permission for disbursements module
     * - Can edit if no dates set or only scheduled
     * - Cannot edit once check is released to vendor (date_check_released_to_vendor is set)
     */
    public function update(User $user, Disbursement $disbursement): Response
    {
        // Check user permission
        if (!$user->canWrite('disbursements')) {
            return Response::deny('You do not have permission to edit disbursements.');
        }

        // Check if disbursement is in final state (check released)
        if ($disbursement->date_check_released_to_vendor !== null) {
            return Response::deny(
                'Cannot edit disbursement. Check has already been released to vendor on ' .
                $disbursement->date_check_released_to_vendor->format('Y-m-d') . '.'
            );
        }

        return Response::allow();
    }

    /**
     * Determine if the user can delete the disbursement.
     *
     * Business Rules:
     * - User must have write permission for disbursements module
     * - Can only delete if no dates are set (not scheduled, printed, or released)
     * - Cannot delete once any date is set
     */
    public function delete(User $user, Disbursement $disbursement): Response
    {
        // Check user permission
        if (!$user->canWrite('disbursements')) {
            return Response::deny('You do not have permission to delete disbursements.');
        }

        // Can only delete if no dates set (completely new)
        if ($disbursement->date_check_scheduled !== null ||
            $disbursement->date_check_printing !== null ||
            $disbursement->date_check_released_to_vendor !== null) {
            return Response::deny(
                'Cannot delete disbursement once check dates have been set. ' .
                'Only newly created disbursements with no scheduled dates can be deleted.'
            );
        }

        return Response::allow();
    }

    /**
     * Determine if the user can update check dates (schedule, print, release).
     *
     * Business Rules:
     * - User must have write permission for disbursements module
     * - Dates should be set in sequence
     * - Once released, dates should not be modified
     */
    public function updateCheckDates(User $user, Disbursement $disbursement): Response
    {
        // Check user permission
        if (!$user->canWrite('disbursements')) {
            return Response::deny('You do not have permission to update check dates.');
        }

        // If check is released, prevent any date modifications
        if ($disbursement->date_check_released_to_vendor !== null) {
            return Response::deny(
                'Cannot modify check dates. Check has already been released to vendor. ' .
                'This is a final state and dates should not be changed.'
            );
        }

        return Response::allow();
    }

    /**
     * Determine if the user can release the check to vendor.
     *
     * Business Rules:
     * - User must have write permission for disbursements module
     * - Cannot release if already released
     * - This is a critical action that finalizes the disbursement
     */
    public function releaseCheck(User $user, Disbursement $disbursement): Response
    {
        // Check user permission
        if (!$user->canWrite('disbursements')) {
            return Response::deny('You do not have permission to release checks.');
        }

        // Cannot release if already released
        if ($disbursement->date_check_released_to_vendor !== null) {
            return Response::deny(
                'Check has already been released to vendor on ' .
                $disbursement->date_check_released_to_vendor->format('Y-m-d') . '. ' .
                'Cannot release again.'
            );
        }

        return Response::allow();
    }

    /**
     * Determine if the user can restore the disbursement (for soft deletes).
     */
    public function restore(User $user, Disbursement $disbursement): Response
    {
        return $user->canWrite('disbursements')
            ? Response::allow()
            : Response::deny('You do not have permission to restore disbursements.');
    }

    /**
     * Determine if the user can permanently delete the disbursement.
     */
    public function forceDelete(User $user, Disbursement $disbursement): Response
    {
        return $user->isAdmin()
            ? Response::allow()
            : Response::deny('Only administrators can permanently delete disbursements.');
    }
}
