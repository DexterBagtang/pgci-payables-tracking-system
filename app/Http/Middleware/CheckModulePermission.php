<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckModulePermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $module  The module to check permission for
     * @param  string  $permission  The permission type ('read' or 'write')
     */
    public function handle(Request $request, Closure $next, string $module, string $permission = 'read'): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(401);
        }

        $canAccess = $permission === 'write'
            ? $user->canWrite($module)
            : $user->canRead($module);

        abort_unless($canAccess, 403, "You don't have permission to access this resource.");

        return $next($request);
    }
}
