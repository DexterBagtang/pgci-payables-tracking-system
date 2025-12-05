import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

/**
 * Financial Metrics Dashboard Cards - Compact Design
 * Displays PO Amount, Invoiced, Paid, Outstanding, and Completion metrics
 * Following compact grid variation's visual design
 */
export default function POFinancialCards({ financialMetrics, currency, formatCurrency, formatPercentage }) {
    return (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {/* PO Amount */}
            <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm dark:border-gray-800 dark:from-gray-900 dark:to-gray-950">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">PO Amount</div>
                <div className="mt-1 font-mono text-xl font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(financialMetrics.poAmount, currency)}
                </div>
                <div className="mt-2 space-y-0.5 text-xs text-gray-500 dark:text-gray-500">
                    <div>VAT Ex: {formatCurrency(financialMetrics.vatExAmount, currency)}</div>
                    <div>VAT (12%): {formatCurrency(financialMetrics.vatAmount, currency)}</div>
                </div>
            </div>

            {/* Invoiced */}
            <div className="rounded-lg border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-4 shadow-sm dark:border-orange-900 dark:from-orange-950 dark:to-gray-950">
                <div className="text-xs font-medium text-orange-700 dark:text-orange-400">Invoiced</div>
                <div className="mt-1 font-mono text-xl font-bold text-orange-900 dark:text-orange-300">
                    {financialMetrics.totalInvoicedAmount > 0
                        ? formatCurrency(financialMetrics.totalInvoicedAmount, currency)
                        : <span className="text-gray-400">{currency === 'USD' ? '$0.00' : '₱0.00'}</span>}
                </div>
                <div className="mt-2 space-y-1">
                    <Progress
                        value={Math.min(financialMetrics.invoicedPercentage, 100)}
                        className={`h-1.5 ${
                            financialMetrics.invoicedPercentage >= 80 ? '[&>div]:bg-green-600' :
                            financialMetrics.invoicedPercentage >= 50 ? '[&>div]:bg-yellow-600' :
                            '[&>div]:bg-orange-600'
                        }`}
                    />
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">of PO</span>
                        <span className="font-semibold text-orange-700 dark:text-orange-400">
                            {formatPercentage(financialMetrics.invoicedPercentage)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Paid */}
            <div className="rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-white p-4 shadow-sm dark:border-green-900 dark:from-green-950 dark:to-gray-950">
                <div className="text-xs font-medium text-green-700 dark:text-green-400">Paid</div>
                <div className="mt-1 font-mono text-xl font-bold text-green-900 dark:text-green-300">
                    {financialMetrics.paidAmount > 0
                        ? formatCurrency(financialMetrics.paidAmount, currency)
                        : <span className="text-gray-400">{currency === 'USD' ? '$0.00' : '₱0.00'}</span>}
                </div>
                <div className="mt-2 space-y-1">
                    <Progress
                        value={Math.min(financialMetrics.paidPercentage, 100)}
                        className={`h-1.5 ${
                            financialMetrics.paidPercentage >= 90 ? '[&>div]:bg-green-600' :
                            financialMetrics.paidPercentage >= 70 ? '[&>div]:bg-blue-600' :
                            financialMetrics.paidPercentage >= 30 ? '[&>div]:bg-yellow-600' :
                            '[&>div]:bg-red-600'
                        }`}
                    />
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">of Invoiced</span>
                        <span className="font-semibold text-green-700 dark:text-green-400">
                            {formatPercentage(financialMetrics.paidPercentage)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Outstanding */}
            <div className="rounded-lg border border-red-200 bg-gradient-to-br from-red-50 to-white p-4 shadow-sm dark:border-red-900 dark:from-red-950 dark:to-gray-950">
                <div className="text-xs font-medium text-red-700 dark:text-red-400">Outstanding</div>
                <div className={`mt-1 font-mono text-xl font-bold ${
                    financialMetrics.outstandingAmount > 0
                        ? 'text-red-900 dark:text-red-300'
                        : 'text-green-900 dark:text-green-300'
                }`}>
                    {formatCurrency(financialMetrics.outstandingAmount, currency)}
                </div>
                <div className="mt-2 space-y-1.5">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Pending:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(financialMetrics.pendingInvoiceAmount, currency)}
                        </span>
                    </div>
                    <Badge
                        variant={financialMetrics.outstandingAmount === 0 ? 'default' : 'destructive'}
                        className="w-full justify-center text-xs"
                    >
                        {financialMetrics.outstandingAmount === 0 ? 'Fully Paid' : 'Pending'}
                    </Badge>
                </div>
            </div>

            {/* Completion */}
            <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm dark:border-blue-900 dark:from-blue-950 dark:to-gray-950">
                <div className="text-xs font-medium text-blue-700 dark:text-blue-400">Completion</div>
                <div className="mt-1 font-mono text-xl font-bold text-blue-900 dark:text-blue-300">
                    {formatPercentage(financialMetrics.completionPercentage)}
                </div>
                <div className="mt-2 space-y-1">
                    <Progress
                        value={Math.min(financialMetrics.completionPercentage, 100)}
                        className={`h-1.5 ${
                            financialMetrics.completionPercentage >= 100 ? '[&>div]:bg-green-600' :
                            financialMetrics.completionPercentage >= 75 ? '[&>div]:bg-blue-600' :
                            financialMetrics.completionPercentage >= 50 ? '[&>div]:bg-yellow-600' :
                            '[&>div]:bg-red-600'
                        }`}
                    />
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Invoices:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                            {financialMetrics.paidInvoices + financialMetrics.pendingInvoices}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
