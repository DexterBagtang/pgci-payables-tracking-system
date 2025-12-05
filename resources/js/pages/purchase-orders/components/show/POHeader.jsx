import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/custom/StatusBadge';
import BackButton from '@/components/custom/BackButton';
import { Link } from '@inertiajs/react';
import { Edit, Lock, AlertTriangle, Building2, Package } from 'lucide-react';

/**
 * Purchase Order Header Component - Compact Version
 * Consolidates key identification information without redundancy
 * Includes: PO info, vendor, project, timeline, actions
 */
export default function POHeader({
    purchaseOrder,
    user,
    financialMetrics,
    formatDate,
    onCloseClick
}) {
    const getStatusConfig = (status) => {
        const configs = {
            'Open': { bg: 'bg-blue-500' },
            'Closed': { bg: 'bg-gray-500' },
            'Cancelled': { bg: 'bg-red-500' },
        };
        return configs[status] || configs['Open'];
    };

    const statusConfig = getStatusConfig(purchaseOrder.po_status);

    return (
        <div className="flex flex-wrap items-start justify-between gap-4">
            {/* Left: PO Info + Vendor + Project */}
            <div className="flex items-start gap-4">
                <div className={`h-16 w-1 rounded-full ${statusConfig.bg}`}></div>
                <div className="space-y-2">
                    {/* PO Number & Status */}
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="font-mono text-xl font-bold text-gray-900 dark:text-gray-100">
                            {purchaseOrder.po_number}
                        </h1>
                        <StatusBadge status={purchaseOrder.po_status} />
                        {financialMetrics.overdueInvoices > 0 && (
                            <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                {financialMetrics.overdueInvoices} Overdue
                            </Badge>
                        )}
                    </div>

                    {/* Vendor & Project */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5" />
                            <span className="font-medium">{purchaseOrder.vendor?.name || 'No Vendor'}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center gap-1.5">
                            <Package className="h-3.5 w-3.5" />
                            <span>{purchaseOrder.project?.project_title || 'No Project'}</span>
                        </div>
                        {purchaseOrder.project?.cer_number && (
                            <>
                                <span className="text-gray-400">•</span>
                                <span className="font-mono text-xs">CER: {purchaseOrder.project.cer_number}</span>
                            </>
                        )}
                    </div>

                    {/* Dates & Timeline */}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-500">
                        <span>PO Date: {formatDate(purchaseOrder.po_date)}</span>
                        <span>•</span>
                        <span>{financialMetrics.daysSincePO} days old</span>
                        {financialMetrics.daysToDelivery !== null && (
                            <>
                                <span>•</span>
                                <span className={financialMetrics.daysToDelivery < 0 ? 'text-red-600 font-medium' : 'text-blue-600'}>
                                    {financialMetrics.daysToDelivery < 0
                                        ? `${Math.abs(financialMetrics.daysToDelivery)} days overdue`
                                        : `${financialMetrics.daysToDelivery} days to delivery`}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex flex-shrink-0 gap-2">
                <BackButton />
                <Link href={`/purchase-orders/${purchaseOrder.id}/edit`} prefetch>
                    <Button variant="outline" size="sm">
                        <Edit className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                    </Button>
                </Link>
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
    );
}
