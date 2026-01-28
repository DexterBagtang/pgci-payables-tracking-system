# Bulk Invoice Creation Guide

**PGCI Payables System** | Quick Reference Guide

---

## What is Bulk Invoice Creation?

Create **multiple invoices at once** for a Purchase Order instead of entering them one by one. Perfect for batches of 5+ invoices from the same PO.

**Time Savings**: Create 50 invoices in 15 minutes instead of 2+ hours.

---

## Before You Start

**Have Ready:**
- ✅ Purchase Order number
- ✅ SI numbers for all invoices
- ✅ Invoice amounts and dates
- ✅ Invoice PDF files (optional but recommended)

**Your Role:** Must be **Payables** or **Admin** user

**PO Requirements:**
- Purchase Order must exist
- PO status must be "open" (not draft, closed, or cancelled)

---

## Quick Start Guide

### Step 1: Access Bulk Mode
1. Go to **Invoices** → **Create Invoice**
2. Click **"Bulk Mode"** button (top right)

---

### Step 2: Select Purchase Order

1. Click the **Purchase Order dropdown**
2. Search by:
   - PO number
   - Vendor name
   - Project title
3. Select the correct PO

**What you'll see:**
- PO Number
- Vendor Name
- Project Title
- PO Amount
- CER Number
- Currency

---

### Step 3: Configure Your Batch

#### A. Choose Input Mode

**Manual Mode** (Simple)
- Just enter how many invoices: `10`
- You'll type each SI number manually

**Range Mode** (For sequential SI numbers)
- Start: `INV-001`
- End: `INV-050`
- System creates 50 invoices with auto-numbered SI fields

#### B. Select Shared Fields

**What are shared fields?** Same value for ALL invoices in the batch.

**Common choices:**
- ✅ **Currency** (inherited from PO, automatically shared)
- ✅ **Payment Terms** (if all "30 Days")
- ✅ **Received Date** (if received together)
- ✅ **SI Date** (if all invoices dated the same day)

**How:**
1. Check the box next to each field to share
2. Fill in the value
3. Click **"Generate Invoices"**

---

### Step 4: Fill Invoice Details

A table appears with rows for each invoice. Fill in:

**Required Fields** (marked with *):
- **SI Number** * - Vendor's invoice number (must be unique per vendor)
- **SI Date** * - Date on the invoice
- **Invoice Amount** * - Total amount
- **Payment Terms** * - (if not shared)
- **Received Date** * - (if not shared)

**Auto-Calculated:**
- VAT (12%)
- VAT Exclusive Amount
- Due Date
- % of PO Amount

**Tips:**
- Press **Tab** to move between fields
- Click **Duplicate** to copy a row
- Click **Delete** to remove a row (min. 1 invoice required)

---

### Step 5: Upload Files (Optional)

**3 Ways to Upload:**

#### Option 1: Bulk Upload (Recommended)
1. Scroll to **"Bulk File Upload"** section
2. Click **"Choose Files"** or drag files
3. System auto-matches files to invoices by SI number
   - `INV-001.pdf` → matches SI Number "INV-001"

#### Option 2: Individual Upload
1. Click file icon in each invoice row
2. Select file(s) for that specific invoice

#### Option 3: Drag & Drop
1. Drag files from your folder
2. Drop on the bulk upload area
3. Auto-matching happens

**File Naming Tip:** Include SI number in filename for auto-matching
- ✅ Good: `INV-001.pdf`, `2026_INV-002.pdf`
- ❌ Bad: `scan1.pdf`, `document.pdf`

**File Limits:**
- Max size: 20MB per file
- Types: PDF, JPG, PNG

---

### Step 6: Review & Submit

1. Check the **Summary** at bottom:
   - Total invoices
   - Total amount
   - Error count (should be 0)

2. Fix any **red-bordered fields** (errors)

3. Click **"Preview & Submit"**

4. Review the confirmation dialog

5. Click **"Confirm & Create Invoices"**

**Done!** Invoices are created with "Pending" status.

---

## Common Scenarios

### Scenario 1: 10 Invoices for One PO
```
PO: Select PO-2025-001
Mode: Manual (10 invoices)
Share: Currency (from PO), Payment Terms (30 Days), Received Date
Fill individually: SI Number, SI Date, Amount
Files: Bulk upload with names like "INV-001.pdf"
Time: ~10 minutes
```

### Scenario 2: 5 Partial Delivery Invoices
```
PO: Select PO-2025-015
Mode: Manual (5 invoices)
Share: Currency (from PO), Payment Terms, Received Date
Fill individually: SI Number, SI Date, Amount (different per delivery)
Files: Individual upload per invoice
Time: ~8 minutes
```

