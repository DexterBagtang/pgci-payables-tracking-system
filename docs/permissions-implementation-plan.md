# Module-Level Permissions Implementation Plan

**Project:** PGCI Payables Management System
**Date:** 2026-01-06
**Objective:** Implement granular read/write permissions per module without breaking existing functionality

---

## Overview

Implement a simple, non-overengineered permission system based on `docs/user-roles.md` that:
- Controls READ access (viewing modules)
- Controls WRITE access (create/update/delete operations)
- Supports 11 specific users with predefined permissions
- Maintains backward compatibility during rollout

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

## Implementation Strategy

### Phase 1: Database Schema (Non-Breaking)
### Phase 2: Backend Logic (Permission Checks)
### Phase 3: Route Protection (Gradual Rollout)
### Phase 4: Frontend Integration
### Phase 5: Data Seeding & Testing

---

## Detailed Implementation Steps

## **PHASE 1: Database Schema** ✨

### 1.1 Create Migration

**File:** `database/migrations/YYYY_MM_DD_add_permissions_to_users_table.php`

**Actions:**
- Add `permissions` JSON column to `users` table (nullable)
- Set default to `null` (existing users won't break)
- Add index for performance (optional)

**Schema:**
```php
Schema::table('users', function (Blueprint $table) {
    $table->json('permissions')->nullable()->after('role');
});
```

**Rollback Strategy:**
- Migration is reversible
- Dropping column won't affect existing auth logic

### 1.2 Update User Model

**File:** `app/Models/User.php`

**Actions:**
- Add `permissions` to `$fillable` or `$guarded = []` (already using guarded)
- Add cast: `'permissions' => 'array'`
- Add helper methods (non-breaking additions)

**New Methods:**
```php
public function canRead(string $module): bool
public function canWrite(string $module): bool
public function getReadableModules(): array
public function getWritableModules(): array
```

**Breaking Risk:** None (only adds new methods)

---

## **PHASE 2: Backend Logic** 🔐

### 2.1 Define Module Constants

**File:** `app/Models/User.php` or `config/modules.php`

**Modules List:**
```php
const MODULES = [
    'vendors',
    'projects',
    'purchase_orders',
    'invoices',
    'review',              // Invoice review workflow
    'check_requisitions',
    'disbursements',
];
```

### 2.2 Create Authorization Gates

**File:** `app/Providers/AppServiceProvider.php` (boot method)

**Actions:**
```php
use Illuminate\Support\Facades\Gate;

Gate::define('read', fn($user, $module) => $user->canRead($module));
Gate::define('write', fn($user, $module) => $user->canWrite($module));
```

**Breaking Risk:** None (gates are additive)

### 2.3 Create Permission Middleware (Optional)

**File:** `app/Http/Middleware/CheckModulePermission.php`

**Purpose:** Reusable middleware for route protection

**Breaking Risk:** None (new file, not applied yet)

---

## **PHASE 3: Route Protection** 🛡️

### 3.1 Identify Routes to Protect

**Modules Mapping:**

| Module | Routes | Read Methods | Write Methods |
|--------|--------|--------------|---------------|
| `vendors` | `/vendors` | index, show | store, update, destroy, bulk-* |
| `projects` | `/projects` | index, show | store, update, destroy |
| `purchase_orders` | `/purchase-orders` | index, show | store, update, close |
| `invoices` | `/invoices` | index, show | store, update, bulk-* |
| `review` | `/invoices/*/review` | - | review, bulk-review, bulk-approve, bulk-reject |
| `check_requisitions` | `/check-requisitions` | index, show, create (form) | store, update, approve, reject |
| `disbursements` | `/disbursements` | index, show, calendar, kanban | store, update, quick-release, bulk-release |

### 3.2 Apply Middleware Gradually

**Strategy:** Start with one module, test, then expand

**Example (Vendors Module):**
```php
// Before
Route::resource('vendors', VendorController::class);

// After (Step 1: Read protection)
Route::resource('vendors', VendorController::class)
    ->middleware(['can:read,vendors']);

// After (Step 2: Write protection - controller level)
// In VendorController::store()
abort_unless(auth()->user()->canWrite('vendors'), 403);
```

**Breaking Risk:** HIGH if applied all at once
**Mitigation:** Apply one module at a time, test thoroughly

### 3.3 Controller-Level Authorization (Preferred)

**Why:** More granular control, easier to debug

**Pattern:**
```php
public function index()
{
    abort_unless(auth()->user()->canRead('vendors'), 403);
    // existing code...
}

public function store()
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

**Add:**
```typescript
export interface PageProps {
    auth: {
        user: User;
        permissions: {
            read: string[];
            write: string[];
        };
    };
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

### 4.4 Update Components

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
        </>
    );
}
```

**Files to Update:**
- All index pages (vendors, projects, POs, invoices, etc.)
- All action buttons (edit, delete, bulk operations)
- Form pages (conditionally show based on write access)

**Breaking Risk:** Low (only hides UI elements, doesn't break functionality)

---

## **PHASE 5: Data Seeding** 🌱

### 5.1 Create User Seeder

**File:** `database/seeders/UserPermissionsSeeder.php`

**Users to Seed (from user-roles.md):**

```php
// Accounting Department
$users = [
    [
        'username' => 'MGU',
        'name' => 'Mike Renzo G. Ulit',
        'email' => 'mgu@pgci.com',
        'role' => 'payables',
        'permissions' => [
            'read' => ['vendors', 'projects', 'purchase_orders', 'invoices',
                       'review', 'check_requisitions', 'disbursements'],
            'write' => []
        ]
    ],
    [
        'username' => 'KAU',
        'name' => 'Kimberly A. Usona',
        'email' => 'kau@pgci.com',
        'role' => 'payables',
        'permissions' => [
            'read' => ['vendors', 'projects', 'purchase_orders', 'invoices',
                       'review', 'check_requisitions', 'disbursements'],
            'write' => ['review', 'check_requisitions']
        ]
    ],
    // ... (all 11 users)
];
```

### 5.2 Handle Existing Users

**Strategy:**
- Don't delete existing users
- Update if username exists
- Create if doesn't exist

```php
foreach ($users as $userData) {
    User::updateOrCreate(
        ['username' => $userData['username']],
        $userData
    );
}
```

---

## **PHASE 6: Testing** 🧪

### 6.1 Unit Tests

**File:** `tests/Unit/UserPermissionsTest.php`

**Test Cases:**
- `test_user_can_read_module_with_permission()`
- `test_user_cannot_read_module_without_permission()`
- `test_user_can_write_module_with_permission()`
- `test_user_cannot_write_module_without_permission()`

### 6.2 Feature Tests

**File:** `tests/Feature/ModuleAccessTest.php`

**Test Cases:**
- Test each controller with different user permissions
- Test 403 responses for unauthorized access
- Test successful operations for authorized users

### 6.3 Manual Testing Checklist

- [ ] MGU can view all modules but cannot edit anything
- [ ] KAU can edit Review and Check Requisitions only
- [ ] MCZ can edit Vendors, Projects, and Purchase Orders
- [ ] MBA can edit Invoices only
- [ ] NED can edit Disbursements only
- [ ] All users can view all modules
- [ ] Unauthorized access returns 403
- [ ] Frontend hides buttons correctly

---

## Migration Path (Step-by-Step Execution)

### Step 1: Preparation (No Breaking Changes)
1. ✅ Run migration to add `permissions` column
2. ✅ Update User model with new methods
3. ✅ Add Gates in AppServiceProvider
4. ✅ Create permission hook on frontend

**Test:** Existing app should work exactly as before

### Step 2: Seed Users (No Breaking Changes)
1. ✅ Run UserPermissionsSeeder
2. ✅ Verify users have correct permissions in database

**Test:** App still works, permissions stored but not enforced yet

### Step 3: Backend Protection (One Module at a Time)
1. ✅ Apply authorization to VendorController
2. ✅ Test vendor module with different users
3. ✅ Repeat for ProjectController
4. ✅ Repeat for PurchaseOrderController
5. ✅ Repeat for InvoiceController (including review routes)
6. ✅ Repeat for CheckRequisitionController
7. ✅ Repeat for DisbursementController

**Test:** Each module after applying protection

### Step 4: Frontend Updates (Gradual)
1. ✅ Update Inertia share
2. ✅ Update one module's UI (e.g., vendors)
3. ✅ Test UI updates
4. ✅ Repeat for all modules

**Test:** Buttons/forms hidden correctly for each user

### Step 5: Cleanup (Optional)
1. ✅ Remove old role-based methods if not needed
2. ✅ Update documentation
3. ✅ Remove `EnsureUserHasRole` middleware if replaced

---

## Rollback Strategy

### If Issues Occur in Phase 3 (Route Protection):

**Quick Rollback:**
```php
// Comment out authorization checks
// abort_unless(auth()->user()->canWrite('vendors'), 403);
```

### If Database Issues Occur:

```bash
php artisan migrate:rollback --step=1
```

### If Frontend Breaks:

- Remove permissions from Inertia share
- Comment out permission checks in components

---

## Files Changed Summary

### Backend (Laravel)
| File | Type | Breaking? |
|------|------|-----------|
| `database/migrations/*_add_permissions_to_users_table.php` | New | No |
| `app/Models/User.php` | Modified | No |
| `app/Providers/AppServiceProvider.php` | Modified | No |
| `database/seeders/UserPermissionsSeeder.php` | New | No |
| `app/Http/Controllers/VendorController.php` | Modified | Yes* |
| `app/Http/Controllers/ProjectController.php` | Modified | Yes* |
| `app/Http/Controllers/PurchaseOrderController.php` | Modified | Yes* |
| `app/Http/Controllers/InvoiceController.php` | Modified | Yes* |
| `app/Http/Controllers/CheckRequisitionController.php` | Modified | Yes* |
| `app/Http/Controllers/DisbursementController.php` | Modified | Yes* |
| `app/Http/Middleware/HandleInertiaRequests.php` | Modified | No |

*Breaking only if user lacks permissions

### Frontend (React)
| File | Type | Breaking? |
|------|------|-----------|
| `resources/js/types/index.d.ts` | Modified | No |
| `resources/js/hooks/usePermissions.ts` | New | No |
| `resources/js/pages/Vendors/Index.tsx` | Modified | No |
| `resources/js/pages/Projects/Index.tsx` | Modified | No |
| `resources/js/pages/PurchaseOrders/Index.tsx` | Modified | No |
| `resources/js/pages/Invoices/Index.tsx` | Modified | No |
| `resources/js/pages/CheckRequisitions/Index.tsx` | Modified | No |
| `resources/js/pages/Disbursements/Index.tsx` | Modified | No |

---

## Estimated Timeline

| Phase | Duration | Risk Level |
|-------|----------|------------|
| Phase 1: Database | 30 min | Low |
| Phase 2: Backend Logic | 1 hour | Low |
| Phase 3: Route Protection | 2-3 hours | Medium |
| Phase 4: Frontend | 2-3 hours | Low |
| Phase 5: Seeding | 1 hour | Low |
| Phase 6: Testing | 2-3 hours | - |
| **Total** | **8-11 hours** | - |

---

## Success Criteria

- ✅ All 11 users can log in successfully
- ✅ Read permissions correctly restrict module viewing
- ✅ Write permissions correctly restrict create/edit/delete operations
- ✅ UI correctly hides/shows buttons based on permissions
- ✅ Unauthorized access returns 403 with clear error message
- ✅ No existing functionality broken for authorized users
- ✅ All tests pass

---

## Notes & Considerations

### Why Not Use Spatie Laravel-Permission?
- ✅ Overkill for 11 fixed users
- ✅ Adds complexity (roles, permissions, pivot tables)
- ✅ Our simple JSON approach is easier to understand and maintain

### Why JSON Column Instead of Pivot Table?
- ✅ Permissions won't change frequently (11 fixed users)
- ✅ Simpler queries (no joins needed)
- ✅ Easier to seed and modify
- ✅ Good enough for this use case

### Admin Override
- Consider adding: "Admin can do everything" rule
- Implement in `canRead()` and `canWrite()` methods:
  ```php
  public function canRead(string $module): bool
  {
      if ($this->isAdmin()) return true;
      return in_array($module, $this->permissions['read'] ?? []);
  }
  ```

### Future Enhancements (Out of Scope)
- Admin panel to manage user permissions (UI)
- Audit log for permission changes
- Role templates (e.g., "Accounting Manager" template)
- Dynamic module registration

---

## Questions to Resolve Before Implementation

1. ❓ Should admin users bypass all permission checks? (Recommended: Yes)
2. ❓ What should happen when a user has no permissions set (null)? (Recommended: No access)
3. ❓ Should we keep the old `role` enum column? (Recommended: Yes, for department tracking)
4. ❓ Should existing users get default permissions? (Recommended: Seed specific users only)
5. ❓ 403 error page style - redirect or show modal? (Recommended: 403 page with "Contact Admin")

---

**Ready to implement?** Follow phases 1-6 in order, testing after each step.
