import { useState, useCallback } from 'react';
import { generateInvoiceSequence, parseInvoiceNumber, formatInvoiceNumber } from '@/pages/invoices/components/create/utils/rangeParser.js';

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
        inputMode: 'range', // 'manual' or 'range' - default is 'range'
        rangeStart: '',
        rangeEnd: '',
        sharedFields: {
            invoice_type: true,
            purchase_order_id: true,
            vendor_id: true,
            project_id: true,
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
            invoice_type: 'purchase_order',
            purchase_order_id: '',
            vendor_id: '',
            project_id: '',
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
    const createEmptyInvoice = useCallback((index = 0, siNumber = '') => {
        // Generate SI number based on input mode (if not provided)
        if (!siNumber) {
            if (bulkConfig.inputMode === 'manual') {
                // Manual Mode: Use starting number with optional auto-increment
                if (bulkConfig.siPrefix) {
                    if (bulkConfig.autoIncrementEnabled) {
                        // Parse the starting invoice number (supports alphanumeric like "INV-334" or "0010")
                        const parsed = parseInvoiceNumber(bulkConfig.siPrefix);

                        if (parsed) {
                            // Increment the numeric part while preserving format
                            const currentNumber = parsed.numericValue + index;
                            siNumber = formatInvoiceNumber(parsed.prefix, currentNumber, parsed.padding);
                        } else {
                            // Fallback: if parsing fails, use the prefix as-is
                            siNumber = bulkConfig.siPrefix;
                        }
                    } else {
                        siNumber = bulkConfig.siPrefix;
                    }
                }
            }
            // Range mode will be handled by generateBulkInvoices passing siNumber directly
        }

        // Always populate shared values for flexibility, regardless of sharedFields setting
        const invoice = {
            invoice_type: bulkConfig.sharedValues.invoice_type || 'purchase_order',
            purchase_order_id: bulkConfig.sharedValues.purchase_order_id || '',
            vendor_id: bulkConfig.sharedValues.vendor_id || '',
            project_id: bulkConfig.sharedValues.project_id || '',
            si_number: siNumber,
            si_date: bulkConfig.sharedValues.si_date || '',
            si_received_at: bulkConfig.sharedValues.si_received_at || '',
            invoice_amount: bulkConfig.sharedValues.invoice_amount || '',
            currency: bulkConfig.sharedValues.currency || 'PHP',
            terms_of_payment: bulkConfig.sharedValues.terms_of_payment || '',
            other_payment_terms: bulkConfig.sharedValues.other_payment_terms || '',
            due_date: bulkConfig.sharedValues.due_date || '',
            submitted_at: bulkConfig.sharedValues.submitted_at || '',
            submitted_to: bulkConfig.sharedValues.submitted_to || '',
            notes: bulkConfig.sharedValues.notes || '',
            files: [],
        };
        return invoice;
    }, [bulkConfig]);

    // Generate bulk invoices based on configuration
    const generateBulkInvoices = useCallback(() => {
        const newInvoices = [];

        // Generate SI numbers for range mode
        let siNumbers = [];
        if (bulkConfig.inputMode === 'range' && bulkConfig.rangeStart && bulkConfig.rangeEnd) {
            siNumbers = generateInvoiceSequence(bulkConfig.rangeStart, bulkConfig.rangeEnd);
        }

        // Create invoices
        for (let i = 0; i < bulkConfig.count; i++) {
            // For range mode, pass the pre-generated SI number
            const siNumber = bulkConfig.inputMode === 'range' ? siNumbers[i] : '';
            newInvoices.push(createEmptyInvoice(i, siNumber));
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
            inputMode: 'range',
            rangeStart: '',
            rangeEnd: '',
            sharedFields: {
                invoice_type: true,
                purchase_order_id: true,
                vendor_id: true,
                project_id: true,
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
                invoice_type: 'purchase_order',
                purchase_order_id: '',
                vendor_id: '',
                project_id: '',
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
