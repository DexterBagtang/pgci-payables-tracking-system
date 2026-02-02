# Bulk Invoice Addition

Add multiple invoices at once for a Purchase Order.

## Access Bulk Mode

**Invoices → Add Invoice → Bulk Mode**

## Prerequisites

**Required:**
- Purchase Order with **Open** status
- SI numbers, amounts, and dates for all invoices
- Purchasing or Admin role

**Optional:**
- Invoice PDF files (max 20MB each)

## Select Purchase Order

Choose PO from dropdown. Search by PO number, vendor, or project.

## Configure Batch

**Input Mode:**
- **Manual** - Enter count, type each SI number manually
- **Range** - Enter start/end (e.g., INV-001 to INV-050) for sequential SI numbers

**Shared Fields:**
Check boxes for fields that have the same value across all invoices:
- Currency
- Payment Terms
- Received Date
- SI Date (if all invoices have the same date)

**Steps:**
1. Select input mode (Manual or Range)
2. Check boxes for fields to share
3. Fill shared field values
4. Click **Generate** button (shows count, e.g., "Generate 10")

> 💡 Use **Range Mode** for sequential SI numbers to save time. Use **Shared Fields** to minimize repetitive data entry.

## Fill Invoice Details

**Required (per invoice):**
- SI Number * (unique per vendor)
- SI Date *
- Invoice Amount *
- Payment Terms * (if not shared)
- Received Date * (if not shared)

**Auto-calculated:**
- VAT (12% of amount)
- VAT Exclusive Amount
- Due Date (based on payment terms)
- % of PO

**Navigation Controls:**
- Tab to move between fields
- Duplicate to copy row values
- Delete to remove invoice row

> ⚠️ SI Numbers must be unique per vendor. Duplicate SI numbers will show validation errors.

## Upload Files (Optional)

**Bulk Upload:**
Drag and drop files or click **Choose Files**. Files auto-match by SI number in filename.

Example: `INV-001.pdf` automatically attaches to invoice with SI Number `INV-001`

**Individual Upload:**
Click file icon in each row to upload specific file

**File Requirements:**
- Max 20MB per file
- Supported formats: PDF, JPG, PNG
- Filename should contain SI number for auto-matching

> 💡 Name files with SI numbers (e.g., `INV-001.pdf`) for automatic matching.

## Review & Submit

**Steps:**
1. Check summary panel: total invoices, total amount, error count
2. Fix any validation errors (red-bordered fields)
3. Ensure error count = 0
4. Click **Preview & Submit**
5. Review preview
6. Confirm to add all invoices

⚠️ All invoices are added at once. There is no draft mode for bulk addition.

## Examples

### Example 1: 10 Invoices with Non-Sequential SI Numbers

Adding 10 invoices for `PO-2026-0042` with random SI numbers.

1. Navigate to **Invoices → Add Invoice → Bulk Mode**
2. Select PO: `PO-2026-0042`
3. Input Mode: **Manual**, Count: 10
4. Shared Fields: Check Currency (PHP), Payment Terms (Net 30 days), Received Date (Today)
5. Click **Generate 10**
6. Fill each row:
   - SI Number: `SI-A-001`, `SI-A-005`, `SI-A-012`, etc.
   - SI Date: varies per invoice
   - Amount: varies per invoice
7. Click **Preview & Submit** → Confirm
8. 10 invoices added with status **Pending**

### Example 2: 50 Sequential Invoices

Adding 50 invoices with sequential SI numbers for `PO-2026-0043`.

1. Navigate to **Invoices → Add Invoice → Bulk Mode**
2. Select PO: `PO-2026-0043`
3. Input Mode: **Range**
4. Range: Start = `INV-001`, End = `INV-050`
5. Shared Fields: Check Currency (PHP), Payment Terms (Net 30 days), Received Date (Today), SI Date (Today)
6. Click **Generate 50**
7. Fill amounts for each invoice
8. Bulk upload 50 PDF files named `INV-001.pdf` to `INV-050.pdf`
9. Click **Preview & Submit** → Confirm
10. 50 invoices added with files attached

### Example 3: Mixed Dates and Amounts

Adding 20 invoices with same payment terms but different dates.

1. Navigate to **Invoices → Add Invoice → Bulk Mode**
2. Select PO: `PO-2026-0044`
3. Input Mode: **Manual**, Count: 20
4. Shared Fields: Check Currency (PHP), Payment Terms (Net 45 days)
5. Click **Generate 20**
6. Fill each row with specific SI Number, SI Date, Received Date, and Amount
7. Click **Preview & Submit** → Confirm

## Quick Reference

| Task | Path |
|------|------|
| Access Bulk Mode | Invoices → Add Invoice → Bulk Mode |
| Select PO | Choose from dropdown |
| Configure Batch | Select mode → Check shared fields → Generate |
| Fill Details | Enter required fields per invoice |
| Upload Files | Drag files or click Choose Files |
| Submit | Preview & Submit → Confirm |

## Common Issues

- **Can't click "Generate"** - Select at least 1 shared field before generating
- **Duplicate SI Number** - SI Numbers must be unique per vendor. Change duplicate SI numbers
- **Files not auto-matching** - Include exact SI number in filename (e.g., `INV-001.pdf`)
- **Currency mismatch** - Invoice currency must match PO currency
- **PO not in dropdown** - PO must have "Open" status. Draft or Closed POs cannot receive invoices
- **Upload slow** - Split into smaller batches of 20-30 files for better performance
- **Error count not zero** - Fix all red-bordered fields before submitting

## Search & Filter

Search Purchase Orders by:
- PO Number
- Vendor Name
- Project Title

Filter by:
- Status (only "Open" POs can receive invoices)

## Permissions

- View: Any user
- Add Bulk Invoices: **Admin**, **Purchasing**
- Edit Individual Invoices: **Admin**, **Purchasing**, **Payables**
- Delete: **Admin** only
