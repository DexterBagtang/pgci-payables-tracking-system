<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ProjectPolicy
{
    /**
     * Determine if the user can view any projects.
     */
    public function viewAny(User $user): Response
    {
        return $user->canRead('projects')
            ? Response::allow()
            : Response::deny('You do not have permission to view projects.');
    }

    /**
     * Determine if the user can view the project.
     */
    public function view(User $user, Project $project): Response
    {
        return $user->canRead('projects')
            ? Response::allow()
            : Response::deny('You do not have permission to view projects.');
    }

    /**
     * Determine if the user can create projects.
     */
    public function create(User $user): Response
    {
        return $user->canWrite('projects')
            ? Response::allow()
            : Response::deny('You do not have permission to create projects.');
    }

    /**
     * Determine if the user can update the project.
     */
    public function update(User $user, Project $project): Response
    {
        return $user->canWrite('projects')
            ? Response::allow()
            : Response::deny('You do not have permission to update projects.');
    }

    /**
     * Determine if the user can delete the project.
     */
    public function delete(User $user, Project $project): Response
    {
        return $user->canWrite('projects')
            ? Response::allow()
            : Response::deny('You do not have permission to delete projects.');
    }

    /**
     * Determine if the user can restore the project (for soft deletes).
     */
    public function restore(User $user, Project $project): Response
    {
        return $user->canWrite('projects')
            ? Response::allow()
            : Response::deny('You do not have permission to restore projects.');
    }

    /**
     * Determine if the user can permanently delete the project.
     */
    public function forceDelete(User $user, Project $project): Response
    {
        return $user->isAdmin()
            ? Response::allow()
            : Response::deny('Only administrators can permanently delete projects.');
    }
}
