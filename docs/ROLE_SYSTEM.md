# Role System Documentation

This document describes the role-based access control (RBAC) system implemented in the Payables Management System.

## Overview

The system implements a simple role-based access control with four distinct roles. Each user has exactly one role assigned to them.

## Available Roles

1. **Admin** (`admin`) - Full system access
2. **Purchasing** (`purchasing`) - Purchase order management
3. **Payables** (`payables`) - Invoice and check requisition management
4. **Disbursement** (`disbursement`) - Final payment processing

## Backend Implementation

### User Model

The `User` model includes role-related functionality:

```php
use App\Enums\UserRole;

// Check if user has a specific role
$user->hasRole(UserRole::ADMIN); // returns bool

// Convenience methods
$user->isAdmin();
$user->isPurchasing();
$user->isPayables();
$user->isDisbursement();
```

### UserRole Enum

The `UserRole` enum provides type safety and helper methods:

```php
use App\Enums\UserRole;

// Get all role options for dropdowns
$options = UserRole::options();
// Returns: ['admin' => 'Admin', 'purchasing' => 'Purchasing', ...]

// Get label for a specific role
$role = UserRole::ADMIN;
$label = $role->label(); // Returns: 'Admin'
```

### Middleware

Protect routes using the `role` middleware:

```php
// Single role
Route::get('/purchasing/dashboard', [PurchasingController::class, 'index'])
    ->middleware('role:purchasing');

// Multiple roles (user must have one of them)
Route::get('/invoices', [InvoiceController::class, 'index'])
    ->middleware('role:payables,admin');

// Admin has access to all routes by default
```

**Note:** The `role` middleware automatically grants access to users with the `admin` role, regardless of the specified role(s).

### Controller Authorization

You can also check roles in controllers:

```php
use App\Enums\UserRole;

public function store(Request $request)
{
    // Check if user has a specific role
    if (!$request->user()->hasRole(UserRole::PURCHASING)) {
        abort(403, 'Access denied');
    }

    // Or use convenience methods
    if ($request->user()->isPurchasing()) {
        // Handle purchasing logic
    }
}
```

### Database Seeding

The database seeder creates sample users for each role:

```php
// Admin users
User::factory()->admin()->create([...]);

// Or specify role directly
User::factory()->create([
    'role' => UserRole::PURCHASING,
]);

// Factory methods available
User::factory()->admin()->create();
User::factory()->purchasing()->create();
User::factory()->payables()->create();
User::factory()->disbursement()->create();
```

## Frontend Implementation

### TypeScript Types

The `UserRole` type is available in TypeScript:

```typescript
import { type UserRole } from '@/types';

// Type-safe role values
const role: UserRole = 'admin' | 'purchasing' | 'payables' | 'disbursement';
```

### Role Checking Utilities

Use the helper functions from `@/lib/roles`:

```typescript
import { hasRole, hasAnyRole, isAdmin, isPurchasing, isPayables, isDisbursement, getRoleLabel } from '@/lib/roles';
import { usePage } from '@inertiajs/react';

function MyComponent() {
    const { auth } = usePage().props;

    // Check specific role
    if (hasRole(auth.user, 'admin')) {
        // Show admin features
    }

    // Check multiple roles
    if (hasAnyRole(auth.user, ['payables', 'admin'])) {
        // Show features for payables or admin
    }

    // Convenience methods
    if (isAdmin(auth.user)) {
        // Admin-only features
    }

    if (isPurchasing(auth.user)) {
        // Purchasing features
    }

    // Get role label
    const label = getRoleLabel(auth.user.role);
    // Returns: 'Admin', 'Purchasing', etc.
}
```

### Conditional Rendering

Example of role-based conditional rendering:

```tsx
import { isAdmin, isPurchasing } from '@/lib/roles';
import { usePage } from '@inertiajs/react';

export default function Dashboard() {
    const { auth } = usePage().props;

    return (
        <div>
            <h1>Dashboard</h1>

            {isAdmin(auth.user) && (
                <AdminPanel />
            )}

            {isPurchasing(auth.user) && (
                <PurchasingDashboard />
            )}

            {auth.user.role === 'payables' && (
                <PayablesDashboard />
            )}
        </div>
    );
}
```

## Default Test Users

The database seeder creates the following test users:

| Username | Email | Password | Role |
|----------|-------|----------|------|
| admin | dexterbagtang@philcom.com | asdfasdf | Admin |
| payables.admin | payables.admin@philcom.com | payablesadmin2025 | Admin |
| purchasing | purchasing@philcom.com | password | Purchasing |
| payables | payables@philcom.com | password | Payables |
| disbursement | disbursement@philcom.com | password | Disbursement |

## Future Enhancements

- User management UI for admins to assign roles
- Role-based permissions (granular access control)
- Audit logging for role changes
- Multi-role support (if needed)

## Files Modified/Created

### Backend
- `database/migrations/0001_01_01_000000_create_users_table.php` - Updated to include role field
- `app/Enums/UserRole.php` - Created
- `app/Models/User.php` - Updated with role methods
- `app/Http/Middleware/EnsureUserHasRole.php` - Created
- `database/factories/UserFactory.php` - Updated with role support
- `database/seeders/DatabaseSeeder.php` - Updated with role assignments
- `bootstrap/app.php` - Registered role middleware

### Frontend
- `resources/js/types/index.d.ts` - Added UserRole type
- `resources/js/lib/roles.ts` - Created role helper utilities

## Notes

- Each user has exactly **one role** (no multi-role assignments)
- Admin role has access to all protected routes by default
- Role changes require database updates (no UI yet)
- Roles are stored as enum strings in the database
- Frontend receives user role through Inertia shared data
