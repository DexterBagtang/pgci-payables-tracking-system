import { useMemo } from 'react';

/**
 * Custom hook to calculate financial metrics for a Purchase Order
 * Follows React principles: Extract complex calculations into reusable hooks
 */
export function usePOFinancials(purchaseOrder, invoices) {
    return useMemo(() => {
        const poAmount = parseFloat(purchaseOrder.po_amount) || 0;
        const vatExAmount = poAmount / 1.12;
        const vatAmount = (poAmount * 0.12) / 1.12;

        // Invoice calculations
        const totalInvoicedAmount = invoices?.reduce((sum, inv) => sum + (parseFloat(inv.invoice_amount) || 0), 0) || 0;
        const totalNetAmount = invoices?.reduce((sum, inv) => sum + (parseFloat(inv.net_amount) || 0), 0) || 0;
        const paidAmount = invoices?.reduce((sum, inv) =>
            inv.invoice_status === 'paid' ? sum + (parseFloat(inv.net_amount) || 0) : sum, 0) || 0;

        // Percentages
        const invoicedPercentage = poAmount > 0 ? (totalInvoicedAmount / poAmount) * 100 : 0;
        const paidPercentage = totalInvoicedAmount > 0 ? (paidAmount / totalInvoicedAmount) * 100 : 0;
        const completionPercentage = poAmount > 0 ? (paidAmount / poAmount) * 100 : 0;

        // Outstanding amounts
        const outstandingAmount = poAmount - paidAmount;
        const pendingInvoiceAmount = totalInvoicedAmount - paidAmount;

        // Invoice status counts
        const paidInvoices = invoices?.filter(inv => inv.invoice_status === 'paid').length || 0;
        const pendingInvoices = invoices?.filter(inv => inv.invoice_status === 'pending').length || 0;
        const overdueInvoices = invoices?.filter(inv => {
            if (!inv.due_date || inv.invoice_status === 'paid') return false;
            return new Date(inv.due_date) < new Date();
        }).length || 0;
        const approvedInvoices = invoices?.filter(inv => inv.status === 'approved' || inv.status === 'Approved').length || 0;

        // Days calculations
        const daysSincePO = purchaseOrder.po_date ?
            Math.floor((new Date() - new Date(purchaseOrder.po_date)) / (1000 * 60 * 60 * 24)) : 0;
        const daysToDelivery = purchaseOrder.expected_delivery_date ?
            Math.floor((new Date(purchaseOrder.expected_delivery_date) - new Date()) / (1000 * 60 * 60 * 24)) : null;

        // Utilization calculation
        const utilizationPercentage = poAmount > 0 ? (totalInvoicedAmount / poAmount) * 100 : 0;

        return {
            poAmount,
            vatExAmount,
            vatAmount,
            totalInvoicedAmount,
            totalNetAmount,
            paidAmount,
            outstandingAmount,
            pendingInvoiceAmount,
            invoicedPercentage,
            paidPercentage,
            completionPercentage,
            utilizationPercentage,
            paidInvoices,
            pendingInvoices,
            overdueInvoices,
            approvedInvoicesCount: approvedInvoices,
            daysSincePO,
            daysToDelivery,
            // Aliases for variation component compatibility
            totalAmount: poAmount,
            totalInvoiced: totalInvoicedAmount,
            remainingAmount: outstandingAmount,
        };
    }, [purchaseOrder, invoices]);
}
