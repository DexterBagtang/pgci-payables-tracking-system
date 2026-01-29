# User Manuals - PGCI Payables System

**Last Updated**: January 29, 2026

---

## Overview

This directory contains end-user guides for the PGCI Payables Management System. These guides are written for non-technical users and provide step-by-step instructions for common tasks.

---

## Available Manuals

### Core Workflows

#### ✅ [Bulk Invoice Creation Guide](bulk-invoice-creation.md)
**For**: Payables Staff, Admin Users

Creating multiple invoices at once for a Purchase Order using bulk mode.

**Covers:**
- Input modes (manual vs. range)
- Shared fields configuration
- File upload and auto-matching
- Validation and troubleshooting

---

#### ✅ [Invoice Approval Workflow Guide](invoice-approval-workflow.md)
**For**: Payables Staff, Accounting, Admin Users

Reviewing and approving invoices in bulk before payment processing.

**Covers:**
- Marking invoices as received
- Bulk approval and rejection
- Status flow and filtering
- Validation rules

---

#### ✅ [Check Requisition Creation Guide](check-requisition-creation.md)
**For**: Accounting Staff, Admin Users

Grouping approved invoices into payment requests for management approval.

**Covers:**
- Selecting approved invoices
- Requisition details and approval fields
- Status flow (Draft → Pending → Approved)
- Management review process

---

#### ✅ [Vendor Management Guide](vendor-management.md)
**For**: Admin Users, Purchasing Staff

Managing vendors in the PGCI Payables System.

**Covers:**
- Creating and updating vendors
- Vendor categories (SAP/Manual)
- Vendor details and financial summaries
- Bulk vendor operations (activate, deactivate, delete)
- Searching and filtering vendors
- Status management

---

#### ✅ [Project Management Guide](project-management.md)
**For**: Admin Users, Purchasing Staff

Managing projects and budgets in the system.

**Covers:**
- Creating and updating projects
- Project types (SM Project, PhilCom Project)
- Project budget tracking and utilization
- Status management (Active, On Hold, Completed, Cancelled)
- Type-specific requirements
- Searching and filtering projects

---

## Planned Manuals

### High Priority

- **Disbursement Processing** - Final payment release workflow
- **Purchase Order Management** - Creating and managing purchase orders

### Medium Priority

- **Invoice Search & Filtering** - Finding and filtering invoices
- **File Management** - Working with invoice attachments
- **Single Invoice Creation** - Creating invoices one at a time

### Role-Specific Guides

- **Admin User Guide** - Complete system overview
- **Purchasing Role Guide** - PO creation and management
- **Payables Role Guide** - Invoice and check requisition workflows
- **Disbursement Role Guide** - Payment processing

### Quick Reference

- **Invoice Status Reference** - Status flow and definitions
- **Common Errors & Troubleshooting** - Error messages and solutions
- **Keyboard Shortcuts & Tips** - Efficiency shortcuts

---

## How to Use These Manuals

### For New Users
1. Start with role-specific guides (coming soon)
2. Read the relevant workflow guides for your tasks
3. Keep quick reference guides handy

### For Experienced Users
- Use as reference for specific features
- Check troubleshooting sections for issues
- Review tips & best practices for efficiency

### For Trainers
- Use guides as training curriculum
- Follow step-by-step sections in training sessions
- Reference common scenarios for practice exercises

---

## Documentation Conventions

### Symbols Used

- ✅ **Checkmark**: Required action or recommended approach
- ❌ **X Mark**: Action to avoid or error condition
- ⚠️ **Warning**: Important caution or note
- 💡 **Lightbulb**: Tip or helpful hint
- 📋 **Clipboard**: Checklist item

### Field Notation

- **Field Name** * - Asterisk indicates required field
- `Monospace text` - Exact values or code
- **Bold** - Important terms or UI elements
- *Italic* - Emphasis or variable values

### Example Formats

```
Code blocks - For exact values, examples, or commands
```

> Quote blocks - For important notes or warnings

| Tables | For comparisons and reference data |
|--------|-------------------------------------|

---

## Getting Help

**If you can't find what you need:**

1. **Search the manual** - Use Ctrl+F to search within the document
2. **Check troubleshooting sections** - Most guides have dedicated troubleshooting
3. **Review related guides** - Links provided at the end of each manual
4. **Contact support** - Reach out to your system administrator or team lead

---

## Contributing to Documentation

**Found an error or have a suggestion?**

Contact the development team or your system administrator with:
- Manual name and section
- Description of the issue or suggestion
- Screenshots if applicable

---

## Version History

| Date | Changes |
|------|---------|
| 2026-01-29 | Added vendor & project management guide |
| 2026-01-28 | Added check requisition creation guide |
| 2026-01-28 | Added invoice approval workflow guide |
| 2026-01-28 | Created user manuals directory and bulk invoice creation guide |

---

**Directory Structure:**
```
docs/
├── user-manuals/
│   ├── README.md (this file)
│   ├── bulk-invoice-creation.md ✅
│   ├── invoice-approval-workflow.md ✅
│   ├── check-requisition-creation.md ✅
│   ├── vendor-management.md ✅
│   ├── project-management.md ✅
│   └── [more guides coming soon]
└── [developer documentation]
```
