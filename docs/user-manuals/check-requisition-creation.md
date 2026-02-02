# Check Requisition Creation

## Check Requisition Status Flow

**Draft** → **Pending Approval** → **Approved** → (Creates Disbursement)
                  ↓
            **Rejected** (back to editing)

- **Draft** - Work in progress. Can be edited and deleted. Invoices remain "Approved".
- **Pending Approval** - Submitted for management review. Cannot be edited. Invoices remain "Approved".
- **Approved** - Authorized for disbursement. Cannot be edited. Linked invoices move to "Pending Disbursement".
- **Rejected** - Returned for revision. Can be edited and resubmitted. Invoices remain "Approved".

**Payment Flow:**
Approved Invoices → Check Requisition → Disbursement → Payment

## Create Check Requisition

**Check Requisitions → Create Check Requisition**

## Select Approved Invoices

Only invoices with **Approved** status can be added to a check requisition.

**Steps:**
1. Browse paginated invoice list
2. Use filters (vendor, project, date range) to narrow down list
3. Select invoices via checkboxes
4. Review selected invoices total amount

> 💡 Group invoices from the same vendor or project for easier tracking and approval.

## Enter Requisition Details

**Auto-generated (Read-only):**
- Requisition Number
- PHP Amount (sum of selected invoices)
- PO/CER/SI Numbers (from selected invoices)

**Required:**
- Request Date *
- Payee Name *
- Purpose *
- Account Charge *
- Service Line Distribution *
- Amount in Words *
- Requested By * (person creating requisition)
- Reviewed By * (first level reviewer)
- Approved By * (final approver)

**Optional:**
- Remarks
- Supporting documents (max 10MB each)

> ⚠️ All three approval fields (Requested By, Reviewed By, Approved By) must be filled before submission.

## Save or Submit

**Save as Draft:**
- Status: Draft
- Can edit later
- Can delete if needed
- Invoices remain "Approved" status

**Submit for Approval:**
- Status: Pending Approval
- Cannot edit while pending
- All required fields must be filled
- Invoices remain "Approved" status

## Management Review

**Approver Actions:**
1. Review check requisition details
2. Verify invoices and amounts
3. Check approval authority

**Approve:**
- Status changes to: Approved
- Linked invoices move to: "Pending Disbursement"
- Next step: Disbursement creation

**Reject:**
- Status changes to: Rejected
- Rejection notes required
- Accounting staff notified
- Can edit and resubmit

## Examples

### Example 1: Single Vendor Payment

Payables staff groups all approved invoices from *Acme Supplies* for payment.

1. Navigate to **Check Requisitions → Create Check Requisition**
2. Filter: Vendor = *Acme Supplies*, Status = *Approved*
3. Select All (12 invoices totaling ₱450,000.00)
4. Enter Request Date: *Today*
5. Payee Name: *Acme Supplies*
6. Purpose: *Payment for January 2026 deliveries*
7. Account Charge: *5100-Operating Expenses*
8. Service Line Distribution: *Building Renovation - 100%*
9. Amount in Words: *Four Hundred Fifty Thousand Pesos Only*
10. Fill approval fields: Requested By, Reviewed By, Approved By
11. Submit for Approval
12. Requisition is now **Pending Approval**

### Example 2: Project-Based Payment

All approved invoices under *Building Renovation (CER-2026-001)* need payment.

1. Navigate to **Check Requisitions → Create Check Requisition**
2. Filter: Project = *CER-2026-001*, Status = *Approved*
3. Select invoices up to budget amount (8 invoices totaling ₱280,000.00)
4. Fill in requisition details
5. Purpose: *Building Renovation - Phase 1 completion*
6. Submit for Approval

### Example 3: Draft for Later Submission

Creating a requisition but not ready to submit yet.

1. Navigate to **Check Requisitions → Create Check Requisition**
2. Select invoices
3. Fill in partial details
4. Click **Save as Draft**
5. Complete details later and submit

## Validation

**Before submission:**
- At least 1 invoice selected
- All required fields filled
- Amount in words matches PHP amount
- Approval fields assigned
- Payee name matches vendor

**System checks:**
- Selected invoices are "Approved"
- No duplicate requisitions for same invoices
- Total amount is positive
- Request date is valid

## Quick Reference

| Task | Path |
|------|------|
| Create | Check Requisitions → Create Check Requisition |
| Edit | Check Requisitions → Click CR → Edit |
| View Details | Check Requisitions → Click CR |
| Submit for Approval | Edit → Submit for Approval |
| Approve/Reject | Check Requisitions → Click CR → Approve/Reject |

## Common Issues

- **Can't find invoices** - Check status filter is set to "Approved" only
- **Submit button disabled** - Fill all required fields including the three approval fields
- **Invoice already in requisition** - An invoice can only be in one active requisition at a time
- **Can't edit requisition** - Requisition is "Pending Approval". Contact admin to revert to "Draft"
- **Approval fields missing** - Assign users to approval roles or contact admin
- **Amount in words doesn't match** - Ensure the written amount matches the PHP amount exactly

## Status Reference

| Status | Can Edit? | Can Delete? | Invoice Status |
|--------|-----------|-------------|----------------|
| Draft | Yes | Yes | Approved |
| Pending Approval | No | No | Approved |
| Approved | No | No | Pending Disbursement |
| Rejected | Yes | Yes | Approved |

## Permissions

- View: Any user
- Create/Update: **Admin**, **Payables**
- Submit for Approval: **Admin**, **Payables**
- Approve/Reject: **Admin**, Management (as designated in approval fields)
- Delete: **Admin**, **Payables** (Draft or Rejected only)