### Scenario 3: 50 Sequential Invoices
```
PO: Select PO-2025-020
Mode: Range (Start: INV-001, End: INV-050)
Share: Currency (from PO), Payment Terms, Received Date
Fill individually: SI Date, Amount (SI numbers auto-generated)
Files: Bulk upload with sequential naming
Time: ~15 minutes
```

---

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| **Can't click "Generate"** | Select at least 1 shared field and fill its value |
| **"Duplicate SI Number" error** | Each SI must be unique per vendor. Check if it already exists. |
| **Files not auto-matching** | Rename files to include exact SI number (e.g., `INV-001.pdf`) |
| **"Currency mismatch" error** | Invoice currency must match the Purchase Order |
| **Red border on field** | Required field is empty or has invalid value |
| **PO not in dropdown** | PO must be in "open" status. Check Purchase Orders list. |
| **Upload stuck/slow** | Split files into smaller batches (20-30 at a time) |
| **Validation errors on submit** | Scroll through table, look for red borders, fix empty/invalid fields |
| **"Invoice exceeds PO amount"** | Warning only. Check if amount is correct. |

---

## Pro Tips

💡 **Name your files with SI numbers** for instant auto-matching

💡 **Start small** (5-10 invoices) until you're comfortable

💡 **Use Range Mode** when SI numbers are sequential (INV-001, INV-002...)

💡 **Share everything possible** to minimize data entry

💡 **Validate as you go** - fix errors immediately instead of at the end

💡 **Can't save drafts** - complete in one session, don't close browser

💡 **Batch size sweet spot**: 20-50 invoices (easier to manage than 100+)

💡 **Check PO remaining balance** before creating large batches

---

## Validation Rules

Before submission, system checks:

- ✅ All required fields filled (SI Number, SI Date, Amount, Terms, Received Date)
- ✅ SI numbers unique per vendor
- ✅ Amounts are positive numbers
- ✅ Dates are valid
- ✅ Currency matches Purchase Order
- ✅ Purchase Order is "open"
- ⚠️ Invoice total doesn't exceed PO amount (warning only)

**Error count must be 0** to submit.

---

## Input Modes Compared

| Feature | Manual Mode | Range Mode |
|---------|-------------|------------|
| **Best for** | Random SI numbers | Sequential SI numbers |
| **SI Number** | Type each one | Auto-generated |
| **Setup** | Enter count only | Enter start & end |
| **Example** | Mixed deliveries | Batch from same shipment |

---

## File Upload Strategies

| Strategy | When to Use | How It Works |
|----------|-------------|--------------|
| **Bulk Upload** | Files named with SI numbers | Upload all at once, auto-match by name |
| **Individual** | No naming pattern | Upload to each row separately |
| **Drag & Drop** | Quick upload | Drag files to upload area, auto-match |

**File Deduplication:** Upload the same file multiple times? System stores it once, links to all invoices.

---

## Quick Checklist

**Before Submit:**
- [ ] Purchase Order selected
- [ ] All SI numbers filled and unique
- [ ] All amounts filled (positive numbers)
- [ ] All dates filled and valid
- [ ] Files uploaded (if you have them)
- [ ] Error count = 0
- [ ] Summary totals look correct

**After Submit:**
- [ ] Wait for success message
- [ ] Go to Invoices list
- [ ] Verify all invoices appear
- [ ] Check status = "Pending"
- [ ] Verify PO financial summary updated

---

## FAQs

**Q: Can I edit invoices after creating them?**
A: Yes, if status is "Pending". Go to Invoices → Select invoice → Edit.

**Q: What if I made a mistake in the batch?**
A: If status is still "Pending", edit or delete individual invoices.

**Q: Can I add more invoices to this batch later?**
A: No. Each batch is one-time. Create a new batch or add single invoices.

**Q: Do I need to upload files?**
A: Optional during creation, but can be added later via Edit.

**Q: How many invoices can I create at once?**
A: Technical limit is 999. Recommended: 20-50 per batch for easy management.

**Q: Can I save as draft and continue later?**
A: No. Complete the process in one session. Don't close browser until done.

**Q: What if my invoice total exceeds the PO amount?**
A: You'll get a warning, but can still submit. Verify the amount is correct.

**Q: Can I create invoices for multiple POs at once?**
A: No. Each bulk session is for one PO. Create separate batches for different POs.

---

## Understanding PO Financial Sync

When you create invoices in bulk, the system automatically updates the Purchase Order:

**PO Fields Updated:**
- **Total Invoiced** - Sum of all invoice amounts
- **Invoicing Percentage** - (Total Invoiced / PO Amount) × 100
- **Total Paid** - Updated when invoices are paid
- **Payment Percentage** - (Total Paid / PO Amount) × 100

**View PO Summary:** Go to Purchase Orders → Select PO → View details

---

## Need Help?

**Stuck?** Contact your Payables team lead or system administrator.

**For more documentation**, see the main documentation directory.

---

**End of Quick Guide** | Version 1.0 | Updated: 2026-01-28
