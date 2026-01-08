<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class InvoicePolicy
{
    /**
     * Determine if the user can view any invoices.
     */
    public function viewAny(User $user): Response
    {
        return $user->canRead('invoices')
            ? Response::allow()
            : Response::deny('You do not have permission to view invoices.');
    }

    /**
     * Determine if the user can view the invoice.
     */
    public function view(User $user, Invoice $invoice): Response
    {
        return $user->canRead('invoices')
            ? Response::allow()
            : Response::deny('You do not have permission to view invoices.');
    }

    /**
     * Determine if the user can create invoices.
     */
    public function create(User $user): Response
    {
        return $user->canWrite('invoices')
            ? Response::allow()
            : Response::deny('You do not have permission to create invoices.');
    }

    /**
     * Determine if the user can update the invoice.
     *
     * Business Rules:
     * - User must have write permission for invoices module
     * - Invoice must be in editable state (pending or rejected only)
     * - Cannot edit received, approved, pending_disbursement, or paid invoices
     * - Once payables marks as received, invoice is locked from editing
     */
    public function update(User $user, Invoice $invoice): Response
    {
        // Check user permission
        if (!$user->canWrite('invoices')) {
            return Response::deny('You do not have permission to edit invoices.');
        }

        // Check invoice state - locked statuses
        $lockedStatuses = ['received', 'approved', 'pending_disbursement', 'paid'];

        if (in_array($invoice->invoice_status, $lockedStatuses)) {
            return Response::deny(
                "Cannot edit invoice in '{$invoice->invoice_status}' status. " .
                "Invoices can only be edited when status is: pending or rejected."
            );
        }

        return Response::allow();
    }

    /**
     * Determine if the user can delete the invoice.
     *
     * Business Rules:
     * - User must have write permission for invoices module
     * - Can only delete pending or rejected invoices
     * - Cannot delete once received, approved, or in later stages
     */
    public function delete(User $user, Invoice $invoice): Response
    {
        // Check user permission
        if (!$user->canWrite('invoices')) {
            return Response::deny('You do not have permission to delete invoices.');
        }

        // Can only delete if pending or rejected
        if (!in_array($invoice->invoice_status, ['pending', 'rejected'])) {
            return Response::deny(
                "Cannot delete invoice in '{$invoice->invoice_status}' status. " .
                "Only pending or rejected invoices can be deleted."
            );
        }

        return Response::allow();
    }

    /**
     * Determine if the user can review (approve/reject) the invoice.
     *
     * Business Rules:
     * - User must have write permission for invoice_review module
     * - Invoice must be in reviewable state (pending or received)
     * - Cannot review already approved, rejected, or paid invoices
     */
    public function review(User $user, Invoice $invoice): Response
    {
        // Check user permission (separate permission for review)
        if (!$user->canWrite('invoice_review')) {
            return Response::deny('You do not have permission to review invoices.');
        }

        // Can only review if pending or received
        $reviewableStatuses = ['pending', 'received'];

        if (!in_array($invoice->invoice_status, $reviewableStatuses)) {
            return Response::deny(
                "Cannot review invoice in '{$invoice->invoice_status}' status. " .
                "Only pending or received invoices can be reviewed."
            );
        }

        return Response::allow();
    }

    /**
     * Determine if the user can mark invoice as received.
     *
     * Business Rules:
     * - User must have write permission for invoice_review module
     * - Invoice must be in pending status
     */
    public function markReceived(User $user, Invoice $invoice): Response
    {
        // Check user permission
        if (!$user->canWrite('invoice_review')) {
            return Response::deny('You do not have permission to mark invoices as received.');
        }

        // Can only mark as received if currently pending
        if ($invoice->invoice_status !== 'pending') {
            return Response::deny(
                "Cannot mark invoice as received when status is '{$invoice->invoice_status}'. " .
                "Only pending invoices can be marked as received."
            );
        }

        return Response::allow();
    }

    /**
     * Determine if the user can restore the invoice (for soft deletes).
     */
    public function restore(User $user, Invoice $invoice): Response
    {
        return $user->canWrite('invoices')
            ? Response::allow()
            : Response::deny('You do not have permission to restore invoices.');
    }

    /**
     * Determine if the user can permanently delete the invoice.
     */
    public function forceDelete(User $user, Invoice $invoice): Response
    {
        return $user->isAdmin()
            ? Response::allow()
            : Response::deny('Only administrators can permanently delete invoices.');
    }
}
