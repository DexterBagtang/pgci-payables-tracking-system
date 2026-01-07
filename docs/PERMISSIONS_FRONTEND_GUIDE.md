# Frontend Permissions Implementation Guide

This guide shows how to implement permission checks in frontend components to conditionally show/hide action buttons based on user permissions.

## Quick Reference

The permission system uses the `usePermissions` hook from `@/hooks/use-permissions`:

```tsx
import { usePermissions } from '@/hooks/use-permissions';

const { canRead, canWrite, readableModules, writableModules } = usePermissions();
```

## Available Modules

- `vendors`
- `projects`
- `purchase_orders`
- `invoices`
- `invoice_review`
- `check_requisitions`
- `disbursements`

## Implementation Patterns

### Pattern 1: Hiding Create/Add Buttons

**Example: VendorsTable.jsx (lines 1-3, 39, 196-207)**

```tsx
import { usePermissions } from '@/hooks/use-permissions';

export default function VendorsTable({ vendors, filters, stats }) {
    const { canWrite } = usePermissions();

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Vendors Management</CardTitle>

                    {canWrite('vendors') && (
                        <AddVendorDialog
                            trigger={
                                <Button>
                                    <Plus className="h-4 w-4" />
                                    Add Vendor
                                </Button>
                            }
                        />
                    )}
                </div>
            </CardHeader>
        </Card>
    );
}
```

### Pattern 2: Hiding Edit Buttons in Row Actions

**Example: VendorRow.jsx (lines 5, 18, 184-197)**

```tsx
import { usePermissions } from '@/hooks/use-permissions';

export default function VendorRow({ vendor, isSelected, onSelect, onEdit }) {
    const { canWrite } = usePermissions();

    return (
        <tr>
            {/* ... other columns ... */}
            <td>
                <div className="flex gap-2">
                    <Button onClick={() => router.get(`/vendors/${vendor.id}`)}>
                        <Eye className="h-4 w-4" />
                    </Button>

                    {canWrite('vendors') && (
                        <Button onClick={(e) => {
                            e.stopPropagation();
                            onEdit(vendor);
                        }}>
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </td>
        </tr>
    );
}
```

### Pattern 3: Hiding Bulk Action Bars

**Example: BulkActionsBar.jsx (lines 9, 12, 14)**

```tsx
import { usePermissions } from '@/hooks/use-permissions';

export default function BulkActionsBar({ selectedCount, onActivate, onDeactivate, onDelete }) {
    const { canWrite } = usePermissions();

    // Hide the entire bulk actions bar if user can't write
    if (selectedCount === 0 || !canWrite('vendors')) return null;

    return (
        <div className="bulk-actions-container">
            {/* ... bulk action buttons ... */}
        </div>
    );
}
```

### Pattern 4: Conditional Rendering in Show/Detail Pages

```tsx
import { usePermissions } from '@/hooks/use-permissions';

export default function VendorShow({ vendor }) {
    const { canWrite } = usePermissions();

    return (
        <div>
            {/* View vendor details */}
            <VendorDetailsCard vendor={vendor} />

            {/* Only show edit/delete if user has write permission */}
            {canWrite('vendors') && (
                <div className="actions">
                    <Button onClick={() => handleEdit(vendor)}>Edit</Button>
                    <Button onClick={() => handleDelete(vendor)}>Delete</Button>
                </div>
            )}
        </div>
    );
}
```

### Pattern 5: Invoice Review Module (Special Case)

For invoice review operations, use the `invoice_review` module name:

```tsx
import { usePermissions } from '@/hooks/use-permissions';

export default function InvoiceReviewPanel({ invoices }) {
    const { canWrite } = usePermissions();

    return (
        <div>
            {canWrite('invoice_review') && (
                <>
                    <Button onClick={handleApprove}>Approve</Button>
                    <Button onClick={handleReject}>Reject</Button>
                    <Button onClick={handleBulkReview}>Bulk Review</Button>
                </>
            )}
        </div>
    );
}
```

## Module-Specific Examples

