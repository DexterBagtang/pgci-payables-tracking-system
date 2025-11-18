# User Feedback Requirements - November 18, 2025

## Overview

This document outlines the new requirements and features requested based on user feedback from project demos. The features are organized into 7 main categories with 32 actionable tasks.

---

## 1. Currency Selection (USD/PHP)

### Requirement
Add currency selection option for Purchase Orders and Invoices with Philippine Peso (PHP) as the default currency.

### Tasks
- [ ] Add currency field (USD/PHP) to purchase orders - database migration
- [ ] Add currency field (USD/PHP) to invoices - database migration
- [ ] Update PO models and controllers to handle currency field
- [ ] Update Invoice models and controllers to handle currency field
- [ ] Add currency select field to PO create/edit forms (default PHP)
- [ ] Add currency select field to Invoice create/edit forms (default PHP)

### Technical Notes
- Use ENUM or string field for currency (values: 'PHP', 'USD')
- Default value: 'PHP'
- Display currency symbol in tables and views (₱ for PHP, $ for USD)
- **No exchange rate handling needed** - currency is for display purposes only

---

## 2. Bulk Invoice File Upload Improvement

### Requirement
Improve the bulk invoice creation workflow by making individual file uploads optional and adding a new multiple file input that accepts all invoice files at once.

**Current Behavior:**
- Bulk mode requires uploading individual files for each invoice (e.g., 10 invoices = 10 separate file inputs)

**New Behavior:**
- Individual file inputs become optional
- New multiple file input allows uploading 1+ files that contain all the invoices
- User can upload a single PDF with all invoices or multiple PDFs at once

### Tasks
- [ ] Change individual invoice file inputs from required to optional in bulk mode
- [ ] Add new multiple file input field for bulk invoice upload
- [ ] Update invoice bulk controller to handle multiple file uploads
- [ ] Implement filename-to-invoice matching logic
- [ ] Add OCR fallback for unmatched files
- [ ] Handle single PDF with multiple pages (associate entire file with one invoice)

### Technical Notes
- Use `<input type="file" multiple>` for the new field
- Store files using polymorphic `fileable` relationship
- Add validation for file types (PDF, images)

**File Association Logic:**
1. **Filename Matching**: Attempt to match uploaded file names with invoice numbers
   - Example: `INV-001.pdf` matches invoice number `INV-001`
   - Use fuzzy matching if needed (e.g., `invoice_001.pdf`, `INV001.pdf`)
2. **OCR Fallback**: If filename doesn't match, use OCR to extract invoice number from file content
   - Libraries: Tesseract.js (frontend) or Laravel OCR packages (backend)
   - Extract invoice number from document text
3. **Single File Handling**: If a single PDF contains multiple pages, associate the entire file with the corresponding invoice
   - No page splitting required
   - One file → one invoice relationship

**Implementation Considerations:**
- Show matching results to user before final submission
- Allow manual reassignment if auto-matching fails
- Display unmatched files for user review

---

## 3. Role-Based Access Control

### Requirement
Implement a role system with 4 distinct roles. Functions and permissions to be defined later.

**Roles:**
1. **Admin** - Full system access
2. **Purchasing** - Purchase order management
3. **Payables** - Invoice and check requisition management
4. **Disbursement** - Final payment processing

### Tasks
- [ ] Create roles migration (Admin, Purchasing, Payables, Disbursement)
- [ ] Seed initial roles in database
- [ ] Add role assignment to users table/model

### Technical Notes
- **Each user has exactly one role** (no multi-role assignments)
- Use single `role` field on users table or simple `user_role` relationship
- Prepare for future permission assignments per role

---

## 4. Check Requisition Review Workflow Changes

### Requirement
Modify the check requisition review process to remove the "upload signed" option and add file inputs to the approve and reject actions.

**Changes:**
- Remove: Standalone "upload signed" option under review
- Add: File input on approve action (for uploading signed approval document)
- Add: File input on reject action (for uploading signed rejection document)

### Tasks
- [ ] Remove 'upload signed' option from check requisition review page
- [ ] Add file input to check requisition approve action
- [ ] Add file input to reject action
- [ ] Update check requisition approve/reject controllers to handle files

### Technical Notes
- File inputs should be optional on approve/reject
- Use polymorphic file storage
- Update UI to show approve/reject modals with file upload capability
- Store files with context (approval/rejection)

---

## 5. Disbursement Module (Final Payment Processing)

### Requirement
Create a new "Disbursement" module that represents the final stage of the payment workflow. This occurs after a check requisition is approved.

**Workflow:**
1. Check requisition gets approved
2. Related invoices status → `pending_disbursement`
3. Disbursement officer fills in disbursement details
4. When disbursement is completed → invoices status → `paid`
5. Aging calculation stops when "date check released to vendor" is filled

**Disbursement Fields:**
- Check voucher number
- Date check scheduled for release
- Date check released to vendor (stops aging calculation)
- Date check printing
- Remarks
- File upload (multiple files support)

### Tasks
- [ ] Create disbursements table migration with all required fields
- [ ] Create Disbursement model with relationships
- [ ] Add 'pending_disbursement' and 'paid' statuses to invoice status enum
- [ ] Create disbursement controller with CRUD operations
- [ ] Add disbursement routes to web.php
- [ ] Create disbursement form component with all fields (voucher no, dates, remarks, files)
- [ ] Implement aging calculation logic (stops when check released to vendor)
- [ ] Update invoice status to 'paid' when disbursement is completed
- [ ] Add aging display column/field in disbursement views

