# Direct Invoice Feature

**Last Updated**: 2026-01-22
**Status**: ✅ Implemented and Tested

## Overview

The Direct Invoice feature allows users to create invoices without requiring a Purchase Order (PO). This is useful for:
- Small purchases under approval thresholds
- Emergency or urgent payments
- Vendor services not requiring formal POs
- Direct billing scenarios

## Business Rules

### Invoice Types

The system now supports two invoice types:

1. **Purchase Order Invoice** (`purchase_order`)
   - Linked to an existing Purchase Order
   - Vendor and Project inherited from PO
   - Currency must match PO currency
   - Affects PO financial summaries

2. **Direct Invoice** (`direct`)
   - Created without a Purchase Order
   - Vendor is REQUIRED
   - Project is OPTIONAL
   - Currency can be any supported currency (PHP, USD)
   - Does NOT affect PO financial summaries

### Field Requirements

| Field | PO Invoice | Direct Invoice |
|-------|-----------|----------------|
| `invoice_type` | Required: `purchase_order` | Required: `direct` |
| `purchase_order_id` | Required | Must be NULL |
| `vendor_id` | Must be NULL | Required |
| `project_id` | Must be NULL | Optional |
| `currency` | Must match PO currency | Any (PHP, USD) |

### Validation Rules

1. **Mutual Exclusivity**: An invoice cannot have both `purchase_order_id` and `vendor_id` set
2. **SI Number Uniqueness**: SI numbers must be unique per vendor across BOTH invoice types
3. **Type Immutability**: Invoice type should not be changed after creation (enforced in UI)

## Database Schema

### Table: `invoices`

```sql
-- Type discriminator
invoice_type ENUM('purchase_order', 'direct') DEFAULT 'purchase_order'

-- PO-based invoice fields
purchase_order_id INT NULL REFERENCES purchase_orders(id)

-- Direct invoice fields
vendor_id INT NULL REFERENCES vendors(id) ON DELETE SET NULL
project_id INT NULL REFERENCES projects(id) ON DELETE SET NULL

-- Indexes for performance
INDEX idx_invoice_type (invoice_type)
INDEX idx_vendor_id (vendor_id)
INDEX idx_project_id (project_id)
```

## Backend Implementation

### Models

**File**: `app/Models/Invoice.php`

#### Relationships

```php
// Direct invoice relationships
public function directVendor() {
    return $this->belongsTo(Vendor::class, 'vendor_id');
}

public function directProject() {
    return $this->belongsTo(Project::class, 'project_id');
}

// Smart conditional relationships
public function vendor() {
    // Returns directVendor OR vendor through PO based on invoice_type
}

public function project() {
    // Returns directProject OR project through PO based on invoice_type
}
```

#### Scopes

```php
// Filter by invoice type
Invoice::directInvoices()->get();
Invoice::purchaseOrderInvoices()->get();

// Search by vendor (works for both types)
Invoice::byVendor($vendorId)->get();
```

### Controllers

**File**: `app/Http/Controllers/InvoiceController.php`

All controller methods now:
- Return `vendors` and `projects` arrays for direct invoice creation
- Eager load `directVendor` and `directProject` relationships
- Handle filtering/searching for both invoice types

### Validation

**Files**:
- `app/Http/Requests/Invoice/StoreInvoiceRequest.php`
- `app/Http/Requests/Invoice/UpdateInvoiceRequest.php`

Conditional validation based on `invoice_type`:

```php
'invoice_type' => 'required|in:purchase_order,direct',

// For PO invoices
'purchase_order_id' => 'required_if:invoice_type,purchase_order',

// For direct invoices
'vendor_id' => 'required_if:invoice_type,direct',
'project_id' => 'nullable', // Always optional
```

### Observers

**File**: `app/Observers/InvoiceObserver.php`

```php
// Only syncs PO financials for PO-based invoices
if ($invoice->invoice_type === 'purchase_order') {
    $invoice->purchaseOrder->syncFinancials();
}
```

## Frontend Implementation

### Components

#### Invoice Type Selector
**File**: `resources/js/pages/invoices/components/create/InvoiceTypeSelector.tsx`

Radio button selector for choosing invoice type.

#### Direct Vendor/Project Selector
**File**: `resources/js/pages/invoices/components/create/DirectVendorProjectSelector.tsx`

- Vendor dropdown (required)
- Project dropdown (optional, includes "No Project" option)

### Pages

All invoice pages support both types:

1. **Create Single** (`resources/js/pages/invoices/components/CreateSingleInvoice.jsx`)
   - Type selector at top
   - Conditional rendering: PO selector OR vendor/project selectors
   - Form clears opposite fields when switching types

2. **Create Bulk** (`resources/js/pages/invoices/components/CreateBulkInvoice.jsx`)
   - Shared invoice type configuration
   - Conditional table columns based on type
   - Row-level vendor/project selection for direct invoices

3. **Edit** (`resources/js/pages/invoices/components/EditInvoice.jsx`)
   - Supports editing both types
   - Type selector (consider disabling to prevent type changes)

4. **Show** (`resources/js/pages/invoices/components/ShowInvoice.jsx`)
   - Conditional display: shows PO info OR vendor/project info
   - "Direct Invoice" badge for direct type

5. **Index** (`resources/js/pages/invoices/components/InvoicesTable.jsx`)
   - Helper functions to get vendor/project from either source
   - "Direct" badge on direct invoices

