import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook to handle invoice validation
 */
export function useInvoiceValidation() {
    const [errors, setErrors] = useState({});

    const errorCount = useMemo(() => Object.keys(errors).length, [errors]);

    const validate = useCallback((isBulkMode, bulkInvoices, bulkConfig, singleData) => {
        const newErrors = {};

        if (isBulkMode) {
            // Validate purchase order (required for all invoices)
            if (!bulkConfig.sharedValues.purchase_order_id) {
                newErrors.purchase_order_id = 'Purchase order is required';
            }

            // Validate each bulk invoice individually (since shared values can be edited)
            bulkInvoices.forEach((invoice, index) => {
                if (!invoice.si_number)
                    newErrors[`bulk_${index}_si_number`] = `Invoice ${index + 1}: SI Number is required`;
                if (!invoice.si_date)
                    newErrors[`bulk_${index}_si_date`] = `Invoice ${index + 1}: SI Date is required`;
                if (!invoice.invoice_amount)
                    newErrors[`bulk_${index}_invoice_amount`] = `Invoice ${index + 1}: Amount is required`;
                if (!invoice.terms_of_payment)
                    newErrors[`bulk_${index}_terms_of_payment`] = `Invoice ${index + 1}: Payment terms are required`;
                if (invoice.terms_of_payment === 'others' && !invoice.other_payment_terms) {
                    newErrors[`bulk_${index}_other_payment_terms`] = `Invoice ${index + 1}: Please specify other payment terms`;
                }
            });
        } else {
            // Validate single invoice
            if (!singleData.purchase_order_id) newErrors.purchase_order_id = 'Purchase order is required';
            if (!singleData.si_number) newErrors.si_number = 'SI Number is required';
            if (!singleData.si_date) newErrors.si_date = 'SI Date is required';
            if (!singleData.si_received_at) newErrors.si_received_at = 'SI Received Date is required';
            if (!singleData.invoice_amount) newErrors.invoice_amount = 'Invoice amount is required';
            if (!singleData.submitted_at) newErrors.submitted_at = 'Submission date is required';
            if (!singleData.submitted_to) newErrors.submitted_to = 'Submit to is required';
            if (!singleData.terms_of_payment) newErrors.terms_of_payment = 'Payment terms are required';
            if (singleData.terms_of_payment === 'others' && !singleData.other_payment_terms) {
                newErrors.other_payment_terms = 'Please specify other payment terms';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, []);

    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    return {
        errors,
        errorCount,
        validate,
        clearErrors,
        setErrors,
    };
}
