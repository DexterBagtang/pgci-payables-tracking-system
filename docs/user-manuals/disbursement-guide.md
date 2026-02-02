# Disbursement Processing & Payment Release

This guide explains how to process approved check requisitions, create a disbursement, and record the final payment release to vendors.

## Disbursement Workflow & Status Flow

The disbursement process is the final step in the payment lifecycle. It groups approved check requisitions for payment processing and release.

**Payment Flow:**
`Approved Invoices` → `Check Requisition` → **`Disbursement`** → `Payment`

**Disbursement Status (determined by dates):**
1.  **Pending / Draft** - The disbursement has been created, bundling one or more check requisitions. The physical check has not been printed or released.
2.  **Printed** - The physical check has been printed (`Date Check Printing` is set).
3.  **Scheduled for Release** - The check is scheduled for release to the vendor (`Date Scheduled for Release` is set).
4.  **Released** - The check has been handed to the vendor (`Date Check Released to Vendor` is set). This is the final status and triggers the "Paid" status on all associated invoices and check requisitions.

---

## 1. Creating a Disbursement

A user with the **Disbursement** or **Admin** role manually creates a disbursement by grouping one or more **Approved** check requisitions.

**Navigate to: `Disbursements` → `Create Disbursement`**

The creation process is a 3-step wizard:

### Step 1: Select Check Requisitions (CRs)

You are presented with a list of all check requisitions that have the **Approved** status.

-   ✅ **Select CRs:** Use the checkboxes to select the CRs you want to include in this disbursement.
-   💡 **Smart Grouping:** Use the "Smart Grouping Suggestions" panel to automatically select CRs based on common vendors, projects, or aging urgency.
-   **Search & Filter:** Use the search and filter controls to find specific CRs by payee, aging, or CR number.
-   **Financial Preview:** As you select CRs, the **Financial Preview** sidebar updates to show the total amount, number of payees, and invoice count.

Click **Next** to proceed.

> ⚠️ You must select at least one check requisition to continue.

### Step 2: Enter Disbursement Details

Provide the information related to the physical check and payment.

**Required Fields:**
-   **Check Voucher Number \***: A unique identifier for this payment batch. The system will verify its uniqueness in real-time.

**Date Fields (Optional at creation, but key to the workflow):**
-   **Date Check Printing**: The date the physical check is printed.
-   **Date Scheduled for Release**: The target date for releasing the check.
-   **Date Check Released to Vendor**: The actual date the check is handed to the vendor. Setting this date marks everything as **Paid**.

**Optional Fields:**
-   **Remarks**: Add any notes about the disbursement.
-   **Supporting Documents**: Upload related files (e.g., scanned check copies, receipts).

Click **Next** to proceed.

### Step 3: Review and Submit

This screen provides a complete summary of the disbursement you are about to create.

-   **Verify all details**: Check the total amount, timeline, payee breakdown, and the list of selected CRs.
-   **Edit if needed**: Click the "Edit" button on any section to go back to a previous step and make changes.
-   **Confirm**: Click **Create Disbursement**.

Upon creation, the disbursement is created in a **Pending** state, and all included check requisitions and invoices are updated to **Processed** and **Pending Disbursement** respectively.

---

## 2. Releasing a Disbursement (Recording Payment)

Once the physical check has been given to the vendor, you must record this action in the system. This is a critical step that marks all associated records as **Paid**.

This can be done from the main **Disbursements** table:

### Quick Release (Single Disbursement)

1.  Find the disbursement in the list.
2.  Click the **Quick Release** button (⚡ icon).
3.  A modal will appear. Set the **Release Date**.
4.  Click **Confirm Release**.

> 💡 **Undo Option**: After a "Quick Release," you have a 30-second window to **Undo** the action. This will revert the disbursement and all related records to their previous status.

### Bulk Release (Multiple Disbursements)

1.  Use the checkboxes in the table to select multiple **Pending** disbursements.
2.  A bulk action bar will appear at the bottom of the screen.
3.  Click the **Release Selected** button.
4.  Set the **Release Date** for all selected disbursements.
5.  Click **Confirm Release**.

### Releasing via Edit

You can also release a payment by editing the disbursement and setting the **Date Check Released to Vendor**.

---

## 3. Viewing and Managing Disbursements

The main `Disbursements` page provides several ways to view and manage payment batches.

-   **List View**: The default table view with powerful search, sort, and filtering capabilities.
-   **Kanban View**: A board that organizes disbursements into columns based on their status and urgency (e.g., "Overdue for Release," "Due This Week," "Released").
-   **Calendar View**: A calendar that shows disbursements based on their `Date Scheduled for Release`.

### Viewing Details

Clicking on any disbursement's **Check Voucher Number** will take you to its details page, where you can see:
-   A complete financial summary.
-   The payment timeline and status.
-   A list of all included Check Requisitions.
-   Attached files, remarks, and a full activity timeline.

---

## 4. Editing or Deleting a Disbursement

Mistakes can be corrected by editing or deleting a disbursement. These actions are only available for disbursements that have **not yet been released**.

### Editing a Disbursement

1.  Navigate to the disbursement's detail page and click **Edit**.
2.  You can add or remove check requisitions.
    -   **Adding a CR**: Moves an `Approved` CR into this disbursement.
    -   **Removing a CR**: Reverts a `Processed` CR back to `Approved` status.
3.  You can also update details like dates, remarks, or add more files.

### Deleting a Disbursement

-   Deleting a disbursement is a safe way to cancel the entire payment batch.
-   This action reverts all included check requisitions and their invoices back to **Approved** status, making them available to be added to a new disbursement.

---

## Quick Reference

| Task | Path / Action |
|------|------|
| Create Disbursement | `Disbursements` → `Create Disbursement` |
| Select CRs for Payment | Step 1 of the creation wizard |
| Record a Payment | Use **Quick Release** or **Bulk Release** from the table |
| Undo a Release | Click **Undo** within 30 seconds of a Quick Release |
| Add/Remove CRs | **Edit** an un-released disbursement |
| Cancel a Disbursement | **Delete** an un-released disbursement |

## Common Issues & Solutions

-   **Cannot find a Check Requisition to add**: Ensure its status is **Approved**. If it's `Pending Approval` or `Rejected`, it must complete its own workflow first. If it's already `Processed`, it's part of another disbursement.
-   **Submit button is disabled during creation**: Make sure you have selected at least one Check Requisition in Step 1 and filled in a unique Check Voucher Number in Step 2.
-   **Released a disbursement by mistake**: Use the **Undo** button immediately (within 30 seconds). If the window is missed, contact an administrator who may need to perform a manual correction.
-   **Cannot edit or delete a disbursement**: The disbursement has already been **Released**. Its status is final. If a correction is needed, it must be handled outside the system or with administrator intervention.
