# Check Requisition Creation

This guide explains how to create and submit a check requisition for payment processing.

## Check Requisition Status Flow

When a check requisition is created, it immediately enters the `Pending Approval` state.

Pending Approval → Approved → (Creates Disbursement)

If a requisition is rejected during review, it is marked as `Rejected` and can be edited and resubmitted.

-   **Pending Approval** - Submitted for management review. Cannot be edited. Attached invoices are moved to **Pending Disbursement**.
-   **Approved** - Authorized for disbursement. Cannot be edited further.
-   **Rejected** - Returned for revision. Can be edited and resubmitted. Attached invoices are reverted to **Approved**.

**Payment Flow:**
Approved Invoices → Check Requisition → Disbursement → Payment

## Create Check Requisition

Navigate to **Check Requisitions → Create Check Requisition**.

### 1. Select Approved Invoices

Only invoices with an **Approved** status can be added to a check requisition.

**Steps:**
1.  The screen displays a paginated list of available invoices.
2.  Use the filters (vendor, project, date range) to efficiently locate the invoices you need.
3.  Select one or more invoices using the checkboxes.
4.  The header bar will display the total number of selected invoices and their combined amount.

> 💡 **Tip:** Group invoices from the same vendor or project into a single requisition for easier tracking and faster approval.

### 2. Enter Requisition Details

As you select invoices, the form on the right will auto-populate with relevant information.

**Auto-generated (Read-only):**
-   **Requisition Number:** Generated upon submission.
-   **PHP Amount:** The sum of all selected invoices.
-   **Amount in Words:** Automatically generated based on the PHP amount.
-   **PO/CER/SI Numbers:** Aggregated from the selected invoices.

**Required Fields:**
-   **Request Date \***
-   **Payee Name \*** (Auto-filled based on invoice vendor)
-   **Purpose \*** (Auto-filled with invoice numbers)
-   **Account Charge \***
-   **Service Line Distribution \***
-   **Requested By \*** (Person creating the requisition)
-   **Reviewed By \*** (First-level reviewer)
-   **Approved By \*** (Final approver)

**Optional:**
-   Remarks
-   Supporting documents (max 10MB each)

> ⚠️ All three approval fields (Requested By, Reviewed By, Approved By) are mandatory and must be filled out before you can submit the requisition.

### 3. Submit for Approval

There is no "draft" state. Once you are ready, you submit the requisition directly for approval.

1.  Click the **Submit for Approval** button.
2.  A confirmation dialog will appear summarizing the requisition details.
3.  Click **Confirm & Submit**.

The check requisition is now created with a `Pending Approval` status, and the attached invoices are updated to **Pending Disbursement**.

## Management Review

**Approver Actions:**
1.  Navigate to the check requisition's review page.
2.  Carefully review the details, attached invoices, and total amount.

**Approve:**
-   The status changes to **Approved**.
-   The next step in the workflow is to create a disbursement.

**Reject:**
-   The status changes to **Rejected**.
-   The approver must provide notes explaining the reason for rejection.
-   The accounting staff is notified, and the requisition can be edited and resubmitted.

## Validation Checks

**Before submission:**
-   At least one invoice must be selected.
-   All required fields must be filled.
-   The three approval fields (Requested By, Reviewed By, Approved By) must be assigned.
-   The payee name should match the vendor on the invoices.

**System checks:**
-   Ensures selected invoices have an "Approved" status.
-   Prevents an invoice from being added to more than one active requisition.

## Quick Reference

| Task                  | Path                                            |
| --------------------- | ----------------------------------------------- |
| Create                | Check Requisitions → Create Check Requisition   |
| Edit (if Rejected)    | Check Requisitions → Click CR → Edit            |
| View Details          | Check Requisitions → Click CR                   |
| Submit for Approval   | Create/Edit Page → Submit for Approval          |
| Approve/Reject        | Check Requisitions → Click CR → Approve/Reject  |

## Common Issues

-   **Cannot find invoices:** Ensure the status filter is set to "Approved".
-   **Submit button is disabled:** Check that all required fields, including the three approval names, are filled out.
-   **Invoice already in a requisition:** An invoice can only be part of one active check requisition at a time.
-   **Cannot edit a requisition:** The requisition is likely in "Pending Approval" status and cannot be edited. It must be rejected by an approver to become editable again.
-   **Approval fields are missing:** Contact an administrator to ensure users are assigned to the correct approval roles.

## Status Reference

| Status             | Can Edit? | Can Delete? | Invoice Status         |
| ------------------ | :-------: | :---------: | ---------------------- |
| Pending Approval   |    No     |     No      | Pending Disbursement   |
| Approved           |    No     |     No      | Pending Disbursement   |
| Rejected           |    Yes    |     Yes     | Approved               |