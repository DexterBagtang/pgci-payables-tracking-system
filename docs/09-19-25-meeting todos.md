# Development TODOs Checklist - Post Meeting Requirements

## 1. Vendor Management System
- [x] **Payment Terms Field**: Change field label from "payment terms" to "terms"
- [x] **Name Formatting**: Implement automatic CAPS LOCK display for vendor names
- [x] **Contact Person Field**: Add dedicated contact person field with name and contact details
- [x] **Vendor Dashboard**: Create comprehensive dashboard with complete vendor information breakdown
- [x] **Financial Summary**: Add per-vendor financial summary section
- [ ] **Project History**: Implement project history and performance metrics tracking
- [x] **Category Classification**: Add SAP vs Manual classification with clear indicators

## 2. Project Management System
- [x] **PHILCOM Contract Cost**: Hide/disable contract cost field when project type is "PHILCOM"
- [x] **Conditional Field Logic**: Implement conditional field display logic for project types
- [x] **Project Type Selector**: Move project type selector near project title for better visibility
- [x] **Team Field**: Add dedicated Team Field for project team assignments
- [x] **Project Dashboard**: Create overall project dashboard with financial summary
- [x] **Progress Tracking**: Add progress tracking and milestone indicators
- [ ] **Document Integration**: Integrate document management system

## 3. Purchase Order Management System
- [x] **Detailed Financial Breakdown**: Enhance financial breakdown with detailed status indicators
- [x] **Budget Comparison**: Add budget vs actual spending comparison feature

## 4. Invoice Management System
- [x] **Due Date Field**: Make due date field optional (remove required validation)
- [x] **VAT Computation**: Implement automatic VAT calculation based on invoice amount
- [x] **Submission Date**: Make submission date mandatory with validation
- [x] **Submit To Field**: Make "Submit To" field mandatory with validation
- [x] **Amount Percentage Field**: Add calculated field: (Invoice Amount / PO Amount) × 100
- [x] **Received Date**: Move "Received Date" to "Filing of SI Details" section
- [x] **Submit To Dropdown**: change input to dropdown options (Kimberly Usona, Joseph David Maderazo)
- [x] **Terms of Payment**: Add dropdown field for payment terms selection (a. Downpayment
b. Progress Billing
c. Final Payment
d. Others (manual input)
)
- [x] **Bulk Invoice Creation**: Add option to create multiple invoices simultaneously so user can add hundreds of invoice on single PO

## 5. Check Requisition Management System
- [x] **PDF Generation**: Implement save as PDF functionality
- [x] **PDF Upper Section**: Include complete check requisition details in PDF upper section
- [x] **PDF Lower Section**: Add blank space for additional notes/signatures in PDF lower section
- [x] **Multi-Invoice Support**: Generate single check requisition for multiple invoices
- [x] **Consolidated Summary**: Add consolidated invoice summary in check requisition
- [x] **File Verification**: Check if all required files are received before allowing generation
- [x] **File Status Validation**: Implement file status validation and alerts
- [x] **Separate Review Process**: Implement separate review stage for check requisitions
- [x] **Review Workflow**: Add review workflow with approval/rejection capabilities
- [x] **Review Comments**: Add review comments and audit trail functionality
