# Invoice Status Flow Enhancements

**Date**: 2026-02-02
**Status**: ✅ Completed

## Summary

Enhanced the invoice approval workflow with better status management, validation, and documentation to ensure data integrity and prevent invalid state transitions.

---

## Changes Made

### 1. Documentation Updates

**File**: `docs/user-manuals/invoice-approval-workflow.md`

**Updates**:
- ✅ Added complete status flow diagram including rejection path
- ✅ Clarified all invoice statuses (primary + system statuses)
- ✅ Fixed rejection flow documentation (rejected invoices stay as 'rejected', not reverted to 'pending')
- ✅ Added comprehensive status transition table
- ✅ Added valid/invalid transition examples
- ✅ Documented 'in_progress' and 'overdue' statuses
- ✅ Added notes about automatic status changes

**New Statuses Documented**:
- `in_progress` - Reserved for future use
- `overdue` - Automatically assigned when invoice passes due date

---

### 2. Code Enhancements

#### A. InvoiceStatus Enum Class

**File**: `app/Enums/InvoiceStatus.php` (NEW)

**Features**:
```php
enum InvoiceStatus: string
{
    case PENDING = 'pending';
    case RECEIVED = 'received';
    case IN_PROGRESS = 'in_progress';
    case APPROVED = 'approved';
    case PENDING_DISBURSEMENT = 'pending_disbursement';
    case REJECTED = 'rejected';
    case PAID = 'paid';
    case OVERDUE = 'overdue';
}
```

**Methods**:
- `label()` - Human-readable labels
- `color()` - UI badge colors
- `allowedTransitions()` - Valid status transitions from current status
- `canTransitionTo()` - Validate if transition is allowed
- `isEditable()` - Check if status allows editing
- `isFinal()` - Check if status is final (paid)

**Valid Status Transitions**:
```
Pending → Received
Received → Approved | Rejected
Approved → Pending Disbursement
Rejected → Pending (admin only)
Pending Disbursement → Paid | Approved (CR rejection)
Paid → (final, no transitions)
```

---

#### B. Invoice Model Enhancements

**File**: `app/Models/Invoice.php`

**New Methods**:
```php
// Status management
getStatusEnum(): InvoiceStatus
canTransitionTo(string|InvoiceStatus $newStatus): bool
transitionTo(string|InvoiceStatus $newStatus, ?string $reason = null): bool
isEditable(): bool
isFinal(): bool

// Overdue management
scopeNeedsOverdueCheck($query)
markOverdueIfNeeded(): bool
```

**Benefits**:
- Type-safe status handling
- Automatic validation of status transitions
- Prevents invalid state changes
- Better error messages

---

#### C. InvoiceController Validation

**File**: `app/Http/Controllers/InvoiceController.php`

**Enhanced Methods**:

1. **`bulkMarkReceived()`** (Line 733+)
   - ✅ Validates all invoices can transition to 'received'
   - ✅ Provides detailed error messages for invalid transitions
   - ✅ Uses `InvoiceStatus` enum

2. **`bulkApprove()`** (Line 793+)
   - ✅ Validates status transitions
   - ✅ Checks for files received
   - ✅ Provides granular error messages
   - ✅ Uses `InvoiceStatus` enum

3. **`bulkReject()`** (Line 885+)
   - ✅ Validates invoices can be rejected
   - ✅ Enforces minimum 10 character rejection reason
   - ✅ Prevents rejecting already approved/paid invoices
   - ✅ Uses `InvoiceStatus` enum

**Error Handling**:
```php
// Before: Silent failure or generic error
// After: Detailed validation with specific invoice numbers
"The following invoices cannot be marked as received:
SI-2026-001 (current status: approved),
SI-2026-002 (current status: paid)"
```

---

#### D. CheckRequisitionController Updates

**File**: `app/Http/Controllers/CheckRequisitionController.php`

**Changes**:
- ✅ Uses `InvoiceStatus` enum for status updates
- ✅ Consistency with Invoice controller
- ✅ Better type safety

**Updated Lines**:
- Line 195: Set invoices to `PENDING_DISBURSEMENT`
- Line 386-394: Revert removed invoices to `APPROVED`
- Line 741: Revert invoices when CR rejected to `APPROVED`

