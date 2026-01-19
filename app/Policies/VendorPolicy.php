<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Vendor;
use Illuminate\Auth\Access\Response;

class VendorPolicy
{
    public function viewAny(User $user): Response
    {
        return $this->checkRead($user, 'view vendors');
    }

    public function view(User $user, Vendor $vendor): Response
    {
        return $this->checkRead($user, 'view vendors');
    }

    public function create(User $user): Response
    {
        return $this->checkWrite($user, 'create vendors');
    }

    public function update(User $user, Vendor $vendor): Response
    {
        return $this->checkWrite($user, 'update vendors');
    }

    public function delete(User $user, Vendor $vendor): Response
    {
        return $this->checkWrite($user, 'delete vendors');
    }

    public function bulkManage(User $user): Response
    {
        return $this->checkWrite($user, 'manage vendors');
    }

    public function restore(User $user, Vendor $vendor): Response
    {
        return $this->checkWrite($user, 'restore vendors');
    }

    public function forceDelete(User $user, Vendor $vendor): Response
    {
        return $user->isAdmin()
            ? Response::allow()
            : Response::deny('Only administrators can permanently delete vendors.');
    }

    private function checkRead(User $user, string $action): Response
    {
        return $user->canRead('vendors')
            ? Response::allow()
            : Response::deny("You do not have permission to {$action}.");
    }

    private function checkWrite(User $user, string $action): Response
    {
        return $user->canWrite('vendors')
            ? Response::allow()
            : Response::deny("You do not have permission to {$action}.");
    }
}
