# Invoice Approval Workflow Guide

Review and approve invoices before payment processing.

## Status Flow

```
Pending → Received → Approved → Pending Disbursement → Paid
```

**Actions:**
- **Mark as Received** - Confirm documents received
- **Approve** - Authorize for payment
- **Reject** - Send back with reason

## Prerequisites

- Payables or Admin role
- Physical invoice documents from vendors
- Authority to approve invoices

## Steps

### 1. Access Bulk Review
Navigate to **Invoices** → **Bulk Review**

### 2. Filter Invoices

**Available Filters:**
- Search (SI or PO number)
- Vendor
- Purchase Order
- Status
- Date Range

Combine filters for precise results. Press Enter to apply.

### 3. Mark as Received

Use when physical documents are received from vendor.

**Bulk:**
1. Select invoices (checkbox or Select All)
2. Click "Mark as Received"
3. Confirm

**Individual:**
Click "Mark Received" button in Actions column

**Requirement:** Invoice status must be "Pending"

### 4. Review Details

Verify before approving:
- SI Number matches document
- Amount is correct
- Vendor is correct
- PO details match
- Files uploaded
- Dates are valid

Click invoice row to view full details.

### 5. Approve Invoices

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

### 6. Reject Invoices

**Reasons to reject:**
- Missing/incorrect documents
- Amount discrepancies
- Duplicate invoices
- Policy violations

**Process:**
1. Select invoices
2. Click "Bulk Reject"
3. Enter reason (required, minimum 10 characters)
4. Confirm

Status reverts to "Pending". Rejection reason visible to all users.

## Examples

**Monthly vendor review:**
1. Filter by vendor + date range + "Pending" status
2. Mark all as received
3. Verify files attached
4. Bulk approve

**Single PO approval:**
1. Filter by PO + "Received" status
2. Review invoices against PO
3. Bulk approve

**Selective rejection:**
1. Review invoices
2. Select problematic ones, bulk reject with reason
3. Select remaining, bulk approve

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Files not received error | Upload files to invoice first |
| Can't select invoice | Check status (Pending→Received→Approved) |
| Bulk Approve disabled | No invoices selected or mixed statuses |
| Invoice not in list | Clear all filters |
| Permission denied | Contact admin |

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

| Status | Mark Received? | Approve? | Reject? |
|--------|----------------|----------|---------|
| Pending | Yes | No | No |
| Received | No | Yes | Yes |
| Approved | No | No | No |
| Pending Disbursement | No | No | No |
| Paid | No | No | No |

Status moves forward only (except rejection reverts to Pending).

## Tips

- Use filters before bulk operations
- Process 20-50 invoices per batch
- "Select All" only selects current page
- Add meaningful rejection reasons
- Review activity log for audit trail (click invoice → Activity Log)

## FAQs

**Can I undo an approval?**
No. Contact admin to reverse.

**Can I approve without files?**
Depends on company policy.

**What happens to rejected invoices?**
Status reverts to "Pending" for correction.

**Can I edit invoice details?**
No. Only approve or reject. Submitter must edit.

**Can I filter by multiple vendors?**
No. One vendor at a time.

**Are rejection reasons visible to others?**
Yes, to all users who can view the invoice.