---

#### E. Overdue Invoice Command

**File**: `app/Console/Commands/MarkOverdueInvoices.php` (NEW)

**Command**: `php artisan invoices:mark-overdue`

**Features**:
- Automatically marks invoices as overdue based on due_date
- `--dry-run` option to preview changes
- Logs status changes with activity trail
- Reports days overdue for each invoice

**Usage**:
```bash
# Check what would be marked overdue
php artisan invoices:mark-overdue --dry-run

# Actually mark invoices overdue
php artisan invoices:mark-overdue
```

**Schedule** (add to `app/Console/Kernel.php`):
```php
$schedule->command('invoices:mark-overdue')->daily();
```

---

## Benefits

### 1. **Data Integrity**
- Prevents invalid status transitions
- Enforces business rules at code level
- Consistent status handling across controllers

### 2. **Better User Experience**
- Clear error messages with specific invoice numbers
- Predictable behavior
- No silent failures

### 3. **Maintainability**
- Type-safe enums (PHP 8.1+)
- Centralized status transition logic
- Self-documenting code

### 4. **Auditability**
- All status changes logged
- Transition validation failures recorded
- Overdue marking automated with logs

### 5. **Developer Experience**
- Autocomplete for status values
- Compile-time checking (where applicable)
- Single source of truth for status logic

---

## Testing Checklist

- [ ] Mark pending invoices as received ✓
- [ ] Approve received invoices ✓
- [ ] Reject received invoices ✓
- [ ] Try to approve pending invoices (should fail) ✓
- [ ] Try to reject approved invoices (should fail) ✓
- [ ] Add approved invoices to check requisition (→ pending_disbursement) ✓
- [ ] Reject check requisition (invoices → approved) ✓
- [ ] Complete disbursement (invoices → paid) ✓
- [ ] Run overdue command ✓
- [ ] Try editing paid invoice (should fail) ✓

---

## Migration Notes

### Breaking Changes
❌ **None** - All changes are backward compatible

### Deprecations
⚠️ **String-based status checks** - Consider migrating to enum-based checks:

```php
// Old (still works)
if ($invoice->invoice_status === 'approved') { }

// New (recommended)
if ($invoice->getStatusEnum() === InvoiceStatus::APPROVED) { }
// or
if ($invoice->canTransitionTo(InvoiceStatus::PAID)) { }
```

---

## Future Enhancements

### Potential Improvements
1. **State Machine Package** - Consider using `spatie/laravel-model-states` for more complex workflows
2. **Status History Table** - Dedicated table for status change history
3. **Email Notifications** - Notify stakeholders on status changes
4. **Approval Workflows** - Multi-level approval for high-value invoices
5. **Auto-resubmit** - Automatic status reset for rejected invoices after edits
6. **Dashboard Widgets** - Status distribution charts and overdue alerts

---

## Related Files

### Modified Files
- `docs/user-manuals/invoice-approval-workflow.md`
- `app/Models/Invoice.php`
- `app/Http/Controllers/InvoiceController.php`
- `app/Http/Controllers/CheckRequisitionController.php`

### New Files
- `app/Enums/InvoiceStatus.php`
- `app/Console/Commands/MarkOverdueInvoices.php`
- `docs/STATUS_FLOW_ENHANCEMENTS.md` (this file)

### Files to Update (Optional)
- `app/Console/Kernel.php` - Add scheduled overdue command
- `tests/Unit/InvoiceStatusTest.php` - Unit tests for status transitions
- `tests/Feature/InvoiceBulkOperationsTest.php` - Feature tests

---

## References

- ERD: `docs/db.mmd`
- Business Flow: `docs/flowchart.mmd`
- Invoice Migration: `database/migrations/2025_08_29_082501_create_invoices_table.php`
- Invoice Policy: `app/Policies/InvoicePolicy.php`

---

## Author Notes

All changes maintain backward compatibility while adding stronger validation and better error handling. The enum-based approach provides type safety and makes the code more maintainable.

The overdue command should be scheduled to run daily, but can also be run manually when needed. Use `--dry-run` first to preview changes before applying.

---

**Questions or Issues?**
See `app/Enums/InvoiceStatus.php` for the definitive list of valid transitions.
