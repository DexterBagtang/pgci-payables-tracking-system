# Invoice Approval Workflow Guide

**PGCI Payables System** | Quick Reference Guide

---

## What is Invoice Approval?

Review and approve invoices in bulk before they can be processed for payment. This is a critical quality control step where you verify invoice details, confirm document completeness, and authorize payment.

**Time Savings**: Review and approve 100 invoices in 20 minutes instead of 2+ hours.

---

## Invoice Status Flow

```
Pending → Received → Approved → Pending Disbursement → Paid
```

**Your Actions:**
1. **Mark as "Received"** - Confirm physical documents received
2. **Approve** - Authorize for payment
3. **Reject** - Send back with reason

---

## Before You Start

**Your Role:** Must be **Payables** or **Admin** user

**What You Need:**
- ✅ Physical invoice documents (SI) from vendors
- ✅ Supporting documents (delivery receipts, PO attachments)
- ✅ Authority to approve invoices

---

## Quick Start Guide

### Step 1: Access Bulk Review

1. Go to **Invoices** → **Bulk Review**
2. Or click **"Bulk Review"** button on Invoices list page

**What you'll see:**
- List of all invoices pending review
- Advanced filters at the top
- Bulk action buttons
- Pagination controls

---

### Step 2: Filter Invoices for Review

Use filters to narrow down invoices:

**Common Filters:**

| Filter | Use Case | Example |
|--------|----------|---------|
| **Search** | Find specific SI or PO | "INV-001" or "PO-2025-" |
| **Vendor** | Review one vendor's invoices | "ABC Corporation" |
| **Purchase Order** | Review all invoices for a PO | "PO-2025-001" |
| **Status** | Filter by current status | "Pending", "Received" |
| **Date Range** | Review invoices from specific period | Jan 1 - Jan 31 |

**How to Filter:**
1. Enter search term or select from dropdowns
2. Click **"Apply Filters"** or press Enter
3. Results update automatically
4. Clear filters with **"Reset"** button

**Pro Tip:** Combine filters (e.g., Vendor + Date Range) for precise results

---

### Step 3: Mark Invoices as "Received"

**When to use:** You've received the physical invoice documents from the vendor.

#### Option A: Bulk Mark as Received

**Best for:** Multiple invoices received together

1. **Select invoices:**
   - Check boxes next to invoices
   - Or click **"Select All"** (current page only)

2. **Click** "Mark as Received" button (top of table)

3. **Confirm** in the dialog

4. **Done!** Selected invoices move to "Received" status

**What happens:**
- Status changes: `Pending` → `Received`
- Timestamp recorded (`files_received_at`)
- Activity log created
- PO financials updated (if applicable)

#### Option B: Individual Mark as Received

**Best for:** Single invoice or selective marking

1. Find the invoice in the list
2. Click the **"Mark Received"** button in the Actions column
3. Confirm in the dialog
4. Done!

**Validation:**
- Invoice must have status "Pending"
- Cannot mark as received if already in later status

---

### Step 4: Review Invoice Details

Before approving, verify:

**Required Checks:**
- ✅ **SI Number** matches physical document
- ✅ **Amount** is correct
- ✅ **Vendor** is correct
- ✅ **PO details** match (if PO invoice)
- ✅ **Files uploaded** (SI documents attached)
- ✅ **Dates** are valid and logical

**Click on invoice row** to view full details:
- Invoice information
- Purchase Order details
- Attached files
- Activity history
- Related transactions

---

### Step 5: Approve Invoices

**Prerequisite:** Invoices must have status "Received"

#### Option A: Bulk Approve (Recommended)

**Best for:** Approving multiple verified invoices

1. **Filter** to show only "Received" status invoices

2. **Select invoices** to approve:
   - Check boxes next to each invoice
   - Or use "Select All"

3. **Click** "Bulk Approve" button

4. **Add notes** (optional):
   - Approval comments
   - Special instructions
   - Payment priority notes

5. **Confirm** approval

6. **Done!** Invoices move to "Approved" status

**What happens:**
- Status changes: `Received` → `Approved`
- Approval timestamp recorded
- Your user ID recorded as approver
- Activity log created
- Invoices are now ready for Check Requisition

**Limits:**
- Max 500 invoices per bulk operation
- All selected invoices must be in "Received" status
- Files must be uploaded (if required by policy)

#### Option B: Individual Approve

**Best for:** Single invoice or special cases

1. Find the invoice
2. Click **"Approve"** button in Actions column
3. Add approval notes (optional)
4. Click **"Confirm"**
5. Done!

---

### Step 6: Reject Invoices (If Needed)

**When to reject:**
- Missing or incorrect documents
- Amount discrepancies
- Vendor disputes
- Duplicate invoices
- Policy violations

#### Bulk Reject

1. **Select invoices** to reject

2. **Click** "Bulk Reject" button

3. **Enter rejection reason** (REQUIRED):
   ```
   Examples:
   - "Missing delivery receipt"
   - "Amount does not match PO"
   - "Duplicate of INV-123"
   - "Awaiting vendor clarification"
   ```

