<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        abort_unless(auth()->user()->canRead('users'), 403);

        $query = User::query();

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Role filter
        if ($request->filled('role')) {
            $roles = explode(',', $request->get('role'));
            $query->whereIn('role', $roles);
        }

        // Sorting functionality
        $sortField = $request->get('sort_field', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        // Validate sort field to prevent SQL injection
        $allowedSortFields = ['name', 'username', 'email', 'role', 'created_at', 'updated_at'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $perPage = in_array($perPage, [10, 15, 25, 50]) ? $perPage : 15;

        $users = $query->paginate($perPage);

        // Append query parameters to pagination links
        $users->appends($request->query());

        // Calculate stats
        $stats = [
            'total' => User::count(),
            'admin' => User::where('role', UserRole::ADMIN)->count(),
            'purchasing' => User::where('role', UserRole::PURCHASING)->count(),
            'payables' => User::where('role', UserRole::PAYABLES)->count(),
            'disbursement' => User::where('role', UserRole::DISBURSEMENT)->count(),
            'recent' => User::where('created_at', '>=', now()->subDays(7))->count(),
        ];

        return inertia('users/index', [
            'users' => $users,
            'filters' => [
                'search' => $request->get('search', ''),
                'role' => $request->get('role', ''),
                'sort_field' => $sortField,
                'sort_direction' => $sortDirection,
                'per_page' => $perPage,
            ],
            'stats' => $stats,
            'roleOptions' => UserRole::options(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        abort_unless(auth()->user()->canWrite('users'), 403);

        return inertia('users/create', [
            'roleOptions' => UserRole::options(),
            'modules' => User::MODULES,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        abort_unless(auth()->user()->canWrite('users'), 403);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:'.User::class,
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => ['required', Rule::enum(UserRole::class)],
            'permissions' => 'nullable|array',
            'permissions.read' => 'nullable|array',
            'permissions.read.*' => Rule::in(User::MODULES),
            'permissions.write' => 'nullable|array',
            'permissions.write.*' => Rule::in(User::MODULES),
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'permissions' => $validated['permissions'] ?? ['read' => [], 'write' => []],
            'email_verified_at' => now(), // Auto-verify admin-created users
        ]);

        return redirect()->route('users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        abort_unless(auth()->user()->canRead('users'), 403);

        return inertia('users/show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        abort_unless(auth()->user()->canWrite('users'), 403);

        return inertia('users/edit', [
            'user' => $user,
            'roleOptions' => UserRole::options(),
            'modules' => User::MODULES,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        abort_unless(auth()->user()->canWrite('users'), 403);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => ['required', 'string', 'max:255', Rule::unique('users')->ignore($user->id)],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => ['required', Rule::enum(UserRole::class)],
            'permissions' => 'nullable|array',
            'permissions.read' => 'nullable|array',
            'permissions.read.*' => Rule::in(User::MODULES),
            'permissions.write' => 'nullable|array',
            'permissions.write.*' => Rule::in(User::MODULES),
        ]);

        $user->update([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'permissions' => $validated['permissions'] ?? ['read' => [], 'write' => []],
        ]);

        return redirect()->route('users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Reset user password.
     */
    public function resetPassword(Request $request, User $user)
    {
        abort_unless(auth()->user()->canWrite('users'), 403);

        $validated = $request->validate([
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password reset successfully.');
    }
}
