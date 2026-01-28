# Bulk Invoice Creation Guide

Create multiple invoices at once for a Purchase Order.

## Prerequisites

**Required:**
- Purchase Order number
- SI numbers, amounts, and dates for all invoices
- Purchasing or Admin role
- PO status must be "open"

**Optional:**
- Invoice PDF files

## Steps

### 1. Access Bulk Mode
Navigate to **Invoices** → **Create Invoice** → **Bulk Mode** button

### 2. Select Purchase Order
Choose PO from dropdown (search by PO number, vendor, or project)

### 3. Configure Batch

**Input Mode:**
- **Manual**: Enter count, type each SI number
- **Range**: Enter start/end (e.g., INV-001 to INV-050) for sequential SI numbers

**Shared Fields:**
Fields with the same value for all invoices (currency, payment terms, dates, etc.)
1. Check boxes for fields to share
2. Fill values
3. Click **Generate Invoices**

### 4. Fill Invoice Details

**Required:**
- SI Number (unique per vendor)
- SI Date
- Invoice Amount
- Payment Terms (if not shared)
- Received Date (if not shared)

**Auto-calculated:** VAT, VAT Exclusive Amount, Due Date, % of PO

**Controls:** Tab to navigate, Duplicate to copy row, Delete to remove

### 5. Upload Files (Optional)

**Bulk Upload:**
Drag files or click Choose Files. Files auto-match by SI number in filename (e.g., `INV-001.pdf`)

**Individual Upload:**
Click file icon in each row

**File Limits:** 20MB max, PDF/JPG/PNG only

### 6. Review & Submit

1. Check summary (total invoices, amount, error count = 0)
2. Fix red-bordered fields
3. Click **Preview & Submit**
4. Confirm to create invoices

## Examples

**10 invoices with random SI numbers:**
- Mode: Manual (10)
- Share: Currency, Payment Terms, Received Date
- Fill: SI Number, SI Date, Amount

**50 sequential invoices:**
- Mode: Range (INV-001 to INV-050)
- Share: Currency, Payment Terms, Received Date
- Fill: SI Date, Amount

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't click "Generate" | Select at least 1 shared field |
| Duplicate SI Number | SI must be unique per vendor |
| Files not auto-matching | Include SI number in filename |
| Currency mismatch | Invoice currency must match PO |
| PO not in dropdown | PO must be "open" status |
| Upload slow | Split into batches of 20-30 files |

## Validation

**Required before submit:**
- All required fields filled
- SI numbers unique per vendor
- Positive amounts
- Valid dates
- Currency matches PO
- PO is "open"
- Error count = 0

## Tips

- Name files with SI numbers for auto-matching
- Use Range Mode for sequential SI numbers
- Share fields to minimize data entry
- Complete in one session (no draft save)
- Recommended batch size: 20-50 invoices

## FAQs

**Can I edit invoices after creating them?**
Yes, if status is "Pending".

**Can I save as draft?**
No. Complete in one session.

**Can I add more invoices to the batch later?**
No. Create a new batch or add single invoices.

**Do files need to be uploaded during creation?**
No. Files can be added later via Edit.

**How many invoices can I create at once?**
Technical limit: 999. Recommended: 20-50 per batch.

**Can I create invoices for multiple POs?**
No. One PO per batch.