### Technical Notes
- **One check/disbursement can cover multiple check requisitions** (one-to-many relationship)
- Disbursement has many-to-many relationship with invoices (via check requisitions)
- Aging calculation: days between "date invoice received" and "date check released to vendor"
- **Display aging information in disbursement views** - show current aging for each invoice
- Multiple file uploads for supporting documents (check copies, receipts, etc.)
- Consider validation: date fields should be chronological
- Add disbursement index/show pages to navigation

### Database Schema (Proposed)
```sql
disbursements:
  - id
  - check_voucher_number (string)
  - date_check_scheduled (date, nullable)
  - date_check_released_to_vendor (date, nullable) -- stops aging
  - date_check_printing (date, nullable)
  - remarks (text, nullable)
  - created_by (user_id)
  - timestamps

check_requisition_disbursement (pivot table):
  - id
  - check_requisition_id (foreign key)
  - disbursement_id (foreign key)
  - timestamps

Files: Use polymorphic relationship (disbursement_id, disbursementable_type)
```

**Relationship Structure:**
- Disbursement hasMany CheckRequisitions (via pivot)
- CheckRequisition belongsToMany Disbursements
- One check can process multiple check requisitions

---

## 6. Custom Date Range Filters

### Requirement
Add "from date" to "to date" filtering capability on the main data tables.

**Tables to Update:**
- Purchase Orders
- Invoices
- Check Requisitions

### Tasks
- [ ] Add date range filter to purchase orders table (from date - to date)
- [ ] Add date range filter to invoices table (from date - to date)
- [ ] Add date range filter to check requisitions table (from date - to date)
- [ ] Update backend controllers to handle date range filtering

### Technical Notes
- Use date picker component (react-day-picker or similar)
- Filter on `created_at` or relevant date field (invoice_date, po_date, etc.)
- Include URL query parameters for filter persistence
- Clear filter option
- Show active filter state in UI

---

## 7. Purchase Order Override/Close Functionality

### Requirement
Allow users with the "Purchasing" role to manually close/override a purchase order when most invoices are paid but the PO is considered settled. This requires a justification (remarks) and optional file upload.

**Use Case:**
- **Partial completion settlement**: ~80% of invoices paid but remaining amount is waived/settled
- Vendor cancelled order for remaining items
- Project requirements changed
- Order no longer needed

**Prerequisite:**
- **All associated invoices must be in "paid" status** before PO can be closed
- Cannot close PO with pending/unpaid invoices

**Required:**
- Remarks (text explaining why PO is being closed)

**Optional:**
- File upload (supporting documentation)

### Tasks
- [ ] Add 'closed' status to purchase orders
- [ ] Create PO override/close functionality with remarks field
- [ ] Add optional file input to PO close action
- [ ] Implement authorization check for purchasing role on PO close
- [ ] Add validation to ensure all invoices are paid before closing

### Technical Notes
- Add "Close PO" button/action on PO detail page
- Show modal/form with remarks textarea and file input
- **Validation**: Check that all related invoices have status = 'paid'
- Display error if unpaid invoices exist
- Store closure details (who closed, when, why)
- Closed POs should be visually distinct in tables (grayed out or badge)
- Consider adding `closed_at`, `closed_by`, `closure_remarks` fields to POs table
- Prevent further invoice creation against closed POs

---

## Implementation Priority

### Suggested Order:
1. **Currency Selection** (Low complexity, high visibility)
2. **Date Range Filters** (High value, medium complexity)
3. **Role System** (Foundation for other features)
4. **PO Override/Close** (Medium complexity, purchasing-focused)
5. **Bulk Invoice File Upload** (Medium complexity, UX improvement)
6. **Check Req Review Changes** (Low complexity)
7. **Disbursement Module** (High complexity, new feature)

---

## Notes and Considerations

### General
- All features should maintain the existing activity log pattern
- File uploads should use the polymorphic `fileable` relationship
- Forms should follow existing Inertia.js patterns
- Maintain TypeScript type safety throughout

### Testing Requirements
- Unit tests for new models and relationships
- Feature tests for controller endpoints
- E2E tests for critical workflows (especially disbursement)
- Test role-based authorization

### Documentation
- Update CLAUDE.md with new models and workflows
- Add database diagram updates (db.mmd)
- Document disbursement workflow in flowchart

---

## Clarifications Received

All requirements have been clarified and incorporated into the respective sections above:

1. ✅ **Currency**: Display symbol only (₱ for PHP, $ for USD) - no exchange rates
2. ✅ **Bulk Upload**: Filename matching → OCR fallback → manual review
3. ✅ **Roles**: One role per user (no multi-role assignments)
4. ✅ **Disbursement**: One check can cover multiple check requisitions (many-to-many)
5. ✅ **Aging**: Yes, display aging in disbursement views
6. ✅ **PO Close**: All invoices must be paid before PO can be closed

---

**Document Created:** November 18, 2025
**Last Updated:** November 18, 2025
**Status:** ✅ Requirements Complete & Clarified
**Next Step:** Begin Implementation

**Total Tasks:** 35 (updated from original 32 after clarifications)
