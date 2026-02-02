# Vendor Management

## Vendor Categories

**SAP** - Vendors from SAP system integration
**Manual** - Manually created vendors

## Create Vendor

**Vendors → Create Vendor**

**Required:**
- Name * (must be unique, max 255 characters)
- Category * (SAP or Manual)

**Optional:**
- Contact Person
- Email
- Phone
- Address (max 1000 characters)
- Payment Terms (e.g., "Net 30 days")
- Notes (max 1000 characters)

**Steps:**
1. Click **Create Vendor**
2. Enter unique Vendor Name
3. Select Category (SAP or Manual)
4. Add contact information (optional but recommended)
5. Add payment terms if applicable
6. Save

Vendor is created with **Active** status by default.

> 💡 Add email and contact person for easier communication tracking.

## Update Vendor

**Vendors → Click vendor → Edit**

Edit any field. Vendor name must remain unique across all vendors.

## Vendor Status

**Active** ↔ **Inactive**

- **Active** - Can be used in new Purchase Orders. Default status for new vendors.
- **Inactive** - Cannot be used in new Purchase Orders. Existing POs remain unaffected.

> ⚠️ Deactivating a vendor does not affect existing POs or invoices. Use this to prevent new POs with vendors you no longer work with.

## View Vendor Details

**Vendors → Click vendor**

**Shows:**
- Basic info: Name, Category, Contact Person, Email, Phone, Address, Payment Terms
- Financial summary:
  - **Total PO Amount**: Sum of all Purchase Orders associated with the vendor.
  - **Total Invoiced**: Total amount of all invoices submitted for the vendor.
  - **Total Paid**: Total amount paid to the vendor across all invoices.
  - **Outstanding Balance**: The remaining balance to be paid to the vendor (Total Invoiced - Total Paid).
  - **Overdue Amount**: Total amount of invoices that are past their due date and not yet paid.
  - **Total Invoices**: Count of all invoices associated with the vendor.
  - **Paid Invoices**: Count of invoices with 'paid' status.
  - **Pending Invoices**: Count of invoices with statuses other than 'paid'.
  - **Overdue Invoices**: Count of invoices that are past due date and not yet paid.
  - **Average Payment Days**: Average number of days it takes to pay an invoice from the SI date to the paid date.
- Invoice statistics: Total, Paid, Pending, Overdue
- Related records: Purchase Orders, Invoices, Projects
- Activity log (all changes and actions)

## Bulk Operations

**Vendors → Select checkboxes → Bulk Actions**

**Available Actions:**
- **Bulk Activate** - Reactivate selected inactive vendors
- **Bulk Deactivate** - Deactivate selected active vendors
- **Bulk Delete** - Delete vendors (only if they have no POs or invoices)

**Steps:**
1. Select vendors using checkboxes
2. Click **Bulk Actions** button
3. Choose action
4. Confirm

> ⚠️ Bulk Delete only works for vendors with no Purchase Orders or Invoices. Use Bulk Deactivate instead to preserve data integrity.

## Examples

### Example 1: Create New Vendor

A Purchasing staff member adds a new vendor.

1. Navigate to **Vendors → Create Vendor**
2. Name: *Acme Supplies*
3. Category: *Manual*
4. Contact Person: *John Smith*
5. Email: *john.smith@acmesupplies.com*
6. Phone: *+63 2 1234 5678*
7. Address: *123 Main Street, Makati City*
8. Payment Terms: *Net 30 days*
9. Notes: *Preferred supplier for office materials*
10. Save
11. Vendor created with **Active** status

### Example 2: Deactivate Vendor

Deactivating a vendor that is no longer used.

1. Navigate to **Vendors** → Click vendor
2. Click **Edit**
3. Change Status to **Inactive**
4. Save
5. Vendor is now **Inactive** and cannot be selected for new POs

### Example 3: Bulk Deactivate Multiple Vendors

Deactivating 5 vendors at once.

1. Navigate to **Vendors**
2. Select 5 vendors using checkboxes
3. Click **Bulk Actions** → **Bulk Deactivate**
4. Confirm
5. All 5 vendors are now **Inactive**

## Search & Filter

**Search:** Name, Email, Category, Phone, Address
**Filter:** Status (Active/Inactive), Category (SAP/Manual)
**Sort:** Name, Email, Category, Date Created, Date Updated, Phone, PO Count, Invoice Count

## Quick Reference

| Task | Path |
|------|------|
| Create | Vendors → Create Vendor |
| Edit | Vendors → Click vendor → Edit |
| View Details | Vendors → Click vendor |
| Activate/Deactivate | Edit → Change Status → Save |
| Bulk Actions | Select vendors → Bulk Actions |
| Search | Vendors → Search bar |
| Sort by Name | Vendors → Click Name column header |
| Sort by Email | Vendors → Click Email column header |
| Sort by Category | Vendors → Click Category column header |
| Sort by Date Created | Vendors → Click Date Created column header |
| Sort by Date Updated | Vendors → Click Date Updated column header |
| Sort by Phone | Vendors → Click Phone column header |
| Sort by PO Count | Vendors → Click Purchase Orders column header |
| Sort by Invoice Count | Vendors → Click Invoices column header |

## Common Issues

- **Duplicate name** - Vendor names must be unique across all vendors. Use a different name or add distinguishing information
- **Vendor not in PO dropdown** - Check vendor status is Active. Reactivate if needed
- **Cannot delete vendor** - Vendor has existing POs or invoices. Use Deactivate instead to preserve data integrity
- **Cannot find vendor** - Clear all filters and try searching by name or email
- **Email format invalid** - Ensure email follows standard format (e.g., user@domain.com)

## Permissions

- View: Any user
- Create/Update: **Admin**, **Purchasing**
- Bulk Operations: **Admin** and **Purchasing** roles with write permissions for the Vendors module.
- Delete: **Admin** only
