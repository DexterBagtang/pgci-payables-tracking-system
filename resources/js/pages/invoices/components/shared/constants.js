/**
 * Shared constants for invoice creation (single and bulk modes)
 */

export const submitToOptions = ['Kimberly Usona', 'Joseph David Maderazo'];

export const paymentTermsOptions = [
    { value: 'downpayment', label: 'Downpayment' },
    { value: 'progress_billing', label: 'Progress Billing' },
    { value: 'final_payment', label: 'Final Payment' },
    { value: 'others', label: 'Others' },
];

// Shared field options for bulk mode configuration
export const sharedFieldOptions = [
    { key: 'purchase_order_id', label: 'Purchase Order', required: true },
    { key: 'currency', label: 'Currency', required: true },
    { key: 'invoice_amount', label: 'Invoice Amount' },
    { key: 'si_date', label: 'SI Date' },
    { key: 'si_received_at', label: 'SI Received Date' },
    { key: 'terms_of_payment', label: 'Payment Terms' },
    { key: 'due_date', label: 'Due Date' },
    { key: 'submitted_to', label: 'Submit To', required: true },
    { key: 'submitted_at', label: 'Submission Date', required: true },
    { key: 'notes', label: 'Notes' },
];

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export const ALLOWED_FILE_TYPES = 'pdf,doc,docx,xls,xlsx,jpg,jpeg,png';
