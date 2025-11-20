import { format } from 'date-fns';

/**
 * Custom hook providing formatting utilities for Check Requisitions
 * Follows React principles: Reusable formatting logic
 */
export function useCRFormatters() {
    const formatCurrency = (amount, currency = 'PHP') => {
        if (!amount && amount !== 0) {
            return currency === 'USD' ? '$0.00' : '₱0.00';
        }
        const locale = currency === 'USD' ? 'en-US' : 'en-PH';
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (date) => {
        if (!date) return 'Not set';
        return format(new Date(date), 'MMM dd, yyyy');
    };

    const formatDateTime = (date) => {
        if (!date) return 'Not set';
        return format(new Date(date), 'MMM dd, yyyy HH:mm');
    };

    const getStatusColor = (status) => {
        const statusColors = {
            generated: 'bg-blue-100 text-blue-800 border-blue-200',
            approved: 'bg-green-100 text-green-800 border-green-200',
            rejected: 'bg-red-100 text-red-800 border-red-200',
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
        return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusIcon = (status) => {
        const icons = {
            generated: 'FileText',
            approved: 'CheckCircle',
            rejected: 'XCircle',
            pending: 'Clock',
            paid: 'DollarSign'
        };
        return icons[status?.toLowerCase()] || 'FileText';
    };

    return {
        formatCurrency,
        formatDate,
        formatDateTime,
        getStatusColor,
        getStatusIcon
    };
}
