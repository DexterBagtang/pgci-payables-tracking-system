import { useMemo } from 'react';

/**
 * Custom hook to calculate financial metrics for a Check Requisition
 * Follows React principles: Extract complex calculations into reusable hooks
 */
export function useCRFinancials(checkRequisition, invoices) {
    return useMemo(() => {
        // Get the correct amount based on currency
        const totalAmount = parseFloat(
            checkRequisition.currency === 'USD'
                ? checkRequisition.usd_amount
                : checkRequisition.php_amount
        ) || 0;

        // Calculate total from invoices
        const calculatedTotal = invoices?.reduce((sum, inv) => {
            return sum + (parseFloat(inv.net_amount) || 0);
        }, 0) || 0;

        // VAT calculations
        const vatExAmount = totalAmount / 1.12;
        const vatAmount = totalAmount - vatExAmount;

        // Invoice breakdown by status
        const invoicesByStatus = invoices?.reduce((acc, inv) => {
            const status = inv.invoice_status || 'pending';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {}) || {};

        // Invoice amounts by status
        const amountsByStatus = invoices?.reduce((acc, inv) => {
            const status = inv.invoice_status || 'pending';
            const amount = parseFloat(inv.net_amount) || 0;
            acc[status] = (acc[status] || 0) + amount;
            return acc;
        }, {}) || {};

        return {
            totalAmount,
            calculatedTotal,
            vatExAmount,
            vatAmount,
            invoiceCount: invoices?.length || 0,
            invoicesByStatus,
            amountsByStatus,
            amountDifference: Math.abs(totalAmount - calculatedTotal),
            isBalanced: Math.abs(totalAmount - calculatedTotal) < 0.01
        };
    }, [checkRequisition, invoices]);
}
