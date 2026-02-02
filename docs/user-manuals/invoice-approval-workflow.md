# Invoice Approval Workflow

## Invoice Status Flow

**Pending** → **Received** → **Approved** → **Pending Disbursement** → **Paid**

[//]: # (                  ↓)

[//]: # (            **Rejected** &#40;requires manual resubmission&#41;)

**Primary Statuses:**
- **Pending** - Invoice created but not yet received. Can be marked as received.
- **Received** - Physical documents received from vendor. Ready for approval or rejection.
- **Approved** - Authorized for payment. Can be added to check requisitions.
- **Pending Disbursement** - Included in an approved check requisition. Awaiting disbursement creation.
- **Paid** - Payment completed via disbursement. Final status.
- **Rejected** - Invoice rejected during review. Requires correction and manual status reset to resume workflow.

**System Statuses (Automated):**
- **In Progress** - Reserved for future use (currently not in active workflow).
- **Overdue** - Automatically marked when invoice passes due date without payment.

**Key Actions:**
- **Mark as Received** - Confirm physical documents received from vendor (Pending → Received)
- **Approve** - Authorize invoice for payment processing (Received → Approved)
- **Reject** - Mark invoice as rejected with reason (Received → Rejected)
- **Add to Check Requisition** - Automatically moves to Pending Disbursement (Approved → Pending Disbursement)
- **Complete Disbursement** - Automatically marks as Paid (Pending Disbursement → Paid)

## Access Bulk Review

**Review**

## Filter Invoices

Combine filters for precise results. Press Enter to apply.

**Available Filters:**
- Search (SI or PO number)
- Vendor
- Purchase Order
- Status
- Date Range

## Mark as Received

Use when physical documents are received from vendor.

**Bulk Operation:**
1. Select invoices (checkbox or Select All)
2. Click "Mark as Received"
3. Confirm

**Individual Operation:**
Click "Mark Received" button in Actions column

> 💡 Use filters to show only **Pending** invoices before bulk marking as received.

## Review Invoice Details

Click invoice row to view full details and verify:
- SI Number matches physical document
- Amount is correct
- Vendor is correct
- PO details match
- Files uploaded
- Dates are valid

## Approve Invoices

**Bulk Approve:**
1. Filter by "Received" status
2. Select invoices
3. Click "Bulk Approve"
4. Add notes (optional)
5. Confirm

**Individual Approve:**
Click "Approve" button in Actions column

**Requirements:**
- Status must be "Received"
- Files uploaded (if required by policy)
- Max 500 invoices per operation

> 💡 Filter by vendor and date range to approve invoices in batches of 20-50 for optimal performance.

## Reject Invoices

**Common Rejection Reasons:**
- Missing or incorrect documents
- Amount discrepancies
- Duplicate invoices
- Policy violations
- Incomplete information

**Steps:**
1. Select invoices
2. Click "Bulk Reject"
3. Enter rejection reason (required, minimum 10 characters)
4. Confirm

⚠️ **Important**: Status changes to **Rejected** (not back to Pending). The invoice remains in rejected status until:
- An administrator manually resets the status back to Pending after issues are resolved
- The vendor submits corrected documents and accounting staff updates the invoice

Rejection reason is visible to all users and logged in the activity trail with "REJECTION:" prefix.

## Examples

### Example 1: Monthly Vendor Review

A Payables staff member processes all invoices from *Acme Supplies* received in January 2026.

1. Navigate to **Invoices → Bulk Review**
2. Filter: Vendor = *Acme Supplies*, Date Range = *January 1-31, 2026*, Status = *Pending*
3. Select All (15 invoices)
4. Click **Mark as Received**
5. Filter: Status = *Received*
6. Verify all invoices have files attached
7. Select All → Click **Bulk Approve**
8. All 15 invoices are now **Approved** and ready for check requisition

### Example 2: Single PO Approval

All invoices under `PO-2026-0042` have been received and need approval.

1. Navigate to **Invoices → Bulk Review**
2. Filter: PO = `PO-2026-0042`, Status = *Received*
3. Review each invoice against PO details
4. Select All (8 invoices)
5. Click **Bulk Approve**
6. All 8 invoices are now **Approved**

### Example 3: Selective Rejection

Reviewing 20 invoices, 3 have missing documentation.

1. Navigate to **Invoices → Bulk Review**
2. Filter: Status = *Received*
3. Review invoices and identify 3 with missing files
4. Select the 3 problematic invoices → Click **Bulk Reject**
5. Enter reason: *Missing supporting documents - please upload and resubmit*
6. Select remaining 17 invoices → Click **Bulk Approve**
7. **Result**: Rejected invoices are now **Rejected** status; approved invoices move to **Approved**
8. Vendor provides missing documents → Admin resets rejected invoices to **Pending** → Resume workflow

## Quick Reference

| Task | Path |
|------|------|
| Access Bulk Review | Invoices → Bulk Review |
| Mark as Received | Select invoices → Mark as Received |
| Approve | Select invoices → Bulk Approve |
| Reject | Select invoices → Bulk Reject |
| View Details | Click invoice row |

## Common Issues

- **Files not received error** - Upload files to invoice first before approving
- **Can't select invoice** - Check status matches the required status (Pending→Received→Approved)
- **Bulk Approve disabled** - No invoices selected or mixed statuses selected
- **Invoice not in list** - Clear all filters and search again
- **Permission denied** - Contact admin for Payables or Admin role

## Validation

**Mark as Received:**
- Status must be "Pending"

**Approve:**
- Status must be "Received"
- Files uploaded (if required)
- All required fields filled

**Reject:**
- Rejection reason required (min 10 characters)

## Bulk Operations

**Selection:**
- "Select All" selects current page only
- Increase page size (10/25/50/100/250/500) to select more
- Max 500 invoices per operation
- Recommended: 50-100 per batch

## Status Reference

| Status | Mark Received? | Approve? | Reject? | Can Edit? | Next Status |
|--------|----------------|----------|---------|-----------|-------------|
| Pending | Yes | No | No | Yes | Received |
| Received | No | Yes | Yes | Yes | Approved/Rejected |
| Approved | No | No | No | No | Pending Disbursement |
| Rejected | No | No | No | Yes* | Pending (manual reset) |
| Pending Disbursement | No | No | No | No | Paid |
| Paid | No | No | No | No | Final Status |
| In Progress | - | - | - | - | Reserved (not used) |
| Overdue | - | - | - | - | System-assigned |

**Notes:**
- Status moves forward only through the approval workflow
- Rejected invoices require manual administrator intervention to re-enter workflow
- Overdue status is automatically assigned based on due_date
- (*) Rejected invoices can be edited and require admin to reset status to Pending

## Status Transitions

**Valid Transitions:**
```
Pending → Received (via "Mark as Received")
Received → Approved (via "Approve")
Received → Rejected (via "Reject")
Approved → Pending Disbursement (automatic when added to Check Requisition)
Pending Disbursement → Paid (automatic when Disbursement is completed)
Rejected → Pending (manual admin reset after corrections)
```

**Invalid Transitions (System Prevented):**
- Cannot approve Pending invoices (must mark as Received first)
- Cannot mark Approved/Paid invoices as Received
- Cannot reject Approved invoices (check requisition must be rejected instead)
- Cannot edit Approved, Pending Disbursement, or Paid invoices

## Tips

- Use filters before bulk operations
- Process 20-50 invoices per batch
- "Select All" only selects current page
- Add meaningful rejection reasons (minimum 10 characters)
- Review activity log for audit trail (click invoice → Activity Log)
- Rejected invoices cannot automatically re-enter workflow - contact administrator

## Permissions

- View Invoices: Any user
- Mark as Received: **Admin**, **Payables**
- Approve: **Admin**, **Payables**
- Reject: **Admin**, **Payables**
