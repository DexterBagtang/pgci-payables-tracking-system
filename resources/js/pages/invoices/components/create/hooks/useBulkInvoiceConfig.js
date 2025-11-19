import { useState, useCallback } from 'react';

/**
 * Custom hook to handle bulk invoice configuration and generation
 */
export function useBulkInvoiceConfig() {
    const [bulkInvoices, setBulkInvoices] = useState([]);
    const [bulkConfigured, setBulkConfigured] = useState(false);
    const [bulkConfig, setBulkConfig] = useState({
        count: 2,
        siPrefix: '',
        autoIncrementEnabled: false,
        startingNumber: 1,
        inputMode: 'manual', // 'manual' or 'range'
        rangeStart: '',
        rangeEnd: '',
        sharedFields: {
            purchase_order_id: true,
            currency: true,
            invoice_amount: false,
            si_date: false,
            si_received_at: false,
            terms_of_payment: false,
            other_payment_terms: false,
            submitted_to: true,
            submitted_at: true,
            due_date: false,
            notes: false,
        },
        sharedValues: {
            purchase_order_id: '',
            currency: 'PHP',
            invoice_amount: '',
            si_date: '',
            si_received_at: '',
            terms_of_payment: '',
            other_payment_terms: '',
            submitted_to: '',
            submitted_at: '',
            due_date: '',
            notes: '',
        },
    });

    // Create an empty invoice with auto-generated SI number
    const createEmptyInvoice = useCallback((index = 0) => {
        // Generate SI number based on input mode
        let siNumber = '';

        if (bulkConfig.inputMode === 'range') {
            // Range Mode: Use range numbers directly as SI numbers (no prefix, no padding)
            if (bulkConfig.rangeStart) {
                const rangeStartNum = parseInt(bulkConfig.rangeStart);
                siNumber = String(rangeStartNum + index);
            }
        } else {
            // Manual Mode: Use prefix with optional auto-increment
            if (bulkConfig.siPrefix) {
                if (bulkConfig.autoIncrementEnabled) {
                    const currentNumber = bulkConfig.startingNumber + index;
                    // Count digits in prefix to determine padding
                    const prefixMatch = bulkConfig.siPrefix.match(/0+$/);
                    const paddingLength = prefixMatch ? prefixMatch[0].length : 3; // Default to 3 if no zeros
                    siNumber = `${bulkConfig.siPrefix.replace(/0+$/, '')}${String(currentNumber).padStart(paddingLength, '0')}`;
                } else {
                    siNumber = bulkConfig.siPrefix;
                }
            }
        }

        // Always populate shared values for flexibility, regardless of sharedFields setting
        const invoice = {
            si_number: siNumber,
            si_date: bulkConfig.sharedValues.si_date || '',
            si_received_at: bulkConfig.sharedValues.si_received_at || '',
            invoice_amount: bulkConfig.sharedValues.invoice_amount || '',
            currency: bulkConfig.sharedValues.currency || 'PHP',
            terms_of_payment: bulkConfig.sharedValues.terms_of_payment || '',
            other_payment_terms: bulkConfig.sharedValues.other_payment_terms || '',
            due_date: bulkConfig.sharedValues.due_date || '',
            notes: bulkConfig.sharedValues.notes || '',
            files: [],
        };
        return invoice;
    }, [bulkConfig]);

    // Generate bulk invoices based on configuration
    const generateBulkInvoices = useCallback(() => {
        const newInvoices = [];
        for (let i = 0; i < bulkConfig.count; i++) {
            newInvoices.push(createEmptyInvoice(i));
        }
        setBulkInvoices(newInvoices);
        setBulkConfigured(true);
    }, [bulkConfig, createEmptyInvoice]);

    // Update a specific bulk invoice field
    const updateBulkInvoice = useCallback((index, field, value) => {
        setBulkInvoices((prev) => {
            // Only update if value actually changed
            if (prev[index][field] === value) return prev;

            const newInvoices = [...prev];
            newInvoices[index] = { ...newInvoices[index], [field]: value };
            return newInvoices;
        });
    }, []);

    // Delete bulk invoice
    const deleteBulkInvoice = useCallback((index) => {
        setBulkInvoices((prev) => {
            if (prev.length > 1) {
                return prev.filter((_, i) => i !== index);
            }
            return prev;
        });
    }, []);

    // Duplicate bulk invoice
    const duplicateBulkInvoice = useCallback((index) => {
        setBulkInvoices((prev) => {
            const invoiceToDuplicate = prev[index];
            return [...prev, { ...invoiceToDuplicate }];
        });
    }, []);

    // Reset bulk mode
    const resetBulkMode = useCallback(() => {
        setBulkConfigured(false);
        setBulkInvoices([]);
    }, []);

    // Reset bulk configuration to initial state
    const resetBulkConfig = useCallback(() => {
        setBulkConfig({
            count: 2,
            siPrefix: '',
            autoIncrementEnabled: false,
            startingNumber: 1,
            inputMode: 'manual',
            rangeStart: '',
            rangeEnd: '',
            sharedFields: {
                purchase_order_id: true,
                currency: true,
                invoice_amount: false,
                si_date: false,
                si_received_at: false,
                terms_of_payment: false,
                other_payment_terms: false,
                submitted_to: true,
                submitted_at: true,
                due_date: false,
                notes: false,
            },
            sharedValues: {
                purchase_order_id: '',
                currency: 'PHP',
                invoice_amount: '',
                si_date: '',
                si_received_at: '',
                terms_of_payment: '',
                other_payment_terms: '',
                submitted_to: '',
                submitted_at: '',
                due_date: '',
                notes: '',
            },
        });
        setBulkInvoices([]);
        setBulkConfigured(false);
    }, []);

    return {
        // State
        bulkInvoices,
        setBulkInvoices,
        bulkConfigured,
        setBulkConfigured,
        bulkConfig,
        setBulkConfig,

        // Functions
        createEmptyInvoice,
        generateBulkInvoices,
        updateBulkInvoice,
        deleteBulkInvoice,
        duplicateBulkInvoice,
        resetBulkMode,
        resetBulkConfig,
    };
}
