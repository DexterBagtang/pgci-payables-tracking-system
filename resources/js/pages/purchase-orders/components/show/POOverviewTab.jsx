import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/custom/StatusBadge';
import { Coins, FileText } from 'lucide-react';

/**
 * Overview Tab Content - Compact Design
 * Shows PO description and recent invoices list
 * Financial metrics shown above in POFinancialCards
 * Vendor/Project info shown in POHeader
 */
export default function POOverviewTab({ purchaseOrder, formatDate, formatCurrency, invoices }) {
    return (
        <div className="space-y-4">
            {/* Description Section (if available) */}
            {purchaseOrder.description && (
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Purchase Order Description</div>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        {purchaseOrder.description}
                    </div>
                </div>
            )}

            {/* Recent Invoices List */}
            {invoices && invoices.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-3 dark:border-gray-800 dark:from-purple-950 dark:to-purple-900">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Coins className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100">Recent Invoices</h3>
                            </div>
                            <Badge variant="outline" className="bg-white text-xs dark:bg-gray-900">
                                {invoices.length} total
                            </Badge>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {invoices.slice(0, 5).map((invoice) => (
                            <div key={invoice.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-850">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {invoice.si_number}
                                        </span>
                                        <StatusBadge status={invoice.invoice_status} size="xs" />
                                    </div>
                                    <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                                        {formatDate(invoice.si_date)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {formatCurrency(invoice.net_amount, purchaseOrder.currency)}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {invoices.length > 5 && (
                            <div className="bg-gray-50 p-3 text-center text-xs text-gray-600 dark:bg-gray-850 dark:text-gray-400">
                                +{invoices.length - 5} more invoices
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-900">
                    <Coins className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
                    <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">No invoices yet</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                        Invoices will appear here once they are created for this purchase order
                    </p>
                </div>
            )}
        </div>
    );
}
