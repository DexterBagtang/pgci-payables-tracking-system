<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Vendor;
use Illuminate\Auth\Access\Response;

class VendorPolicy
{
    /**
     * Determine if the user can view any vendors.
     */
    public function viewAny(User $user): Response
    {
        return $user->canRead('vendors')
            ? Response::allow()
            : Response::deny('You do not have permission to view vendors.');
    }

    /**
     * Determine if the user can view the vendor.
     */
    public function view(User $user, Vendor $vendor): Response
    {
        return $user->canRead('vendors')
            ? Response::allow()
            : Response::deny('You do not have permission to view vendors.');
    }

    /**
     * Determine if the user can create vendors.
     */
    public function create(User $user): Response
    {
        return $user->canWrite('vendors')
            ? Response::allow()
            : Response::deny('You do not have permission to create vendors.');
    }

    /**
     * Determine if the user can update the vendor.
     */
    public function update(User $user, Vendor $vendor): Response
    {
        return $user->canWrite('vendors')
            ? Response::allow()
            : Response::deny('You do not have permission to update vendors.');
    }

    /**
     * Determine if the user can delete the vendor.
     */
    public function delete(User $user, Vendor $vendor): Response
    {
        return $user->canWrite('vendors')
            ? Response::allow()
            : Response::deny('You do not have permission to delete vendors.');
    }

    /**
     * Determine if the user can bulk manage vendors (activate/deactivate/delete).
     */
    public function bulkManage(User $user): Response
    {
        return $user->canWrite('vendors')
            ? Response::allow()
            : Response::deny('You do not have permission to manage vendors.');
    }

    /**
     * Determine if the user can restore the vendor (for soft deletes).
     */
    public function restore(User $user, Vendor $vendor): Response
    {
        return $user->canWrite('vendors')
            ? Response::allow()
            : Response::deny('You do not have permission to restore vendors.');
    }

    /**
     * Determine if the user can permanently delete the vendor.
     */
    public function forceDelete(User $user, Vendor $vendor): Response
    {
        return $user->isAdmin()
            ? Response::allow()
            : Response::deny('Only administrators can permanently delete vendors.');
    }
}
