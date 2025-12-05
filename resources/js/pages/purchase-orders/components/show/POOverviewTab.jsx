import { Badge } from '@/components/ui/badge';
import { Hash, Calendar, Package, Coins, User, Building2 } from 'lucide-react';

/**
 * Overview Tab Content - Compact Grid Design
 * Shows comprehensive PO information following compact variation layout
 */
export default function POOverviewTab({ purchaseOrder, formatDate, formatCurrency, invoices }) {
    return (
        <div className="space-y-6">
            {/* Info Grid - Compact 5 columns */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="mb-1 flex items-center gap-1 text-xs text-gray-500">
                        <Hash className="h-3 w-3" />
                        <span>PO Number</span>
                    </div>
                    <div className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {purchaseOrder.po_number}
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="mb-1 flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>PO Date</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {formatDate(purchaseOrder.po_date)}
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="mb-1 flex items-center gap-1 text-xs text-gray-500">
                        <Package className="h-3 w-3" />
                        <span>Total Items</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {purchaseOrder.line_items?.length || 0}
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="mb-1 flex items-center gap-1 text-xs text-gray-500">
                        <Coins className="h-3 w-3" />
                        <span>Currency</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {purchaseOrder.currency}
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="mb-1 flex items-center gap-1 text-xs text-gray-500">
                        <User className="h-3 w-3" />
                        <span>Created By</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {purchaseOrder.created_by?.name || 'N/A'}
                    </div>
                </div>
            </div>

            {/* Description Section (if available) */}
            {purchaseOrder.description && (
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">Description</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        {purchaseOrder.description}
                    </div>
                </div>
            )}

            {/* Vendor & Project Details */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Vendor Information Card */}
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 dark:border-gray-800 dark:from-blue-950 dark:to-blue-900">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Vendor Details</h3>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="space-y-3">
                            <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Vendor Name</div>
                                <div className="mt-0.5 text-base font-semibold text-gray-900 dark:text-gray-100">
                                    {purchaseOrder.vendor?.name || 'N/A'}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Contact Person</div>
                                    <div className="mt-0.5 text-sm text-gray-900 dark:text-gray-100">
                                        {purchaseOrder.vendor?.contact_person || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Contact Number</div>
                                    <div className="mt-0.5 text-sm text-gray-900 dark:text-gray-100">
                                        {purchaseOrder.vendor?.contact_number || 'N/A'}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Email</div>
                                <div className="mt-0.5 text-sm text-gray-900 dark:text-gray-100">
                                    {purchaseOrder.vendor?.email || 'N/A'}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Address</div>
                                <div className="mt-0.5 text-sm text-gray-900 dark:text-gray-100">
                                    {purchaseOrder.vendor?.address || 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Project Information Card */}
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100 px-4 py-3 dark:border-gray-800 dark:from-green-950 dark:to-green-900">
                        <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <h3 className="text-sm font-semibold text-green-900 dark:text-green-100">Project Details</h3>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="space-y-3">
                            <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Project Name</div>
                                <div className="mt-0.5 text-base font-semibold text-gray-900 dark:text-gray-100">
                                    {purchaseOrder.project?.project_title || 'N/A'}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Project Code</div>
                                    <div className="mt-0.5 font-mono text-sm text-gray-900 dark:text-gray-100">
                                        {purchaseOrder.project?.code || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Status</div>
                                    <div className="mt-0.5 text-sm text-gray-900 dark:text-gray-100">
                                        {purchaseOrder.project?.status || 'N/A'}
                                    </div>
                                </div>
                            </div>
                            {purchaseOrder.project?.cer_number && (
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">CER Number</div>
                                    <div className="mt-0.5 font-mono text-sm text-gray-900 dark:text-gray-100">
                                        {purchaseOrder.project.cer_number}
                                    </div>
                                </div>
                            )}
                            <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Description</div>
                                <div className="mt-0.5 text-sm text-gray-900 dark:text-gray-100">
                                    {purchaseOrder.project?.description || 'No description available'}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Location</div>
                                <div className="mt-0.5 text-sm text-gray-900 dark:text-gray-100">
                                    {purchaseOrder.project?.location || 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Invoices Summary */}
            {invoices && invoices.length > 0 && (
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
                                            {invoice.invoice_number}
                                        </span>
                                        <Badge variant="outline" className="text-xs">
                                            {invoice.status}
                                        </Badge>
                                    </div>
                                    <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                                        {formatDate(invoice.invoice_date)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {formatCurrency(invoice.total_amount, purchaseOrder.currency)}
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
            )}
        </div>
    );
}
