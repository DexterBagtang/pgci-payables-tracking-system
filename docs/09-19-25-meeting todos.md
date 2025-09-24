# Development TODOs Checklist - Post Meeting Requirements

## 1. Vendor Management System
- [x] **Payment Terms Field**: Change field label from "payment terms" to "terms"
- [x] **Name Formatting**: Implement automatic CAPS LOCK display for vendor names
- [x] **Contact Person Field**: Add dedicated contact person field with name and contact details
- [ ] **Vendor Dashboard**: Create comprehensive dashboard with complete vendor information breakdown
- [ ] **Financial Summary**: Add per-vendor financial summary section
- [ ] **Project History**: Implement project history and performance metrics tracking
- [ ] **Category Classification**: Add SAP vs Manual classification with clear indicators

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
- [ ] **Due Date Field**: Make due date field optional (remove required validation)
- [ ] **VAT Computation**: Implement automatic VAT calculation based on invoice amount
- [ ] **Submission Date**: Make submission date mandatory with validation
- [ ] **Submit To Field**: Make "Submit To" field mandatory with validation
- [ ] **Amount Percentage Field**: Add calculated field: (Invoice Amount / PO Amount) × 100
- [ ] **Received Date**: Move "Received Date" to "Filing of SI Details" section
- [ ] **Submit To Dropdown**: change input to dropdown options (Kimberly Usona, Joseph David Maderazo)
- [ ] **Terms of Payment**: Add dropdown field for payment terms selection (a. Downpayment
b. Progress Billing
c. Final Payment
d. Others (manual input)
)
- [ ] **Bulk Invoice Creation**: Add option to create multiple invoices simultaneously so user can add hundreds of invoice on single PO
- [ ] **Batch Processing**: Add batch processing capabilities

## 5. Check Requisition Management System
- [ ] **PDF Generation**: Implement save as PDF functionality
- [ ] **PDF Upper Section**: Include complete check requisition details in PDF upper section
- [ ] **PDF Lower Section**: Add blank space for additional notes/signatures in PDF lower section
- [ ] **Multi-Invoice Support**: Generate single check requisition for multiple invoices
- [ ] **Consolidated Summary**: Add consolidated invoice summary in check requisition
- [ ] **File Verification**: Check if all required files are received before allowing generation
- [ ] **File Status Validation**: Implement file status validation and alerts
- [ ] **Separate Review Process**: Implement separate review stage for check requisitions
- [ ] **Review Workflow**: Add review workflow with approval/rejection capabilities
- [ ] **Review Comments**: Add review comments and audit trail functionality

## Technical Implementation Tasks
- [ ] **Conditional Field Logic**: Ensure all conditional field logic is properly implemented
- [ ] **Field Validation**: Add proper validation for all required fields
- [ ] **Access Control**: Implement role-based access control for different modules
- [ ] **Audit Trails**: Create comprehensive audit trails for all transactions
- [ ] **Responsive UI**: Design responsive UI for all new dashboard views
- [ ] **Error Handling**: Implement proper error handling and user feedback systems

## Priority Order Checklist
### Phase 1 - Highest Impact
- [ ] Complete all Invoice Management updates

### Phase 2 - High Priority
- [ ] Complete all Vendor Management enhancements

### Phase 3 - Medium Priority
- [ ] Complete Project Management PHILCOM handling

### Phase 4 - Medium-Low Priority
- [ ] Complete Check Requisition PDF generation

### Phase 5 - Low Priority
- [ ] Complete Purchase Order financial status improvements

---

**Progress Tracking**: ☐ Not Started | ✓ Complete | ⚠️ In Progress | ❌ Blocked
