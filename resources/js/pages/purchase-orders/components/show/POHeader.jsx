import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/custom/StatusBadge';
import BackButton from '@/components/custom/BackButton';
import { Link } from '@inertiajs/react';
import { Edit, Lock, AlertTriangle } from 'lucide-react';

/**
 * Purchase Order Header Component
 * Displays PO number, status, dates, and action buttons
 * Principle: Single Responsibility - Only handles header display and actions
 */
export default function POHeader({
    purchaseOrder,
    user,
    financialMetrics,
    formatDate,
    onCloseClick
}) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                {/* PO Title & Status */}
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900">
                            Purchase Order #{purchaseOrder.po_number}
                        </h1>
                        <StatusBadge status={purchaseOrder.po_status} />
                        {financialMetrics.overdueInvoices > 0 && (
                            <Badge variant="destructive" className="px-2 py-1">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                {financialMetrics.overdueInvoices} Overdue
                            </Badge>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <span>Created {formatDate(purchaseOrder.created_at)}</span>
                        <span>PO Date {formatDate(purchaseOrder.po_date)}</span>
                        <span>{financialMetrics.daysSincePO} days old</span>
                        {financialMetrics.daysToDelivery !== null && (
                            <span className={financialMetrics.daysToDelivery < 0 ? 'text-red-600 font-medium' : 'text-blue-600'}>
                                {financialMetrics.daysToDelivery < 0
                                    ? `${Math.abs(financialMetrics.daysToDelivery)} days overdue`
                                    : `${financialMetrics.daysToDelivery} days to delivery`}
                            </span>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-shrink-0 gap-2">
                    <BackButton />
                    <Link href={`/purchase-orders/${purchaseOrder.id}/edit`} prefetch>
                        <Button variant="outline" size="sm">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    </Link>
                    {(user.role === 'purchasing' || user.role === 'admin') &&
                        purchaseOrder.po_status !== 'closed' &&
                        purchaseOrder.po_status !== 'cancelled' && (
                        <Button variant="destructive" size="sm" onClick={onCloseClick}>
                            <Lock className="mr-2 h-4 w-4" />
                            Close PO
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
