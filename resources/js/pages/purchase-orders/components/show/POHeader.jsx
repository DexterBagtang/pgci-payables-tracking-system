import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import StatusBadge from '@/components/custom/StatusBadge';
import BackButton from '@/components/custom/BackButton';
import { Link } from '@inertiajs/react';
import { Edit, Lock, AlertTriangle, Building2, Package, Calendar, User } from 'lucide-react';

/**
 * Purchase Order Header Component - Xero-Inspired Streamlined Design
 * Horizontal information flow with integrated progress tracking
 */
export default function POHeader({
    purchaseOrder,
    user,
    financialMetrics,
    formatDate,
    formatPercentage,
    onCloseClick,
    canWrite
}) {
    const getStatusConfig = (status) => {
        const configs = {
            'Open': { border: 'border-blue-500', bg: 'bg-blue-50/50', dark: 'dark:bg-blue-950/20' },
            'Closed': { border: 'border-gray-500', bg: 'bg-gray-50/50', dark: 'dark:bg-gray-900/20' },
            'Cancelled': { border: 'border-red-500', bg: 'bg-red-50/50', dark: 'dark:bg-red-950/20' },
        };
        return configs[status] || configs['Open'];
    };

    const statusConfig = getStatusConfig(purchaseOrder.po_status);

    return (
        <div className="space-y-2">
            {/* Top Bar: Title + Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="font-mono text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {purchaseOrder.po_number}
                    </h1>
                    <StatusBadge status={purchaseOrder.po_status} />
                    {financialMetrics.overdueInvoices > 0 && (
                        <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {financialMetrics.overdueInvoices} Overdue
                        </Badge>
                    )}
                </div>
                <div className="flex gap-2">
                    <BackButton />
                    {canWrite('purchase_orders') && (
                        <Link href={`/purchase-orders/${purchaseOrder.id}/edit`} prefetch>
                            <Button variant="outline" size="sm">
                                <Edit className="mr-1.5 h-3.5 w-3.5" />
                                Edit
                            </Button>
                        </Link>
                    )}
                    {(user.role === 'purchasing' || user.role === 'admin') &&
                        purchaseOrder.po_status !== 'closed' &&
                        purchaseOrder.po_status !== 'cancelled' && (
                        <Button variant="destructive" size="sm" onClick={onCloseClick}>
                            <Lock className="mr-1.5 h-3.5 w-3.5" />
                            Close
                        </Button>
                    )}
                </div>
            </div>

            {/* Info Cards Row */}
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {/* Vendor Card */}
                <div className="group rounded-md border border-gray-200 bg-white p-3 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-950">
                    <div className="flex items-start gap-2.5">
                        <div className="rounded-md bg-gray-100 p-1.5 dark:bg-gray-900">
                            <Building2 className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-500">Vendor</div>
                            <div className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {purchaseOrder.vendor?.name || 'No Vendor'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Project Card */}
                <div className="group rounded-md border border-gray-200 bg-white p-3 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-950">
                    <div className="flex items-start gap-2.5">
                        <div className="rounded-md bg-gray-100 p-1.5 dark:bg-gray-900">
                            <Package className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-500">Project</div>
                            <div className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {purchaseOrder.project?.project_title || 'No Project'}
                            </div>
                            {purchaseOrder.project?.cer_number && (
                                <div className="truncate font-mono text-xs text-gray-500">
                                    {purchaseOrder.project.cer_number}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Date Card */}
                <div className="group rounded-md border border-gray-200 bg-white p-3 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-950">
                    <div className="flex items-start gap-2.5">
                        <div className="rounded-md bg-gray-100 p-1.5 dark:bg-gray-900">
                            <Calendar className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-500">PO Date</div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {formatDate(purchaseOrder.po_date)}
                            </div>
                            <div className="text-xs text-gray-500">{financialMetrics.daysSincePO}d old</div>
                        </div>
                    </div>
                </div>

                {/* Created By Card */}
                <div className="group rounded-md border border-gray-200 bg-white p-3 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-950">
                    <div className="flex items-start gap-2.5">
                        <div className="rounded-md bg-gray-100 p-1.5 dark:bg-gray-900">
                            <User className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-500">Created By</div>
                            <div className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {purchaseOrder.creator?.name || 'Unknown'}
                            </div>
                            {purchaseOrder.created_at && (
                                <div className="text-xs text-gray-500">
                                    {formatDate(purchaseOrder.created_at)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar with Stats */}
            <div className={`rounded-lg border-2 ${statusConfig.border} ${statusConfig.bg} ${statusConfig.dark} p-3`}>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                            Completion
                        </div>
                        <div className={`text-xl font-bold tabular-nums ${
                            financialMetrics.completionPercentage >= 100 ? 'text-green-600 dark:text-green-400' :
                            financialMetrics.completionPercentage >= 75 ? 'text-blue-600 dark:text-blue-400' :
                            financialMetrics.completionPercentage >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-orange-600 dark:text-orange-400'
                        }`}>
                            {formatPercentage(financialMetrics.completionPercentage)}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                            ({financialMetrics.paidInvoices}/{financialMetrics.paidInvoices + financialMetrics.pendingInvoices} invoices)
                        </div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <Progress
                            value={Math.min(financialMetrics.completionPercentage, 100)}
                            className={`h-2.5 ${
                                financialMetrics.completionPercentage >= 100 ? '[&>div]:bg-green-500' :
                                financialMetrics.completionPercentage >= 75 ? '[&>div]:bg-blue-500' :
                                financialMetrics.completionPercentage >= 50 ? '[&>div]:bg-yellow-500' :
                                '[&>div]:bg-orange-500'
                            }`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
