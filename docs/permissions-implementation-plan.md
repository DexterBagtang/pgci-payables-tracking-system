# Module-Level Permissions Implementation Plan

**Project:** PGCI Payables Management System
**Date:** 2026-01-07
**Objective:** Implement granular read/write permissions per module without breaking existing functionality

---

## Overview

Implement a simple, non-overengineered permission system based on `docs/user-roles.md` that:
- Controls READ access (viewing modules)
- Controls WRITE access (create/update/delete operations)
- Supports 11 specific users with predefined permissions
- Maintains backward compatibility during rollout
- Provides admin override capability

---

## Current State Analysis

### Existing Components
✅ `User` model with `role` enum column (admin, purchasing, payables, disbursement)
✅ `UserRole` enum in `app/Enums/UserRole.php`
✅ `EnsureUserHasRole` middleware (exists but not applied to routes)
✅ Authentication system working

### Current Issues
❌ No module-level permission control
❌ All authenticated users can access all routes
❌ No read/write separation
❌ Role enum is too broad (department-level, not user-level)

---

## Design Decisions

These decisions have been made for this implementation:

1. ✅ **Admin bypass:** Yes, users with `role = 'admin'` bypass all permission checks
2. ✅ **Null permissions:** No access (fail-safe default - user must have explicit permissions)
3. ✅ **Keep role column:** Yes, still used for department grouping + admin flag detection
4. ✅ **Existing users:** Only seed the 11 specific users from user-roles.md
5. ✅ **403 handling:** Show dedicated 403 error page with "Contact your manager" message
6. ✅ **Module naming:** Use `invoice_review` instead of just `review` for clarity
7. ✅ **Session handling:** Accept eventual consistency (users re-login to see permission changes)

---

## Implementation Strategy

### Phase 1: Database Schema (Non-Breaking)
### Phase 2: Backend Logic (Permission Checks)
### Phase 3: Route Protection (Gradual Rollout)
### Phase 4: Frontend Integration
### Phase 5: Data Seeding & Testing
### Phase 6: Testing & Validation

---

## Detailed Implementation Steps

## **PHASE 1: Database Schema** ✨

### 1.1 Create Migration

**Command:**
```bash
php artisan make:migration add_permissions_to_users_table
```

**File:** `database/migrations/YYYY_MM_DD_add_permissions_to_users_table.php`

