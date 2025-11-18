<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles  Role names (e.g., 'admin', 'purchasing')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Check if user is authenticated
        if (!$request->user()) {
            abort(Response::HTTP_UNAUTHORIZED, 'Unauthenticated.');
        }

        // Admin has access to everything
        if ($request->user()->isAdmin()) {
            return $next($request);
        }

        // Check if user has any of the required roles
        $hasRole = collect($roles)->contains(function ($roleName) use ($request) {
            try {
                $role = UserRole::from($roleName);
                return $request->user()->hasRole($role);
            } catch (\ValueError $e) {
                // Invalid role name provided
                return false;
            }
        });

        if (!$hasRole) {
            abort(Response::HTTP_FORBIDDEN, 'Access denied. Insufficient permissions.');
        }

        return $next($request);
    }
}