6. **Bulk Review** (`resources/js/pages/invoices/components/BulkInvoiceList.jsx`)
   - Displays vendor name from either source
   - "Direct Invoice" indicator line

## Check Requisition Integration

**Files**:
- `app/Http/Controllers/CheckRequisitionController.php`
- `resources/js/pages/invoices/components/CheckRequisitionFormNew.jsx`
- `resources/js/pages/invoices/components/CheckRequisitionInvoiceList.jsx`

### Backend Changes

All queries now eager load:
```php
->with([
    'purchaseOrder.vendor',
    'purchaseOrder.project',
    'directVendor',
    'directProject'
])
```

Vendor filtering handles both types:
```php
->where(function ($q) use ($vendorId) {
    $q->whereHas('purchaseOrder', fn($pq) => $pq->where('vendor_id', $vendorId))
      ->orWhere(function ($dq) use ($vendorId) {
          $dq->where('invoice_type', 'direct')->where('vendor_id', $vendorId);
      });
});
```

### Frontend Changes

Helper functions extract vendor/project from either source:

```javascript
const getVendorName = (invoice) => {
    return invoice.invoice_type === 'direct'
        ? invoice.direct_vendor?.name
        : invoice.purchase_order?.vendor?.name;
};
```

## Testing

**File**: `tests/Feature/InvoiceManagementTest.php`

### Test Coverage

- ✅ Create single PO-based invoice
- ✅ Create single direct invoice with vendor
- ✅ Create multiple PO-based invoices in bulk
- ✅ Create multiple direct invoices in bulk
- ✅ Direct invoice with project
- ✅ Direct invoice without project
- ✅ Validate invoice_type is required
- ✅ Validate purchase_order_id required for PO invoices
- ✅ Validate vendor_id required for direct invoices
- ✅ Validate mutual exclusivity (no PO + vendor_id)
- ✅ Validate SI number uniqueness per vendor
- ✅ Validate currency matching for PO invoices
- ✅ Direct invoice currency flexibility
- ✅ Edit direct invoice

## Usage Examples

### Creating a Direct Invoice (Single Mode)

1. Navigate to **Invoices > Create**
2. Select **"Direct Invoice"** from the invoice type selector
3. Choose a **Vendor** (required)
4. Optionally choose a **Project**
5. Fill in invoice details (SI number, amount, dates, etc.)
6. Upload supporting documents
7. Click **"Preview & Submit"**

### Creating Direct Invoices (Bulk Mode)

1. Navigate to **Invoices > Bulk Create**
2. Select **"Direct Invoice"** in Bulk Configuration
3. Choose shared settings:
   - Shared Vendor (recommended)
   - Shared Project (optional)
   - Other shared fields
4. Add multiple invoice rows
5. For each row, fill in unique details
6. Upload files (auto-matched or manually assigned)
7. Click **"Preview & Submit"**

### Creating a Check Requisition with Direct Invoices

1. Navigate to **Check Requisitions > Create**
2. Filter by **Vendor** to find both PO and direct invoices
3. Select invoices (can mix PO and direct invoices)
4. The system automatically:
   - Detects vendor from either source
   - Handles payee name appropriately
   - Shows "No PO" for direct invoices in confirmation

## Migration Notes

### Existing Data

If you have existing invoices before this feature:

1. All existing invoices have `invoice_type = 'purchase_order'`
2. All existing invoices have `vendor_id = NULL` and `project_id = NULL`
3. No data migration required

### Backfilling (if needed)

```php
// If you have orphaned invoices without POs, convert them to direct:
Invoice::whereNull('purchase_order_id')
    ->whereNotNull('some_vendor_reference')
    ->update([
        'invoice_type' => 'direct',
        'vendor_id' => // derive from your data
    ]);
```

## Edge Cases & Considerations

### 1. Vendor Deletion
- Foreign key is `ON DELETE SET NULL`
- If vendor is deleted, `vendor_id` becomes NULL
- Consider adding `ON DELETE RESTRICT` for active invoices

### 2. Project Deletion
- Same as vendor deletion
- Invoice remains valid even if project is deleted

### 3. Currency Handling
- Direct invoices can use any currency
- PO invoices must match PO currency
- This is intentional for flexibility

### 4. Financial Reporting
- Direct invoices do NOT affect PO financial summaries
- Track direct invoices separately in reports

### 5. Type Switching
- Recommend disabling invoice type changes after creation
- If allowed, implement proper cleanup of opposite fields

## Future Enhancements

Potential improvements to consider:

1. **Approval Workflows**: Different approval paths for direct vs PO invoices
2. **Budget Tracking**: Track direct invoice spending against department budgets
3. **Reporting**: Dedicated reports for direct invoice analysis
4. **Limits**: Enforce maximum amounts for direct invoices
5. **Categories**: Add categories for direct invoices (utilities, services, etc.)

## Troubleshooting

### Issue: Vendor not showing in dropdown
**Solution**: Check that vendor is active (`is_active = true`)

### Issue: SI number duplicate error
**Solution**: SI numbers must be unique per vendor across both invoice types

### Issue: Currency mismatch error
**Solution**: Only applies to PO invoices. Direct invoices can use any currency.

### Issue: Can't create check requisition
**Solution**: Ensure invoices are "approved" status. Direct invoices follow same workflow as PO invoices.

## Support

For questions or issues:
- Check this documentation
- Review test cases in `tests/Feature/InvoiceManagementTest.php`
- Examine code examples in controller and components

---

**Implementation Date**: January 2026
**Contributors**: Claude Sonnet 4.5
**Version**: 1.0
