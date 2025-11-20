import { format } from 'date-fns';

/**
 * Custom hook providing formatting utilities for Purchase Orders
 * Follows React principles: Reusable formatting logic
 */
export function usePOFormatters() {
    const formatCurrency = (amount, currency = 'PHP') => {
        if (!amount) {
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

    const formatPercentage = (value) => {
        if (isNaN(value) || !isFinite(value)) return '0%';
        return `${Math.round(value * 100) / 100}%`;
    };

    const getStatusColor = (status) => {
        const statusColors = {
            draft: 'bg-gray-100 text-gray-800 border-gray-200',
            open: 'bg-blue-100 text-blue-800 border-blue-200',
            closed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200',
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            paid: 'bg-green-100 text-green-800 border-green-200',
        };
        return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    return {
        formatCurrency,
        formatDate,
        formatPercentage,
        getStatusColor
    };
}
