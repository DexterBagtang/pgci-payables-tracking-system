# Vendor Management

**Role Required:** Admin or Purchasing

## Create Vendor

**Vendors → Create Vendor**

**Required:**
- Name (must be unique, max 255 chars)
- Category: SAP or Manual

**Optional:**
- Contact Person
- Email
- Phone
- Address (max 1000 chars)
- Payment Terms (e.g., "Net 30 days")
- Notes (max 1000 chars)

**Steps:**
1. Fill name and category
2. Add contact info (optional)
3. Save

Vendor created with **Active** status by default.

## Update Vendor

**Vendors → Click vendor → Edit**

Edit any field. Name must remain unique.

**Status:**
- **Active** - Can be used in new POs
- **Inactive** - Cannot be used in new POs (existing POs unaffected)

## View Vendor Details

**Vendors → Click vendor**

**Shows:**
- Contact info, payment terms, notes
- Financial summary: Total PO Amount, Total Invoiced, Total Paid, Outstanding Balance, Overdue Amount
- Invoice stats: Total, Paid, Pending, Overdue
- Related: POs, Invoices, Projects, Activity Log

## Bulk Operations

**Vendors → Select checkboxes → Bulk Actions**

**Options:**
- **Bulk Activate** - Reactivate selected vendors
- **Bulk Deactivate** - Deactivate selected vendors
- **Bulk Delete** - Delete vendors (only if no POs/invoices)

## Search & Filter

**Search:** Name, Email, Category, Phone, Address
**Filter:** Status (Active/Inactive), Category (SAP/Manual)
**Sort:** Name, Email, Category, Date, PO Count, Invoice Count

## Quick Reference

| Task | Path |
|------|------|
| Create | Vendors → Create Vendor |
| Edit | Vendors → Click vendor → Edit |
| View Details | Vendors → Click vendor |
| Deactivate | Edit → Change Status → Inactive |
| Bulk Actions | Select → Bulk Actions |

## Common Issues

- **Duplicate name** - Name must be unique
- **Vendor not in PO dropdown** - Check status is Active
- **Cannot delete** - Vendor has POs/invoices, use Deactivate instead

## Permissions

- View: Any user
- Create/Update: Admin, Purchasing
- Bulk Operations: Admin only
- Delete: Admin only
