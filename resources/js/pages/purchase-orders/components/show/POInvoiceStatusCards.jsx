import { Receipt, CheckCircle, Clock, AlertCircle } from 'lucide-react';

/**
 * Invoice Status Overview Cards - Compact Design
 * Displays total, paid, pending, and overdue invoice counts
 * Following compact grid variation's visual design
 */
export default function POInvoiceStatusCards({ financialMetrics, totalInvoices }) {
    return (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {/* Total Invoices */}
            <div className="rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-4 shadow-sm dark:border-purple-900 dark:from-purple-950 dark:to-gray-950">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-medium text-purple-700 dark:text-purple-400">Total Invoices</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                        {totalInvoices}
                    </div>
                </div>
                <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                    {financialMetrics.approvedInvoicesCount} approved
                </div>
            </div>

            {/* Paid Invoices */}
            <div className="rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-white p-4 shadow-sm dark:border-green-900 dark:from-green-950 dark:to-gray-950">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-xs font-medium text-green-700 dark:text-green-400">Paid</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-300">
                        {financialMetrics.paidInvoices}
                    </div>
                </div>
                <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                    {totalInvoices > 0
                        ? `${Math.round((financialMetrics.paidInvoices / totalInvoices) * 100)}% of total`
                        : 'No invoices yet'}
                </div>
            </div>

            {/* Pending Invoices */}
            <div className="rounded-lg border border-yellow-200 bg-gradient-to-br from-yellow-50 to-white p-4 shadow-sm dark:border-yellow-900 dark:from-yellow-950 dark:to-gray-950">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">Pending</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-300">
                        {financialMetrics.pendingInvoices}
                    </div>
                </div>
                <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                    {totalInvoices > 0
                        ? `${Math.round((financialMetrics.pendingInvoices / totalInvoices) * 100)}% of total`
                        : 'No invoices yet'}
                </div>
            </div>

            {/* Overdue Invoices */}
            <div className="rounded-lg border border-red-200 bg-gradient-to-br from-red-50 to-white p-4 shadow-sm dark:border-red-900 dark:from-red-950 dark:to-gray-950">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <span className="text-xs font-medium text-red-700 dark:text-red-400">Overdue</span>
                    </div>
                    <div className="text-2xl font-bold text-red-900 dark:text-red-300">
                        {financialMetrics.overdueInvoices}
                    </div>
                </div>
                <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                    {financialMetrics.overdueInvoices > 0
                        ? 'Requires attention'
                        : 'All on track'}
                </div>
            </div>
        </div>
    );
}