4. **Confirm** rejection

5. **Done!** Invoices revert to "Pending" status

**What happens:**
- Status changes back to: `Pending`
- Rejection reason stored as remark (prefix: "REJECTION: ")
- Reviewer notified
- Activity log created
- Invoice can be corrected and resubmitted

**Important:** Rejection reason is visible to all users reviewing the invoice.

---

## Common Scenarios

### Scenario 1: Monthly Vendor Invoice Review
```
Task: Review all ABC Corp invoices for January
Steps:
1. Filter: Vendor = "ABC Corporation"
2. Filter: Date Range = Jan 1 - Jan 31
3. Filter: Status = "Pending"
4. Review list (50 invoices)
5. Select all (check "Select All")
6. Click "Mark as Received"
7. Verify files are attached
8. Select all again
9. Click "Bulk Approve"
10. Add note: "January batch - verified"
11. Confirm
Time: ~15 minutes
```

### Scenario 2: Single PO Invoice Approval
```
Task: Approve all invoices for PO-2025-001
Steps:
1. Filter: Purchase Order = "PO-2025-001"
2. Filter: Status = "Received"
3. Review 5 invoices against PO details
4. Verify total doesn't exceed PO amount
5. Select all 5 invoices
6. Click "Bulk Approve"
7. Confirm
Time: ~5 minutes
```

### Scenario 3: Selective Rejection
```
Task: Review 20 invoices, reject 3 with issues
Steps:
1. Filter: Status = "Received"
2. Review each invoice
3. Identify 3 with missing documents
4. Select those 3 invoices only
5. Click "Bulk Reject"
6. Enter reason: "Missing delivery receipt - please attach"
7. Confirm rejection (3 invoices)
8. Select remaining 17 invoices
9. Click "Bulk Approve"
10. Confirm approval (17 invoices)
Time: ~10 minutes
```

### Scenario 4: End-of-Month Clearance
```
Task: Clear all pending invoices before month-end
Steps:
1. Filter: Status = "Pending"
2. Review by vendor (use Vendor filter)
3. Bulk mark as received (50 invoices)
4. Change filter: Status = "Received"
5. Review for completeness
6. Bulk approve all verified (45 invoices)
7. Reject incomplete (5 invoices with reasons)
8. Follow up on rejected items
Time: ~30 minutes for 50 invoices
```

---

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| **"Files not received" error** | Invoice must have uploaded files. Go to invoice details and upload SI documents. |
| **Can't select invoice** | Check status filter. Only "Pending" can be marked received, only "Received" can be approved. |
| **"Bulk Approve" button disabled** | No invoices selected OR selected invoices have mixed statuses. |
| **Invoice not in list** | Check filters. Clear all filters to see all invoices. |
| **"Already approved" error** | Invoice was already approved. Refresh page to see updated status. |
| **Pagination not working** | Too many results. Use filters to narrow down. Max display: 500 per page. |
| **"Permission denied"** | You don't have approval permission. Contact admin. |
| **Can't reject invoice** | Can only reject invoices in "Received" status. |

---

## Pro Tips

💡 **Use filters strategically** - Filter by vendor or PO before bulk operations

💡 **Review in batches** - Process 20-50 invoices at a time for manageable review

💡 **Sort by date** - Click column headers to sort (newest first helps find recent submissions)

💡 **Check "Select All" carefully** - It only selects current page, not all pages

💡 **Use date range filter** - Perfect for month-end processing

💡 **Add meaningful rejection reasons** - Helps submitters fix issues faster

💡 **Verify PO balance** - Check remaining PO amount before approving large invoices

💡 **Double-check before bulk approve** - Once approved, invoices move to next stage

💡 **Use search for quick lookup** - Search by SI number or PO number

💡 **Review activity log** - Check invoice history if status seems wrong

---

## Validation Rules

**Before "Mark as Received":**
- ✅ Invoice status must be "Pending"

**Before "Approve":**
- ✅ Invoice status must be "Received"
- ✅ Files must be uploaded (if required by policy)
- ✅ All required fields filled
- ✅ Invoice amount is valid

**Before "Reject":**
- ✅ Rejection reason is REQUIRED (cannot be empty)
- ✅ Reason must be at least 10 characters

---

## Understanding Bulk Operations

### Selection Behavior

**"Select All" Checkbox:**
- Selects all invoices **on current page only**
- If you have 200 invoices across 4 pages, "Select All" only selects ~50 on page 1
- To select more: increase page size or apply filters

**Page Size Options:**
- 10, 25, 50, 100, 250, 500 items per page
- Larger page sizes = more invoices selected with "Select All"
- Recommended: 50-100 for bulk operations

### Bulk Operation Limits

| Operation | Max Invoices | Processing Time |
|-----------|--------------|-----------------|
| Mark as Received | 500 | ~5-10 seconds |
| Bulk Approve | 500 | ~10-20 seconds |
| Bulk Reject | 500 | ~10-20 seconds |

