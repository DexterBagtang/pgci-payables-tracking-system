/**
 * Custom hook providing formatting utilities for Invoices
 * Follows React principles: Reusable formatting logic
 */
export function useInvoiceFormatters() {
    const formatCurrency = (amount, currency = 'PHP') => {
        const currencyCode = currency === 'USD' ? 'USD' : 'PHP';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Intl.DateTimeFormat('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(new Date(dateString));
    };

    const getStatusConfig = (status, hasFiles) => {
        switch (status) {
            case 'received':
                return {
                    label: 'Received',
                    variant: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
                    icon: 'FileCheck',
                };
            case 'under_review':
                return {
                    label: 'Review',
                    variant: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
                    icon: 'Clock',
                };
            case 'approved':
                return {
                    label: 'Approved',
                    variant: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
                    icon: 'CheckCircle2',
                };
            case 'rejected':
                return {
                    label: 'Rejected',
                    variant: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
                    icon: 'XCircle',
                };
            default:
                return {
                    label: status,
                    variant: 'bg-slate-500/10 text-slate-700 border-slate-500/20',
                    icon: 'Clock',
                };
        }
    };

    return {
        formatCurrency,
        formatDate,
        getStatusConfig
    };
}
