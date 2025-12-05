import { lazy, Suspense, useState } from 'react';
import { useRemember, usePage } from '@inertiajs/react';
import { TrendingUp, TrendingDown, Minus, Building2, Package, Calendar, User, Hash, Coins, MessageSquare, Image as ImageIcon, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { usePOFinancials } from '../../hooks/usePOFinancials';
import { usePOFormatters } from '../../hooks/usePOFormatters';

const ActivityTimeline = lazy(() => import('@/components/custom/ActivityTimeline.jsx'));
const AttachmentViewer = lazy(() => import('@/pages/invoices/components/AttachmentViewer.jsx'));
const Remarks = lazy(() => import('@/components/custom/Remarks.jsx'));
const ClosePurchaseOrderDialog = lazy(() => import('@/pages/purchase-orders/components/ClosePurchaseOrderDialog.jsx'));

/**
 * VARIATION C: Modern Compact Grid (Xero-inspired)
 * - Horizontal grid layout
 * - Color-coded sections
 * - Maximum space efficiency
 * - Modern, clean aesthetic
 * - Responsive multi-column design
 */
export default function PODetailsVariationC({ purchaseOrder, vendors, projects, backUrl }) {
    const [tab, setTab] = useRemember('details', 'po-detail-tab');
    const [showCloseDialog, setShowCloseDialog] = useState(false);
    const { user } = usePage().props.auth;

    // Destructure purchase order data - same as original
    const { files, activity_logs, invoices, remarks } = purchaseOrder;

    const financialMetrics = usePOFinancials(purchaseOrder, invoices);
    const { formatCurrency, formatDate, formatPercentage } = usePOFormatters();

    const getStatusConfig = (status) => {
        const configs = {
            'Open': { bg: 'bg-blue-500', text: 'text-blue-700', lightBg: 'bg-blue-50' },
            'Closed': { bg: 'bg-gray-500', text: 'text-gray-700', lightBg: 'bg-gray-50' },
            'Cancelled': { bg: 'bg-red-500', text: 'text-red-700', lightBg: 'bg-red-50' },
        };
        return configs[status] || configs['Open'];
    };

    const statusConfig = getStatusConfig(purchaseOrder.status);

    return (
        <>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
                {/* Compact Header Bar */}
                <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                    <div className="mx-auto max-w-[1800px] px-4 py-3 sm:px-6 lg:px-8">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            {/* Left: PO Info */}
                            <div className="flex items-center gap-4">
                                <div className={`h-10 w-1 rounded-full ${statusConfig.bg}`}></div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="font-mono text-lg font-bold text-gray-900 dark:text-gray-100">
                                            {purchaseOrder.po_number}
                                        </h1>
                                        <Badge variant="outline" className={`${statusConfig.lightBg} ${statusConfig.text} border-0 text-xs font-semibold`}>
                                            {purchaseOrder.status}
                                        </Badge>
                                    </div>
                                    <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                        <Building2 className="h-3 w-3" />
                                        <span className="font-medium">{purchaseOrder.vendor?.name}</span>
                                        <span className="text-gray-400">•</span>
                                        <Package className="h-3 w-3" />
                                        <span>{purchaseOrder.project?.name}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Key Metrics - Horizontal */}
                            <div className="hidden gap-6 lg:flex">
                                <div>
                                    <div className="text-xs text-gray-500">Total</div>
                                    <div className="font-mono text-lg font-bold text-gray-900 dark:text-gray-100">
                                        {formatCurrency(financialMetrics.totalAmount, purchaseOrder.currency)}
                                    </div>
                                </div>
                                <Separator orientation="vertical" className="h-10" />
                                <div>
                                    <div className="text-xs text-gray-500">Invoiced</div>
                                    <div className="font-mono text-lg font-bold text-blue-600">
                                        {formatCurrency(financialMetrics.totalInvoiced, purchaseOrder.currency)}
                                    </div>
                                </div>
                                <Separator orientation="vertical" className="h-10" />
                                <div>
                                    <div className="text-xs text-gray-500">Remaining</div>
                                    <div className="font-mono text-lg font-bold text-orange-600">
                                        {formatCurrency(financialMetrics.remainingAmount, purchaseOrder.currency)}
                                    </div>
                                </div>
                                <Separator orientation="vertical" className="h-10" />
                                <div>
                                    <div className="text-xs text-gray-500">Utilization</div>
                                    <div className="flex items-center gap-2">
                                        <div className="font-mono text-lg font-bold text-green-600">
                                            {formatPercentage(financialMetrics.utilizationPercentage)}
                                        </div>
                                        {financialMetrics.utilizationPercentage > 75 && <TrendingUp className="h-4 w-4 text-green-600" />}
                                        {financialMetrics.utilizationPercentage < 25 && <TrendingDown className="h-4 w-4 text-red-600" />}
                                        {financialMetrics.utilizationPercentage >= 25 && financialMetrics.utilizationPercentage <= 75 && <Minus className="h-4 w-4 text-yellow-600" />}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3">
                            <Progress value={financialMetrics.utilizationPercentage} className="h-1.5" />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
                    {/* Tabs */}
                    <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                        {[
                            { id: 'details', label: 'Details & Summary', icon: Hash },
                            { id: 'invoices', label: `Invoices (${invoices?.length || 0})`, icon: Coins },
                            { id: 'files', label: `Files (${files?.length || 0})`, icon: ImageIcon },
                            { id: 'notes', label: `Notes (${remarks?.length || 0})`, icon: MessageSquare },
                            { id: 'history', label: 'History', icon: Activity },
                        ].map((item) => {
                            const Icon = item.icon;
                            const isActive = tab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setTab(item.id)}
                                    className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                        isActive
                                            ? 'bg-gray-900 text-white shadow-sm dark:bg-white dark:text-gray-900'
                                            : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    {tab === 'details' && (
                        <div className="space-y-6">
                            {/* Info Grid - Compact 5 columns on XL */}
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
                                        {purchaseOrder.created_by?.name}
                                    </div>
                                </div>
                            </div>

                            {/* Financial Summary Cards - 5 columns on LG */}
                            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                                <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm dark:border-gray-800 dark:from-gray-900 dark:to-gray-950">
                                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Amount</div>
                                    <div className="mt-1 font-mono text-xl font-bold text-gray-900 dark:text-gray-100">
                                        {formatCurrency(financialMetrics.totalAmount, purchaseOrder.currency)}
                                    </div>
                                </div>
                                <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm dark:border-blue-900 dark:from-blue-950 dark:to-gray-950">
                                    <div className="text-xs font-medium text-blue-700 dark:text-blue-400">Total Invoiced</div>
                                    <div className="mt-1 font-mono text-xl font-bold text-blue-900 dark:text-blue-300">
                                        {formatCurrency(financialMetrics.totalInvoiced, purchaseOrder.currency)}
                                    </div>
                                </div>
                                <div className="rounded-lg border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-4 shadow-sm dark:border-orange-900 dark:from-orange-950 dark:to-gray-950">
                                    <div className="text-xs font-medium text-orange-700 dark:text-orange-400">Remaining</div>
                                    <div className="mt-1 font-mono text-xl font-bold text-orange-900 dark:text-orange-300">
                                        {formatCurrency(financialMetrics.remainingAmount, purchaseOrder.currency)}
                                    </div>
                                </div>
                                <div className="rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-white p-4 shadow-sm dark:border-green-900 dark:from-green-950 dark:to-gray-950">
                                    <div className="text-xs font-medium text-green-700 dark:text-green-400">Utilization</div>
                                    <div className="mt-1 font-mono text-xl font-bold text-green-900 dark:text-green-300">
                                        {formatPercentage(financialMetrics.utilizationPercentage)}
                                    </div>
                                </div>
                                <div className="rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-4 shadow-sm dark:border-purple-900 dark:from-purple-950 dark:to-gray-950">
                                    <div className="text-xs font-medium text-purple-700 dark:text-purple-400">Total Invoices</div>
                                    <div className="mt-1 text-xl font-bold text-purple-900 dark:text-purple-300">
                                        {invoices?.length || 0}
                                    </div>
                                    <div className="mt-1 text-xs text-purple-600 dark:text-purple-400">
                                        {financialMetrics.approvedInvoicesCount} approved
                                    </div>
                                </div>
                            </div>

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
                                                    {purchaseOrder.vendor?.name}
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
                                                    {purchaseOrder.project?.name}
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
                            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                                <div className="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-3 dark:border-gray-800 dark:from-purple-950 dark:to-purple-900">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Coins className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                            <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100">Recent Invoices</h3>
                                        </div>
                                        <Badge variant="outline" className="bg-white text-xs dark:bg-gray-900">
                                            {invoices?.length || 0} total
                                        </Badge>
                                    </div>
                                </div>
                                {invoices && invoices.length > 0 ? (
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
                                ) : (
                                    <div className="p-6 text-center text-sm text-gray-500">
                                        No invoices yet
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Invoices Tab */}
                    {tab === 'invoices' && (
                        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            {invoices && invoices.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-850">
                                            <tr>
                                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Invoice Number</th>
                                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Invoice Date</th>
                                                <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {invoices.map((invoice) => (
                                                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-850">
                                                    <td className="px-4 py-2.5 font-mono text-gray-900 dark:text-gray-100">{invoice.invoice_number}</td>
                                                    <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{formatDate(invoice.invoice_date)}</td>
                                                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-gray-900 dark:text-gray-100">
                                                        {formatCurrency(invoice.total_amount, purchaseOrder.currency)}
                                                    </td>
                                                    <td className="px-4 py-2.5">
                                                        <Badge variant="outline" className="text-xs">{invoice.status}</Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-sm text-gray-500">
                                    No invoices found
                                </div>
                            )}
                        </div>
                    )}

                    {/* Files Tab */}
                    {tab === 'files' && (
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <Suspense fallback={<Skeleton className="h-64" />}>
                                <AttachmentViewer files={files || []} />
                            </Suspense>
                        </div>
                    )}

                    {/* Notes Tab */}
                    {tab === 'notes' && (
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <Suspense fallback={<Skeleton className="h-64" />}>
                                <Remarks remarks={remarks} remarkableType="PurchaseOrder" remarkableId={purchaseOrder.id} />
                            </Suspense>
                        </div>
                    )}

                    {/* History Tab */}
                    {tab === 'history' && (
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <Suspense fallback={<Skeleton className="h-64" />}>
                                <ActivityTimeline activity_logs={activity_logs} title="Purchase Order Timeline" entityType="Purchase Order" />
                            </Suspense>
                        </div>
                    )}
                </div>
            </div>

            <Suspense fallback={null}>
                <ClosePurchaseOrderDialog open={showCloseDialog} onOpenChange={setShowCloseDialog} purchaseOrder={purchaseOrder} />
            </Suspense>
        </>
    );
}
