# Check Requisition Creation Guide

Group approved invoices into payment requests for management approval.

## Status Flow

```
Draft → Pending Approval → Approved → (Creates Disbursement)
                ↓
            Rejected (back to editing)
```

**What happens:**
- Approved invoices → Check Requisition → Disbursement → Payment

## Prerequisites

- Accounting or Admin role
- Approved invoices ready for payment
- Payment approval authority structure

## Steps

### 1. Access Check Requisition

Navigate to **Check Requisitions** → **Create Check Requisition**

### 2. Select Approved Invoices

**Selection criteria:**
- Invoices must have "Approved" status
- Typically from same vendor or project
- Use filters to narrow down list

**Process:**
1. Browse paginated invoice list
2. Use filters (vendor, project, date range)
3. Select invoices via checkboxes
4. Selected invoices show total amount

### 3. Enter Requisition Details

**Auto-generated:**
- Requisition Number (system-generated)
- PHP Amount (sum of selected invoices)

**Required fields:**
- **Request Date** - Date of requisition
- **Payee Name** - Who receives the payment
- **Purpose** - Reason for payment
- **PO/CER/SI Numbers** - Reference numbers (auto-populated from invoices)
- **Account Charge** - Accounting code
- **Service Line Distribution** - Cost allocation
- **Amount in Words** - Written amount for check

**Optional:**
- Remarks
- Supporting documents

### 4. Fill Approval Fields

**Required signatures:**
- **Requested By** - Person creating requisition
- **Reviewed By** - First level reviewer
- **Approved By** - Final approver

These fields determine approval routing.

### 5. Save or Submit

**Save as Draft:**
- Status: Draft
- Can edit later
- Invoices remain "Approved" status

**Submit for Approval:**
- Status: Pending Approval
- Cannot edit while pending
- Invoices remain "Approved" status

### 6. Management Review

**Approver actions:**
1. Review check requisition details
2. Verify invoices and amounts
3. Check approval authority

**Approve:**
- Status: Approved
- Linked invoices → "Pending Disbursement"
- Ready for disbursement creation

**Reject:**
- Status: Rejected
- Add rejection notes (required)
- Accounting notified
- Can edit and resubmit

## Examples

**Single vendor payment:**
1. Filter by vendor + "Approved" status
2. Select all invoices for that vendor
3. Enter requisition details
4. Submit for approval

**Project-based payment:**
1. Filter by project + "Approved" status
2. Select invoices up to budget amount
3. Enter requisition details
4. Submit for approval

**Partial payment:**
1. Select specific invoices from various vendors
2. Group by payment priority
3. Create separate requisitions per vendor

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

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't find invoices | Check status filter (must be "Approved") |
| Submit button disabled | Fill all required fields and approval fields |
| Invoice already in requisition | Invoice can only be in one active requisition |
| Can't edit requisition | Change status from "Pending Approval" to "Draft" (admin) |
| Approval fields missing | Assign users to approval roles |

## Status Reference

| Status | Can Edit? | Can Delete? | Invoice Status |
|--------|-----------|-------------|----------------|
| Draft | Yes | Yes | Approved |
| Pending Approval | No | No | Approved |
| Approved | No | No | Pending Disbursement |
| Rejected | Yes | Yes | Approved |

## Tips

- Group invoices by vendor for easier tracking
- Use clear, descriptive purposes
- Double-check amount in words before submission
- Keep requisitions under 20 invoices for manageable review
- Add remarks for special payment instructions
- Review PO/CER/SI numbers for accuracy

## FAQs

**Can I add more invoices after creating the requisition?**
Yes, if status is "Draft". Edit and add more invoices.

**Can I remove invoices from a requisition?**
Yes, if status is "Draft" or "Rejected".

**What if I submitted by mistake?**
Contact admin to revert to "Draft" status.

**Can invoices be in multiple requisitions?**
No. One invoice = one requisition at a time.

**What happens if requisition is rejected?**
Status reverts to "Rejected", invoices stay "Approved", you can edit and resubmit.

**Can I delete a requisition?**
Yes, if status is "Draft" or "Rejected". Approved requisitions cannot be deleted.

**Do all approval fields need to be filled?**
Yes. System requires all three approval fields before submission.

**Can I change the requisition number?**
No. System auto-generates and it's immutable.