**Best Practice:** Keep bulk operations under 100 invoices for optimal performance

---

## Status Definitions

| Status | Meaning | Can Mark Received? | Can Approve? | Can Reject? |
|--------|---------|-------------------|--------------|-------------|
| **Pending** | Just created, awaiting receipt | ✅ Yes | ❌ No | ❌ No |
| **Received** | Documents received, awaiting approval | ❌ No | ✅ Yes | ✅ Yes |
| **Approved** | Approved for payment | ❌ No | ❌ No | ❌ No |
| **Pending Disbursement** | In check requisition | ❌ No | ❌ No | ❌ No |
| **Paid** | Payment completed | ❌ No | ❌ No | ❌ No |

**Note:** Can only move forward in status (except rejection reverts to Pending)

---

## Activity Logging

Every action is logged:

**What's Recorded:**
- Action type (marked received, approved, rejected)
- User who performed action
- Timestamp
- Changes made (status changes)
- Notes/remarks added
- IP address

**Where to View:**
- Click on invoice → View Details → Activity Log tab
- Shows complete history of invoice

**Use Cases:**
- Audit trail
- Finding who approved/rejected
- Troubleshooting status issues
- Compliance reporting

---

## Advanced Filtering Tips

### Combining Filters

**Example 1: Vendor + Date Range**
```
Vendor: "ABC Corporation"
Date From: 2026-01-01
Date To: 2026-01-31
Result: All ABC Corp invoices from January
```

**Example 2: PO + Status**
```
Purchase Order: "PO-2025-001"
Status: "Received"
Result: All received invoices for this PO (ready to approve)
```

**Example 3: Search + Vendor**
```
Search: "UTIL"
Vendor: "Electric Company"
Result: All Electric Company invoices with "UTIL" in SI number
```

### Filter Performance

**Fast Filters** (use these for quick results):
- Status filter
- Vendor filter (if vendor list is short)
- PO filter (if PO list is short)

**Slower Filters** (may take a few seconds):
- Search text (searches across multiple fields)
- Date range (scans all records)
- Combined filters (multiple conditions)

**Tip:** Apply most restrictive filter first, then add more filters

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Apply filters | **Enter** |
| Clear filters | **Esc** (when in filter field) |
| Select/Deselect checkbox | **Space** (when checkbox focused) |
| Navigate table rows | **Arrow keys** |
| Open invoice details | **Click row** |

---

## Quick Checklist

### Daily Review Checklist
- [ ] Filter by today's date or "Received" status
- [ ] Review new invoices (20-50 at a time)
- [ ] Verify files are attached
- [ ] Check amounts against POs (if applicable)
- [ ] Bulk approve verified invoices
- [ ] Reject invoices with issues (with clear reasons)
- [ ] Follow up on previously rejected items
- [ ] Clear inbox before end of day

### Month-End Checklist
- [ ] Review all "Pending" invoices
- [ ] Mark received all verified invoices
- [ ] Approve all complete invoices
- [ ] Reject or follow up on incomplete items
- [ ] Verify PO financial summaries
- [ ] Generate approval report (if needed)
- [ ] Clear all pending items before cutoff

---

## FAQs

**Q: Can I undo an approval?**
A: No. Once approved, invoices move to the next stage. Contact admin if you need to reverse an approval.

**Q: What if I marked the wrong invoices as received?**
A: Contact admin. Only admin can revert status changes.

**Q: How many invoices can I approve at once?**
A: Technical limit is 500, but recommended batch size is 50-100 for performance.

**Q: Can I approve invoices without files?**
A: Depends on company policy. System may require files before approval.

**Q: What happens to rejected invoices?**
A: Status reverts to "Pending". Submitter can correct issues and resubmit for review.

**Q: Can I edit invoice details during review?**
A: No. You can only approve or reject. Submitter must edit if changes needed.

**Q: How do I know if files are attached?**
A: Look for file icon in the Files column. Click to view/download files.

**Q: Can I filter by multiple vendors?**
A: No. Vendor filter selects one vendor at a time. Process one vendor, then switch.

**Q: What if I accidentally clicked "Bulk Approve"?**
A: Confirmation dialog appears before approval. Cancel if it was a mistake.

**Q: Can other users see my rejection reasons?**
A: Yes. Rejection reasons are visible to all users who can view the invoice.

---

## Related Workflows

**Before This Step:**
- [Bulk Invoice Creation](bulk-invoice-creation-guide.md) - Creating invoices

**After This Step:**
- Check Requisition Creation - Creating payment requests from approved invoices
- Disbursement Processing - Final payment release

**Related:**
- Single Invoice Creation - Creating individual invoices
- Invoice Search & Filtering - Finding specific invoices

---

## Need Help?

**Stuck?** Contact your Payables team lead or system administrator.

**Common Issues:**
- File upload problems → See File Management guide
- Permission errors → Contact admin to verify role permissions
- Technical errors → Screenshot error message and report to support

---

**End of Quick Guide** | Version 1.0 | Updated: 2026-01-28
