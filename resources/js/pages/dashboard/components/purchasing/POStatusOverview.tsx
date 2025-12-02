import { FileText, PackageOpen, CheckCircle2, XCircle, TrendingUp, ArrowRight } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import WidgetError from '../shared/WidgetError';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface POStatusData {
    draft: number;
    open: number;
    closed: number;
    cancelled: number;
    total: number;
    created_this_month: number;
    closed_this_month: number;
    total_value_php: number;
    total_value_usd: number;
}

const formatCurrency = (value: number, currency: 'PHP' | 'USD' = 'PHP') =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        notation: value > 1000000 ? 'compact' : 'standard'
    }).format(value);

export default function POStatusOverview() {
    const { data, loading, error, refetch } = useDashboardWidget<POStatusData>({
        endpoint: '/api/dashboard/purchasing/po-status-overview'
    });

    if (loading) {
        return <WidgetSkeleton variant="chart" title="Purchase Order Pipeline" />;
    }

    if (error || !data) {
        return (
            <DashboardCard
                title="Purchase Order Pipeline"
                description="Track PO lifecycle status"
                icon={TrendingUp}
            >
                <WidgetError message={error || 'Failed to load PO status'} onRetry={refetch} />
            </DashboardCard>
        );
    }

    const statuses = [
        {
            status: 'draft',
            label: 'Draft',
            count: data.draft,
            icon: FileText,
            color: 'text-gray-600',
            bgColor: 'bg-gray-100 dark:bg-gray-800',
            borderColor: 'border-gray-300 dark:border-gray-700',
            href: '/purchase-orders?status=draft',
            description: 'Needs finalization',
        },
        {
            status: 'open',
            label: 'Open',
            count: data.open,
            icon: PackageOpen,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
            borderColor: 'border-blue-300 dark:border-blue-700',
            href: '/purchase-orders?status=open',
            description: 'Active orders',
        },
        {
            status: 'closed',
            label: 'Closed',
            count: data.closed,
            icon: CheckCircle2,
            color: 'text-green-600',
            bgColor: 'bg-green-100 dark:bg-green-900/30',
            borderColor: 'border-green-300 dark:border-green-700',
            href: '/purchase-orders?status=closed',
            description: 'Completed',
        },
        {
            status: 'cancelled',
            label: 'Cancelled',
            count: data.cancelled,
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-100 dark:bg-red-900/30',
            borderColor: 'border-red-300 dark:border-red-700',
            href: '/purchase-orders?status=cancelled',
            description: 'Terminated',
        },
    ];

    const totalActive = data.draft + data.open;

    return (
        <DashboardCard
            title="Purchase Order Pipeline"
            description={`${totalActive} active • ${formatCurrency(data.total_value_php)} + ${formatCurrency(data.total_value_usd, 'USD')}`}
            icon={TrendingUp}
            actions={
                <Link href="/purchase-orders">
                    <span className="text-xs text-muted-foreground hover:text-primary cursor-pointer flex items-center gap-1">
                        View All <ArrowRight className="h-3 w-3" />
                    </span>
                </Link>
            }
        >
            <div className="space-y-4">
                {/* Visual Pipeline */}
                <div className="grid grid-cols-4 gap-2">
                    {statuses.map((status, index) => (
                        <div key={status.status} className="relative">
                            <Link href={status.href}>
                                <div
                                    className={cn(
                                        'flex flex-col items-center p-3 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer',
                                        status.bgColor,
                                        status.borderColor
                                    )}
                                >
                                    <status.icon className={cn('h-6 w-6 mb-2', status.color)} />
                                    <div className="text-2xl font-bold mb-1">{status.count}</div>
                                    <div className="text-xs font-medium text-center">{status.label}</div>
                                    <div className="text-xs text-muted-foreground text-center mt-1">
                                        {status.description}
                                    </div>
                                </div>
                            </Link>
                            {index < statuses.length - 1 && (
                                <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 z-10">
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Monthly Stats */}
                <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-4">
                        <div>
                            <div className="text-xs text-muted-foreground">Created This Month</div>
                            <div className="text-lg font-bold text-purple-600">{data.created_this_month}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Closed This Month</div>
                            <div className="text-lg font-bold text-green-600">{data.closed_this_month}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Total POs</div>
                            <div className="text-lg font-bold">{data.total}</div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardCard>
    );
}