### Projects Module

```tsx
// ProjectsTable.tsx
const { canWrite } = usePermissions();

{canWrite('projects') && (
    <AddProjectDialog trigger={<Button>Add Project</Button>} />
)}
```

### Purchase Orders Module

```tsx
// PurchaseOrderTable.tsx
const { canWrite } = usePermissions();

{canWrite('purchase_orders') && (
    <>
        <AddPurchaseOrderDialog />
        <ClosePurchaseOrderDialog />
    </>
)}
```

### Invoices Module

```tsx
// InvoicesTable.tsx
const { canWrite } = usePermissions();

{canWrite('invoices') && (
    <CreateInvoiceDialog trigger={<Button>Create Invoice</Button>} />
)}
```

### Check Requisitions Module

```tsx
// CheckReqTable.tsx
const { canWrite } = usePermissions();

{canWrite('check_requisitions') && (
    <>
        <Button onClick={handleApprove}>Approve</Button>
        <Button onClick={handleEdit}>Edit</Button>
    </>
)}
```

### Disbursements Module

```tsx
// DisbursementsTable.tsx
const { canWrite } = usePermissions();

{canWrite('disbursements') && (
    <>
        <QuickReleaseModal />
        <BulkReleaseModal />
        <EditDisbursementForm />
    </>
)}
```

## Common Mistakes to Avoid

### ❌ DON'T: Check permissions on backend operations only

```tsx
// This will show the button but fail on click with 403 error
<Button onClick={handleCreate}>Create Vendor</Button>
```

### ✅ DO: Hide the button if user lacks permissions

```tsx
{canWrite('vendors') && (
    <Button onClick={handleCreate}>Create Vendor</Button>
)}
```

### ❌ DON'T: Use role-based checks

```tsx
// Don't check user.role directly
{user.role === 'admin' && <Button>Delete</Button>}
```

### ✅ DO: Use permission hooks

```tsx
// Use canWrite instead
{canWrite('vendors') && <Button>Delete</Button>}
```

### ❌ DON'T: Hardcode module names incorrectly

```tsx
// Wrong module name - 'review' doesn't exist
{canWrite('review') && <Button>Approve Invoice</Button>}
```

### ✅ DO: Use correct module names

```tsx
// Correct module name for invoice review
{canWrite('invoice_review') && <Button>Approve Invoice</Button>}
```

## Testing Your Implementation

1. **Test with different users:**
   - Login as MGU (read-only) - should not see any Create/Edit/Delete buttons
   - Login as MCZ (can write vendors/projects/POs) - should see buttons for those modules
   - Login as KAU (can write invoice_review/check_requisitions) - should see buttons for those modules

2. **Verify navigation:**
   - Users without read permission should not see modules in sidebar
   - Directly accessing URLs should return 403 error

3. **Check console for errors:**
   - No TypeScript errors about missing modules
   - usePermissions hook works without errors

## Backend Protection

Remember: Frontend checks are for UX only. Backend authorization in controllers is the actual security:

```php
// Controller method
public function store(Request $request)
{
    abort_unless(auth()->user()->canWrite('vendors'), 403);
    // ... create vendor
}
```

The frontend permission checks prevent users from seeing buttons they can't use, providing a better user experience.

## Files Modified in Example Implementation

1. `resources/js/pages/vendors/components/VendorsTable.jsx` - Added canWrite check for Add button
2. `resources/js/pages/vendors/components/VendorRow.jsx` - Added canWrite check for Edit button
3. `resources/js/pages/vendors/components/BulkActionsBar.jsx` - Hide entire bar without write permission

## Next Steps

Apply the same patterns to:

- `resources/js/pages/projects/**/*.tsx`
- `resources/js/pages/purchase-orders/**/*.tsx`
- `resources/js/pages/invoices/**/*.tsx`
- `resources/js/pages/check-requisitions/**/*.tsx`
- `resources/js/pages/disbursements/**/*.tsx`

Each module follows the same pattern - just change the module name in `canWrite('module_name')`.
