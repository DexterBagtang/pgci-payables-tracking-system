# Purchase Order Management

## PO Status Flow

**Draft** → **Open** → **Closed**

- **Draft** - Work in progress. Most fields are optional. Cannot receive invoices.
- **Open** - Finalized and active. All required fields filled. Ready to receive invoices.
- **Closed** - Completed. No further changes allowed.
- **Cancelled** - Terminated. No further changes allowed.

## Create Purchase Order

**Purchase Orders → Create Purchase Order**

**Required (when saving as Open):**
- PO Number * (must be unique)
- Vendor * (must be Active)
- Project *
- PO Amount * (must not exceed project remaining budget)
- PO Date *

**Optional:**
- Currency (PHP or USD, defaults to PHP)
- Payment Term (e.g., "Net 30 days")
- Description
- Files (max 10MB each)

> 💡 Save as **Draft** first if you don't have all details ready. Required fields are only enforced when saving as **Open**.

**Steps:**
1. Click **Create Purchase Order**
2. Select a Vendor and Project
3. Fill in PO Number, Amount, and Date
4. Set Currency and Payment Terms (optional)
5. Upload supporting documents (optional)
6. Choose to save as **Draft** or **Open**
7. Save

## Update Purchase Order

**Purchase Orders → Click PO → Edit**

Edit any field on **Draft** or **Open** purchase orders. Closed and Cancelled POs cannot be edited.

⚠️ **Vendor cannot be changed** if the PO already has invoices linked to it.

## Finalize Purchase Order (Draft → Open)

Finalization locks in the PO for invoicing. When a Draft PO is changed to **Open** status:

- All required fields (PO Number, Vendor, Project, Amount, Date) must be filled
- The system records who finalized it and when
- The PO becomes eligible to receive invoices

**Steps:**
1. Open the Draft PO → **Edit**
2. Fill in any missing required fields
3. Change status to **Open**
4. Save

> ⚠️ Once finalized, the PO Number becomes the permanent reference for all linked invoices.

## View Purchase Order Details

**Purchase Orders → Click PO**

**Shows:**
- PO details: Number, Vendor, Project, Amount, Currency, Payment Terms, Date
- Financial summary: PO Amount, Total Invoiced, Total Paid, Outstanding Amount
- Linked invoices and their statuses
- Uploaded files and closure documents
- Activity log (creation, updates, status changes)
- Remarks

## Close Purchase Order

Closing marks a PO as complete. The system checks for outstanding invoices before closing.

**Steps:**
1. Open the PO → Click **Close**
2. Enter **Closure Remarks** (required, max 1000 characters)
3. Upload closure documents (optional, max 10MB each)
4. Click **Close**

### Normal Closure

If all invoices are paid, the PO closes immediately. A financial snapshot is recorded in the activity log.

### Force Closure

If the PO has warnings (unpaid invoices, uninvoiced amount, or no invoices at all), the system displays them and asks for confirmation:

| Warning | Meaning |
|---------|---------|
| No invoices created | PO amount remains fully uninvoiced |
| Unpaid invoices | Some invoices have not been settled |
| Not fully invoiced | Total invoiced is less than PO amount |
| Invoiced amount exceeds PO | Total invoices surpass the PO budget |

- Review the warnings, then click **Force Close** to proceed
- Force closure is logged as a manual override with all warnings recorded

> ⚠️ Force closure is permanent. The financial snapshot at the time of closure is preserved in the activity log.

## Search & Filter

**Search:** PO Number, Vendor Name, Project Title, CER Number
**Filter:** Status (Draft/Open/Closed/Cancelled), Vendor, Project, Date Range (PO Date or Created Date)
**Sort:** PO Number, PO Date, Expected Delivery Date, PO Amount, Status, Vendor, Project

## Examples

### Example 1: Create and Finalize a PO

A Purchasing staff member needs to create a PO for a new vendor order.

1. Navigate to **Purchase Orders → Create Purchase Order**
2. Select Vendor: *Acme Supplies*
3. Select Project: *Building Renovation (CER-2026-001)*
4. Enter PO Number: `PO-2026-0042`
5. Enter PO Amount: `150,000.00`
6. Set Currency to **PHP**, Payment Term to *Net 30 days*
7. Set PO Date to today
8. Save as **Open** — the PO is now finalized and ready to receive invoices

### Example 2: Close a Fully Settled PO

All invoices under `PO-2026-0042` have been paid.

1. Open `PO-2026-0042` → Click **Close**
2. Enter Closure Remarks: *All deliveries received and invoices settled*
3. Click **Close**
4. The PO is now **Closed** with a final financial snapshot logged

### Example 3: Force Close a PO with Outstanding Invoices

The project is ending but 2 invoices remain unpaid.

1. Open the PO → Click **Close**
2. Enter Closure Remarks: *Project concluded — remaining balance to be written off*
3. System displays warnings: *2 invoices unpaid, outstanding amount ₱45,000.00*
4. Click **Force Close** to confirm
5. The PO closes with a manual override logged, including all warnings and the financial snapshot

## Quick Reference

| Task | Path |
|------|------|
| Create | Purchase Orders → Create Purchase Order |
| Edit | Purchase Orders → Click PO → Edit |
| Finalize | Edit → Change Status to Open → Save |
| View Details | Purchase Orders → Click PO |
| Close | Click PO → Close |
| Search | Purchase Orders → Search bar |

## Common Issues

- **PO amount exceeds budget** - Check project's remaining budget. Reduce PO amount or free up budget from other draft/open POs
- **Vendor not in dropdown** - Vendor may be Inactive. Reactivate the vendor first
- **Cannot edit PO** - PO is Closed or Cancelled. These statuses are permanent
- **Cannot change vendor** - PO has linked invoices. Remove or reassign invoices first
- **PO Number already exists** - PO Numbers must be unique. Use a different number

## Permissions

- View: Any user
- Create/Update: **Admin**, **Purchasing**
- Close: **Admin**, **Purchasing**
- Delete: **Admin** only
