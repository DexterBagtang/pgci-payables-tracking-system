import { ShoppingCart, TrendingUp, Banknote, DollarSign } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import WidgetError from '../shared/WidgetError';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
import type { POUtilizationSnapshot as POUtilizationSnapshotData } from '@/types';
import { Progress } from '@/components/ui/progress';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

export default function POUtilizationSnapshot() {
    const { data, loading, error, refetch, isRefetching } = useDashboardWidget<POUtilizationSnapshotData>({
        endpoint: '/api/dashboard/unified/po-utilization',
    });

    if (loading) {
        return <WidgetSkeleton variant="chart" />;
    }

    if (error || !data) {
        return <WidgetError message={error || 'Failed to load PO utilization data'} onRetry={refetch} />;
    }

    const metrics = [
        {
            label: 'Total PO Amount',
            value: data.total_po_amount,
            icon: ShoppingCart,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            label: 'Total Invoiced',
            value: data.total_invoiced,
            percentage: data.invoiced_percentage,
            icon: TrendingUp,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
        {
            label: 'Total Paid',
            value: data.total_paid,
            percentage: data.paid_percentage,
            icon: Banknote,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            label: 'Remaining',
            value: data.remaining,
            icon: DollarSign,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
        },
    ];

    return (
        <DashboardCard
            title="PO Utilization Snapshot"
            description="Purchase order financial overview"
            icon={ShoppingCart}
            isRefreshing={isRefetching}
        >
            <div className="space-y-4">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {metrics.map((metric) => {
                        const Icon = metric.icon;
                        return (
                            <div key={metric.label} className="rounded-lg border p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`flex h-8 w-8 items-center justify-center rounded ${metric.bgColor}`}>
                                        <Icon className={`h-4 w-4 ${metric.color}`} />
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground">{metric.label}</span>
                                </div>
                                <div className="text-lg font-bold">{formatCurrency(metric.value)}</div>
                                {metric.percentage !== undefined && (
                                    <div className="mt-2 space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">Progress</span>
                                            <span className="font-semibold">{metric.percentage.toFixed(1)}%</span>
                                        </div>
                                        <Progress value={metric.percentage} className="h-1.5" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Summary Stats */}
                <div className="rounded-lg border bg-muted/30 p-3">
                    <div className="grid grid-cols-2 gap-3 text-center">
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">Invoiced</div>
                            <div className="text-sm font-bold text-purple-600">{data.invoiced_percentage.toFixed(1)}%</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">Paid</div>
                            <div className="text-sm font-bold text-green-600">{data.paid_percentage.toFixed(1)}%</div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardCard>
    );
}