**Actions:**
- Add `permissions` JSON column to `users` table (nullable)
- Set default to `null` (existing users won't break)
- Add index for performance (MySQL/PostgreSQL only - skip for SQLite)

**Schema:**
```php
Schema::table('users', function (Blueprint $table) {
    $table->json('permissions')->nullable()->after('role');

    // Optional: Add index for MySQL/PostgreSQL (not SQLite)
    // $table->index('permissions');
});
```

**Rollback Strategy:**
- Migration is reversible
- Dropping column won't affect existing auth logic

### 1.2 Update User Model

**File:** `app/Models/User.php`

**Actions:**
- Add `permissions` to casts
- Add module constants
- Add helper methods (non-breaking additions)
- Add permissions validation via mutator

**New Code:**
```php
class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $guarded = [];

    // Add to existing casts
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'permissions' => 'array', // NEW
    ];

    // Define available modules
    const MODULES = [
        'vendors',
        'projects',
        'purchase_orders',
        'invoices',
        'invoice_review',      // Renamed from 'review' for clarity
        'check_requisitions',
        'disbursements',
    ];

    /**
     * Check if user has admin override (bypasses all permission checks)
     */
    private function hasAdminOverride(): bool
    {
        return $this->role === UserRole::ADMIN;
    }

    /**
     * Check if user can read a specific module
     */
    public function canRead(string $module): bool
    {
        if ($this->hasAdminOverride()) {
            return true;
        }

        return in_array($module, $this->permissions['read'] ?? []);
    }

    /**
     * Check if user can write/modify a specific module
     */
    public function canWrite(string $module): bool
    {
        if ($this->hasAdminOverride()) {
            return true;
        }

        return in_array($module, $this->permissions['write'] ?? []);
    }

    /**
     * Get all modules user can read
     */
    public function getReadableModules(): array
    {
        if ($this->hasAdminOverride()) {
            return self::MODULES;
        }

        return $this->permissions['read'] ?? [];
    }

    /**
     * Get all modules user can write
     */
    public function getWritableModules(): array
    {
        if ($this->hasAdminOverride()) {
            return self::MODULES;
        }

        return $this->permissions['write'] ?? [];
    }

    /**
     * Validate and sanitize permissions on set
     */
    public function setPermissionsAttribute(?array $value): void
    {
        if ($value !== null) {
            $this->attributes['permissions'] = json_encode([
                'read' => array_values(array_intersect($value['read'] ?? [], self::MODULES)),
                'write' => array_values(array_intersect($value['write'] ?? [], self::MODULES)),
            ]);
        } else {
            $this->attributes['permissions'] = null;
        }
    }
}
```

**Breaking Risk:** None (only adds new methods)

---

## **PHASE 2: Backend Logic** 🔐

### 2.1 Create Authorization Gates

**File:** `app/Providers/AppServiceProvider.php` (boot method)

**Actions:**
```php
use Illuminate\Support\Facades\Gate;
use App\Models\User;

public function boot(): void
{
    // Define dynamic gates for each module
    foreach (User::MODULES as $module) {
        Gate::define("read-{$module}", fn(User $user) => $user->canRead($module));
        Gate::define("write-{$module}", fn(User $user) => $user->canWrite($module));
    }
}
```

**Usage in routes:**
```php
->middleware(['can:read-vendors'])
->middleware(['can:write-vendors'])
```

**Breaking Risk:** None (gates are additive)

### 2.2 Create Permission Middleware (Optional)

**File:** `app/Http/Middleware/CheckModulePermission.php`

**Command:**
```bash
php artisan make:middleware CheckModulePermission
```

**Code:**
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckModulePermission
{
    public function handle(Request $request, Closure $next, string $module, string $permission = 'read')
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
```

**Register in:** `app/Http/Kernel.php` or `bootstrap/app.php` (Laravel 11+)

**Breaking Risk:** None (new file, not applied yet)

---

## **PHASE 3: Route Protection** 🛡️

### 3.1 Identify Routes to Protect

**Modules Mapping:**

| Module | Routes | Read Methods | Write Methods |
|--------|--------|--------------|---------------|
| `vendors` | `/vendors` | index, show | store, update, destroy, bulkDelete, bulkUpdate |
| `projects` | `/projects` | index, show | store, update, destroy |
| `purchase_orders` | `/purchase-orders` | index, show | store, update, close |
| `invoices` | `/invoices` | index, show | store, update, bulkUpdate, bulkDelete |
| `invoice_review` | `/invoices/*/review` | - | review, bulkReview, bulkApprove, bulkReject |
| `check_requisitions` | `/check-requisitions` | index, show, create | store, update, approve, reject |
| `disbursements` | `/disbursements` | index, show, calendar, kanban | store, update, quickRelease, bulkRelease |

**Note:** Bulk operations include common patterns like:
- `bulkDelete` - Delete multiple records
- `bulkUpdate` - Update multiple records
- `bulkApprove` - Approve multiple items
- `bulkReject` - Reject multiple items
- `bulkRelease` - Release multiple disbursements

### 3.2 Controller-Level Authorization (Recommended Approach)

**Why Controller Level:**
- More granular control than route middleware
- Easier to debug and test
- Can add custom error messages per action
- Aligns with Laravel best practices

**Pattern:**
```php
public function index()
{
    abort_unless(auth()->user()->canRead('vendors'), 403);
    // existing code...
}

public function store(Request $request)
{
    abort_unless(auth()->user()->canWrite('vendors'), 403);
    // existing code...
}

public function update(Request $request, Vendor $vendor)
{
    abort_unless(auth()->user()->canWrite('vendors'), 403);
    // existing code...
}

public function destroy(Vendor $vendor)
{
    abort_unless(auth()->user()->canWrite('vendors'), 403);
    // existing code...
}
```

**Files to Update:**
- `app/Http/Controllers/VendorController.php`
- `app/Http/Controllers/ProjectController.php`
- `app/Http/Controllers/PurchaseOrderController.php`
- `app/Http/Controllers/InvoiceController.php`
- `app/Http/Controllers/CheckRequisitionController.php`
- `app/Http/Controllers/DisbursementController.php`

**Breaking Risk:** HIGH if applied all at once
**Mitigation:** Apply one controller at a time, test with seeded users

### 3.3 Alternative: FormRequest Authorization

For controllers using FormRequests, add authorization there:

**Example File:** `app/Http/Requests/StoreVendorRequest.php`

```php
public function authorize(): bool
{
    return auth()->user()->canWrite('vendors');
}
```

**Advantages:**
- Validation and authorization in one place
- Automatic 403 responses
- Cleaner controller code

**Files that might use this pattern:**
- `app/Http/Requests/StoreVendorRequest.php`
- `app/Http/Requests/UpdateVendorRequest.php`
- Similar request classes for other modules

### 3.4 Gradual Rollout Strategy

**Step 1:** Start with one low-risk module (e.g., Vendors)
```php
// VendorController.php - Add authorization checks
public function index()
{
    abort_unless(auth()->user()->canRead('vendors'), 403);
    // existing code...
}
```

**Step 2:** Test thoroughly with different users
- Test MGU (read-only)
- Test MCZ (can write vendors)
- Test KAU (cannot write vendors)

**Step 3:** If successful, apply to next module

**Step 4:** Repeat until all controllers protected

---

## **PHASE 4: Frontend Integration** 🎨

### 4.1 Share Permissions via Inertia

**File:** `app/Http/Middleware/HandleInertiaRequests.php`

**Update `share()` method:**
```php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'auth' => [
            'user' => $request->user(),
            'permissions' => [
                'read' => $request->user()?->getReadableModules() ?? [],
                'write' => $request->user()?->getWritableModules() ?? [],
            ],
        ],
    ];
}
```

### 4.2 TypeScript Types

**File:** `resources/js/types/index.d.ts`

**Add/Update:**
```typescript
export interface PageProps {
    auth: {
        user: User;
        permissions: {
            read: string[];
            write: string[];
        };
    };
    // ... other props
}
```

**Verify:** Check that `@/types` path is configured in `tsconfig.json`:
```json
{
    "compilerOptions": {
        "paths": {
            "@/*": ["./resources/js/*"]
        }
    }
}
```

### 4.3 Create Permission Hook

**File:** `resources/js/hooks/usePermissions.ts`

```typescript
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

export function usePermissions() {
    const { permissions } = usePage<PageProps>().props.auth;

    return {
        canRead: (module: string) => permissions.read.includes(module),
        canWrite: (module: string) => permissions.write.includes(module),
        readableModules: permissions.read,
        writableModules: permissions.write,
    };
}
```

### 4.4 Update Page Components

**Pattern:**
```tsx
import { usePermissions } from '@/hooks/usePermissions';

export default function VendorIndex() {
    const { canWrite } = usePermissions();

    return (
        <>
            {canWrite('vendors') && (
                <Button onClick={handleCreate}>Create Vendor</Button>
            )}

            {canWrite('vendors') && (
                <Button onClick={handleEdit}>Edit</Button>
            )}

            {canWrite('vendors') && (
                <Button onClick={handleDelete}>Delete</Button>
            )}
        </>
    );
}
```

**Files to Update:**
- `resources/js/pages/Vendors/Index.tsx`
- `resources/js/pages/Projects/Index.tsx`
- `resources/js/pages/PurchaseOrders/Index.tsx`
- `resources/js/pages/Invoices/Index.tsx`
- `resources/js/pages/CheckRequisitions/Index.tsx`
- `resources/js/pages/Disbursements/Index.tsx`
- All corresponding Edit/Create/Show pages

**Breaking Risk:** Low (only hides UI elements, doesn't break functionality)

### 4.5 Update Navigation Component

**Find navigation component:**
```bash
# Use Grep to find navigation/menu component
# Look for files with navigation logic
```

**Pattern:**
```tsx
import { usePermissions } from '@/hooks/usePermissions';

export default function Navigation() {
    const { canRead } = usePermissions();

    const navItems = [
        { module: 'vendors', label: 'Vendors', href: '/vendors', icon: Building },
        { module: 'projects', label: 'Projects', href: '/projects', icon: Briefcase },
        { module: 'purchase_orders', label: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCart },
        { module: 'invoices', label: 'Invoices', href: '/invoices', icon: FileText },
        { module: 'invoice_review', label: 'Review', href: '/invoices/review', icon: CheckSquare },
        { module: 'check_requisitions', label: 'Check Requisitions', href: '/check-requisitions', icon: DollarSign },
        { module: 'disbursements', label: 'Disbursements', href: '/disbursements', icon: Send },
    ].filter(item => canRead(item.module));

    return (
        <nav>
            {navItems.map(item => (
                <NavLink key={item.module} href={item.href}>
                    <item.icon />
                    {item.label}
                </NavLink>
            ))}
        </nav>
    );
}
```

### 4.6 Create Custom 403 Error Page

**File:** `resources/js/pages/Errors/403.tsx`

```tsx
export default function Error403() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-6xl font-bold">403</h1>
                <p className="text-xl mt-4">Access Denied</p>
                <p className="text-gray-600 mt-2">
                    You don't have permission to access this resource.
                </p>
                <p className="text-gray-600">
                    Please contact your manager if you believe this is an error.
                </p>
                <a href="/" className="mt-6 inline-block text-blue-600">
                    Return to Dashboard
                </a>
            </div>
        </div>
    );
}
```

---

## **PHASE 5: Data Seeding** 🌱

### 5.1 Create User Seeder

**Command:**
```bash
php artisan make:seeder UserPermissionsSeeder
```

**File:** `database/seeders/UserPermissionsSeeder.php`

**Complete Implementation:**

```php
<?php

namespace Database\Seeders;

use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            // Accounting Department
            [
                'username' => 'MGU',
                'name' => 'Mike Renzo G. Ulit',
                'email' => 'Mike.Ulit@philcom.com',
                'password' => Hash::make('password'), // Change on first login
                'role' => UserRole::PAYABLES,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders', 'invoices',
                               'invoice_review', 'check_requisitions', 'disbursements'],
                    'write' => []
                ]
            ],
            [
                'username' => 'JTM',
                'name' => 'Jhoy T. Mayuga',
                'email' => 'Jhoy.Mayuga@philcom.com',
                'password' => Hash::make('password'),
                'role' => UserRole::PAYABLES,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders', 'invoices',
                               'invoice_review', 'check_requisitions', 'disbursements'],
                    'write' => []
                ]
            ],
            [
                'username' => 'KAU',
                'name' => 'Kimberly A. Usona',
                'email' => 'Kimberly.Usona@philcom.com',
                'password' => Hash::make('password'),
                'role' => UserRole::PAYABLES,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders', 'invoices',
                               'invoice_review', 'check_requisitions', 'disbursements'],
                    'write' => ['invoice_review', 'check_requisitions']
                ]
            ],
            [
                'username' => 'JLM',
                'name' => 'Joseph David L. Maderazo',
                'email' => 'Joseph.Maderazo@philcom.com',
                'password' => Hash::make('password'),
                'role' => UserRole::PAYABLES,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders', 'invoices',
                               'invoice_review', 'check_requisitions', 'disbursements'],
                    'write' => []
                ]
            ],

            // Purchasing Department
            [
                'username' => 'MCZ',
                'name' => 'Marlon C. Zinampan',
                'email' => 'Marlon.Zinampan@philcom.com',
                'password' => Hash::make('password'),
                'role' => UserRole::PURCHASING,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders', 'invoices',
                               'invoice_review', 'check_requisitions', 'disbursements'],
                    'write' => ['vendors', 'projects', 'purchase_orders']
                ]
            ],
            [
                'username' => 'AMO',
                'name' => 'Adiree Mae M. Oreo',
                'email' => 'Adiree.Morada@philcom.com',
                'password' => Hash::make('password'),
                'role' => UserRole::PURCHASING,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders', 'invoices',
                               'invoice_review', 'check_requisitions', 'disbursements'],
                    'write' => []
                ]
            ],
            [
                'username' => 'PCD',
                'name' => 'Paulus Antonio C. DeDios',
                'email' => 'Paulus.DeDios@philcom.com',
                'password' => Hash::make('password'),
                'role' => UserRole::PURCHASING,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders', 'invoices',
                               'invoice_review', 'check_requisitions', 'disbursements'],
                    'write' => ['purchase_orders']
                ]
            ],
            [
                'username' => 'MBA',
                'name' => 'Marymay Joy B. Alteza',
                'email' => 'Marymay.Alteza@philcom.com',
                'password' => Hash::make('password'),
                'role' => UserRole::PURCHASING,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders', 'invoices',
                               'invoice_review', 'check_requisitions', 'disbursements'],
                    'write' => ['invoices']
                ]
            ],

            // Cash Management/Treasury Department
            [
                'username' => 'JML',
                'name' => 'Jose Bernardino M. Labay',
                'email' => 'Jose.Labay@philcom.com',
                'password' => Hash::make('password'),
                'role' => UserRole::DISBURSEMENT,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders', 'invoices',
                               'invoice_review', 'check_requisitions', 'disbursements'],
                    'write' => []
                ]
            ],
            [
                'username' => 'NED',
                'name' => 'Nina Erica Domingo',
                'email' => 'Nina.Domingo@philcom.com',
                'password' => Hash::make('password'),
                'role' => UserRole::DISBURSEMENT,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders', 'invoices',
                               'invoice_review', 'check_requisitions', 'disbursements'],
                    'write' => ['disbursements']
                ]
            ],
            [
                'username' => 'MPR',
                'name' => 'Margie Loraine P. Roset',
                'email' => 'Margie.Roset@philcom.com',
                'password' => Hash::make('password'),
                'role' => UserRole::DISBURSEMENT,
                'email_verified_at' => now(),
                'permissions' => [
                    'read' => ['vendors', 'projects', 'purchase_orders', 'invoices',
                               'invoice_review', 'check_requisitions', 'disbursements'],
                    'write' => []
                ]
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['username' => $userData['username']],
                $userData
            );
        }

        $this->command->info('Successfully seeded ' . count($users) . ' users with permissions.');
    }
}
```

### 5.2 Run Seeder

```bash
php artisan db:seed --class=UserPermissionsSeeder
```

### 5.3 Handle Active Sessions

**Issue:** Users logged in during permission changes won't see updates until re-login

**Options:**
1. **Accept eventual consistency (Recommended)** - Simplest approach
2. Force logout all users: `php artisan queue:restart` + delete sessions table
3. Add permission version check in middleware (over-engineered)

**Recommendation:** Use option 1 and notify users via email/Slack to re-login after deployment

---

## **PHASE 6: Testing** 🧪

### 6.1 Unit Tests

**Command:**
```bash
php artisan make:test UserPermissionsTest --unit
```

**File:** `tests/Unit/UserPermissionsTest.php`

**Test Cases:**
```php
<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserPermissionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_read_module_with_permission()
    {
        $user = User::factory()->create([
            'permissions' => ['read' => ['vendors'], 'write' => []]
        ]);

        $this->assertTrue($user->canRead('vendors'));
    }

    public function test_user_cannot_read_module_without_permission()
    {
        $user = User::factory()->create([
            'permissions' => ['read' => [], 'write' => []]
        ]);

        $this->assertFalse($user->canRead('vendors'));
    }

    public function test_user_can_write_module_with_permission()
    {
        $user = User::factory()->create([
            'permissions' => ['read' => ['vendors'], 'write' => ['vendors']]
        ]);

        $this->assertTrue($user->canWrite('vendors'));
    }

    public function test_user_cannot_write_module_without_permission()
    {
        $user = User::factory()->create([
            'permissions' => ['read' => ['vendors'], 'write' => []]
        ]);

        $this->assertFalse($user->canWrite('vendors'));
    }

    public function test_user_with_null_permissions_cannot_access_modules()
    {
        $user = User::factory()->create(['permissions' => null]);

        $this->assertFalse($user->canRead('vendors'));
        $this->assertFalse($user->canWrite('vendors'));
    }

    public function test_user_with_empty_permissions_array_cannot_access_modules()
    {
        $user = User::factory()->create([
            'permissions' => ['read' => [], 'write' => []]
        ]);

        $this->assertFalse($user->canRead('vendors'));
        $this->assertFalse($user->canWrite('vendors'));
    }

    public function test_admin_role_bypasses_permission_checks()
    {
        $admin = User::factory()->create([
            'role' => UserRole::ADMIN,
            'permissions' => null // Even with null permissions
        ]);

        $this->assertTrue($admin->canRead('vendors'));
        $this->assertTrue($admin->canWrite('vendors'));
        $this->assertTrue($admin->canRead('invoices'));
        $this->assertTrue($admin->canWrite('disbursements'));
    }

    public function test_permissions_mutator_validates_modules()
    {
        $user = User::factory()->create([
            'permissions' => [
                'read' => ['vendors', 'invalid_module', 'projects'],
                'write' => ['vendors', 'fake_module']
            ]
        ]);

        // Invalid modules should be filtered out
        $this->assertTrue($user->canRead('vendors'));
        $this->assertTrue($user->canRead('projects'));
        $this->assertFalse($user->canRead('invalid_module'));
        $this->assertFalse($user->canWrite('fake_module'));
    }

    public function test_get_readable_modules_returns_correct_array()
    {
        $user = User::factory()->create([
            'permissions' => ['read' => ['vendors', 'projects'], 'write' => []]
        ]);

        $this->assertEquals(['vendors', 'projects'], $user->getReadableModules());
    }

    public function test_get_writable_modules_returns_correct_array()
    {
        $user = User::factory()->create([
            'permissions' => ['read' => ['vendors'], 'write' => ['vendors', 'projects']]
        ]);

        $this->assertEquals(['vendors', 'projects'], $user->getWritableModules());
    }
}
```

### 6.2 Feature Tests

**Command:**
```bash
php artisan make:test ModuleAccessTest
```

**File:** `tests/Feature/ModuleAccessTest.php`

**Test Cases:**
```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ModuleAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_with_read_permission_can_view_vendor_index()
    {
        $user = User::factory()->create([
            'permissions' => ['read' => ['vendors'], 'write' => []]
        ]);

        $response = $this->actingAs($user)->get('/vendors');

        $response->assertStatus(200);
    }

    public function test_user_without_read_permission_cannot_view_vendor_index()
    {
        $user = User::factory()->create([
            'permissions' => ['read' => [], 'write' => []]
        ]);

        $response = $this->actingAs($user)->get('/vendors');

        $response->assertStatus(403);
    }

    public function test_user_with_write_permission_can_create_vendor()
    {
        $user = User::factory()->create([
            'permissions' => ['read' => ['vendors'], 'write' => ['vendors']]
        ]);

        $response = $this->actingAs($user)->post('/vendors', [
            'name' => 'Test Vendor',
            // ... other required fields
        ]);

        $response->assertStatus(302); // or 200/201 depending on implementation
    }

    public function test_user_without_write_permission_cannot_create_vendor()
    {
        $user = User::factory()->create([
            'permissions' => ['read' => ['vendors'], 'write' => []]
        ]);

        $response = $this->actingAs($user)->post('/vendors', [
            'name' => 'Test Vendor',
        ]);

        $response->assertStatus(403);
    }

    // Repeat similar tests for:
    // - Projects
    // - Purchase Orders
    // - Invoices
    // - Invoice Review
    // - Check Requisitions
    // - Disbursements
}
```

### 6.3 Manual Testing Checklist

Test with seeded users:

- [ ] **MGU** (Accounting Manager - Read Only)
  - [ ] Can view all modules
  - [ ] Cannot edit/create/delete anything
  - [ ] All action buttons hidden

- [ ] **KAU** (Payables Associate)
  - [ ] Can view all modules
  - [ ] Can edit Review and Check Requisitions
  - [ ] Cannot edit other modules

- [ ] **MCZ** (Purchasing Supervisor)
  - [ ] Can view all modules
  - [ ] Can edit Vendors, Projects, and Purchase Orders
  - [ ] Cannot edit Invoices, Review, Check Requisitions, Disbursements

- [ ] **MBA** (Purchasing Associate)
  - [ ] Can view all modules
  - [ ] Can edit Invoices only
  - [ ] Cannot edit other modules

- [ ] **NED** (Disbursement Associate)
  - [ ] Can view all modules
  - [ ] Can edit Disbursements only
  - [ ] Cannot edit other modules

- [ ] **General Tests**
  - [ ] Unauthorized access returns 403 error page
  - [ ] Frontend hides buttons correctly per user
  - [ ] Navigation only shows accessible modules
  - [ ] Direct URL access blocked for unauthorized modules
  - [ ] API endpoints respect permissions

---

## Implementation Checkpoints

Each phase should be completed and tested before moving to the next:

### Phase 1 Checkpoint
- [ ] Migration runs successfully without errors
- [ ] User model has new methods
- [ ] `permissions` column exists in users table
- [ ] Existing app works exactly as before (no breaking changes)

### Phase 2 Checkpoint
- [ ] Gates registered in AppServiceProvider
- [ ] Middleware created (if using)
- [ ] Can call `Gate::allows('read-vendors')` without errors
- [ ] Existing app still works

### Phase 3 Checkpoint
- [ ] Authorization added to one controller
- [ ] Test users can access with correct permissions
- [ ] Users without permission get 403
- [ ] Repeat for each controller before moving forward
- [ ] All backend routes protected

### Phase 4 Checkpoint
- [ ] Permissions available in Inertia props
- [ ] `usePermissions` hook works
- [ ] One page correctly hides/shows buttons
- [ ] TypeScript types updated
- [ ] All frontend components updated
- [ ] 403 error page displays correctly

### Phase 5 Checkpoint
- [ ] Seeder runs without errors
- [ ] All 11 users created/updated
- [ ] Permissions stored correctly in database
- [ ] Can login as each user
- [ ] Users notified to re-login if already logged in

### Phase 6 Checkpoint
- [ ] All unit tests pass (`composer test`)
- [ ] All feature tests pass
- [ ] Manual testing checklist completed
- [ ] No regressions in existing functionality
- [ ] Documentation updated

---

## Migration Path (Step-by-Step Execution)

### Step 1: Preparation (No Breaking Changes)
1. Run migration: `php artisan migrate`
2. Update User model with new methods
3. Add Gates in AppServiceProvider
4. Create permission hook on frontend
5. Create middleware (optional)

**Verification:** Existing app should work exactly as before

### Step 2: Seed Users (No Breaking Changes)
1. Create seeder file
2. Run: `php artisan db:seed --class=UserPermissionsSeeder`
3. Verify users in database: `php artisan tinker` → `User::all()->pluck('username', 'permissions')`

**Verification:** App still works, permissions stored but not enforced yet

### Step 3: Backend Protection (One Module at a Time)
1. Apply authorization to `VendorController`
2. Test vendor module with MGU (should fail), MCZ (should succeed)
3. Apply to `ProjectController` and test
4. Apply to `PurchaseOrderController` and test
5. Apply to `InvoiceController` (including review routes) and test
6. Apply to `CheckRequisitionController` and test
7. Apply to `DisbursementController` and test

**Verification:** Each module tested individually before proceeding

### Step 4: Frontend Updates (Gradual)
1. Update `HandleInertiaRequests` to share permissions
2. Update TypeScript types
3. Update one module's UI (e.g., vendors/Index.tsx)
4. Test UI updates with different users
5. Update navigation component
6. Repeat for all module pages
7. Create 403 error page

**Verification:** Buttons/forms hidden correctly for each user role

### Step 5: Testing & Validation
1. Run unit tests: `composer test`
2. Run feature tests
3. Complete manual testing checklist
4. Fix any issues found
5. Re-test after fixes

**Verification:** Full test suite passes, all manual checks completed

### Step 6: Deployment & Cleanup (Optional)
1. Deploy to staging environment
2. Test in staging with real users
3. Deploy to production
4. Notify users to re-login
5. Monitor for issues
6. Remove old `EnsureUserHasRole` middleware if not needed
7. Update documentation

---

## Rollback Strategy

### If Issues Occur in Phase 3 (Route Protection):

**Quick Rollback:**
```php
// Comment out authorization checks in controllers
// abort_unless(auth()->user()->canWrite('vendors'), 403);
```

**Or revert specific controller:**
```bash
git checkout HEAD -- app/Http/Controllers/VendorController.php
```

### If Database Issues Occur:

```bash
php artisan migrate:rollback --step=1
```

**Note:** This will drop the permissions column but won't affect auth

### If Frontend Breaks:

```php
// In HandleInertiaRequests.php - comment out permissions
'auth' => [
    'user' => $request->user(),
    // 'permissions' => [...],
],
```

```tsx
// In components - comment out permission checks
// {canWrite('vendors') && (
    <Button>Create</Button>
// )}
```

### Nuclear Option (Full Rollback):

```bash
git revert <commit-hash>
php artisan migrate:rollback
php artisan config:clear
php artisan cache:clear
npm run build
```

---

## Files Changed Summary

### Backend (Laravel)

| File | Type | Breaking? | Description |
|------|------|-----------|-------------|
| `database/migrations/*_add_permissions_to_users_table.php` | New | No | Adds permissions JSON column |
| `app/Models/User.php` | Modified | No | Adds permission methods |
| `app/Providers/AppServiceProvider.php` | Modified | No | Registers gates |
| `database/seeders/UserPermissionsSeeder.php` | New | No | Seeds 11 users |
| `app/Http/Middleware/CheckModulePermission.php` | New | No | Optional middleware |
| `app/Http/Controllers/VendorController.php` | Modified | Yes* | Adds authorization checks |
| `app/Http/Controllers/ProjectController.php` | Modified | Yes* | Adds authorization checks |
| `app/Http/Controllers/PurchaseOrderController.php` | Modified | Yes* | Adds authorization checks |
| `app/Http/Controllers/InvoiceController.php` | Modified | Yes* | Adds authorization checks |
| `app/Http/Controllers/CheckRequisitionController.php` | Modified | Yes* | Adds authorization checks |
| `app/Http/Controllers/DisbursementController.php` | Modified | Yes* | Adds authorization checks |
| `app/Http/Middleware/HandleInertiaRequests.php` | Modified | No | Shares permissions |
| `app/Http/Requests/*Request.php` | Modified | Optional | FormRequest authorization |
| `tests/Unit/UserPermissionsTest.php` | New | No | Unit tests |
| `tests/Feature/ModuleAccessTest.php` | New | No | Feature tests |

*Breaking only if user lacks permissions

### Frontend (React/TypeScript)

| File | Type | Breaking? | Description |
|------|------|-----------|-------------|
| `resources/js/types/index.d.ts` | Modified | No | Adds permission types |
| `resources/js/hooks/usePermissions.ts` | New | No | Permission hook |
| `resources/js/pages/Vendors/Index.tsx` | Modified | No | Conditional buttons |
| `resources/js/pages/Projects/Index.tsx` | Modified | No | Conditional buttons |
| `resources/js/pages/PurchaseOrders/Index.tsx` | Modified | No | Conditional buttons |
| `resources/js/pages/Invoices/Index.tsx` | Modified | No | Conditional buttons |
| `resources/js/pages/CheckRequisitions/Index.tsx` | Modified | No | Conditional buttons |
| `resources/js/pages/Disbursements/Index.tsx` | Modified | No | Conditional buttons |
| `resources/js/components/Navigation.tsx` | Modified | No | Filter nav items |
| `resources/js/pages/Errors/403.tsx` | New | No | Custom 403 page |

---

## Success Criteria

- ✅ All 11 users can log in successfully
- ✅ Read permissions correctly restrict module viewing
- ✅ Write permissions correctly restrict create/edit/delete operations
- ✅ UI correctly hides/shows buttons based on permissions
- ✅ Navigation only shows accessible modules
- ✅ Unauthorized access returns 403 with clear error message
- ✅ No existing functionality broken for authorized users
- ✅ All tests pass (unit + feature)
- ✅ Admin users (if any) bypass all permission checks
- ✅ Users with null permissions have no access (fail-safe)
- ✅ Permissions validated on save (no invalid modules stored)

---

## Notes & Considerations

### Why Not Use Spatie Laravel-Permission?
- ✅ Overkill for 11 fixed users with static permissions
- ✅ Adds unnecessary complexity (roles table, permissions table, pivot tables)
- ✅ Our simple JSON approach is easier to understand and maintain
- ✅ No need for dynamic role/permission management UI
- ✅ Faster queries (no joins needed)

### Why JSON Column Instead of Pivot Table?
- ✅ Permissions won't change frequently (11 fixed users)
- ✅ Simpler queries (no joins needed)
- ✅ Easier to seed and modify
- ✅ Less database overhead
- ✅ Good enough for this use case
- ✅ Can always migrate to pivot table later if needed

### Admin Override Implementation
- Admin users (with `role = 'admin'`) bypass all permission checks
- Implemented in `hasAdminOverride()` private method
- Returns `true` for all `canRead()` and `canWrite()` calls
- Useful for system administrators and debugging

### Session Handling
- Users logged in during deployment won't see changes until re-login
- Accept this as eventual consistency (simplest approach)
- Alternative: Clear sessions during deployment (more disruptive)
- Notify users to re-login after deployment via email/Slack

### Database Compatibility
- JSON column works on MySQL 5.7+, PostgreSQL 9.4+, SQLite 3.9+
- JSON indexing only on MySQL/PostgreSQL (skip for SQLite)
- Mutator ensures data validity regardless of database

### Future Enhancements (Out of Scope)
- Admin panel to manage user permissions via UI
- Audit log for permission changes (separate from activity log)
- Role templates (e.g., "Accounting Manager" role with predefined permissions)
- Dynamic module registration system
- Permission inheritance (e.g., write implies read)
- Time-based permissions (temporary access grants)
- IP-based restrictions per module

---

## Pre-Implementation Validation

Before starting implementation, verify:

1. ✅ All 11 users from `user-roles.md` are documented
2. ✅ Email addresses use `@philcom.com` domain
3. ✅ Module names match existing route structure
4. ✅ Laravel version supports JSON columns
5. ✅ Test database configured (SQLite recommended)
6. ✅ Backup production database before deployment
7. ✅ Staging environment available for testing
8. ✅ Team notified about upcoming permission changes

---

**Ready to implement?** Follow phases 1-6 in order, completing all checkpoints before proceeding to the next phase.
