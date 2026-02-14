import { Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import WidgetError from '../shared/WidgetError';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
import type { APAgingSummary as APAgingSummaryData } from '@/types';
import { Badge } from '@/components/ui/badge';

const formatCurrency = (value: number, currency: 'PHP' | 'USD' = 'PHP') =>
    new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-PH', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);

export default function APAgingSummary() {
    const { data, loading, error, refetch, isRefetching } = useDashboardWidget<APAgingSummaryData>({
        endpoint: '/api/dashboard/unified/ap-aging',
    });

    if (loading) {
        return <WidgetSkeleton variant="metrics" />;
    }

    if (error || !data) {
        return <WidgetError message={error || 'Failed to load AP aging data'} onRetry={refetch} />;
    }

    const buckets = [
        { label: '0-30 Days', key: '0_30', color: 'bg-yellow-100 text-yellow-800' },
        { label: '31-60 Days', key: '31_60', color: 'bg-orange-100 text-orange-800' },
        { label: '61-90 Days', key: '61_90', color: 'bg-red-100 text-red-800' },
        { label: '>90 Days', key: 'over_90', color: 'bg-red-200 text-red-900' },
    ];

    return (
        <DashboardCard
            title="AP Aging Summary"
            description="Outstanding invoices by age"
            icon={Calendar}
            isRefreshing={isRefetching}
        >
            <div className="space-y-4">
                {/* Summary Metrics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <TrendingUp className="h-4 w-4" />
                            Total Outstanding
                        </div>
                        <div className="text-2xl font-bold">{formatCurrency(data.total_outstanding)}</div>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            Total Overdue
                        </div>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(data.total_overdue)}</div>
                    </div>
                </div>

                {/* Aging Buckets - PHP */}
                {data.total_outstanding_php > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-muted-foreground">Aging Breakdown (PHP)</h4>
                        {buckets.map((bucket) => {
                            const bucketData = data.aging_buckets_php[bucket.key as keyof typeof data.aging_buckets_php];
                            if (bucketData.count === 0) return null;
                            return (
                                <div key={bucket.key} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge className={bucket.color}>{bucket.label}</Badge>
                                        <span className="text-sm text-muted-foreground">
                                            {bucketData.count} invoice{bucketData.count !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold">{formatCurrency(bucketData.amount, 'PHP')}</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Aging Buckets - USD */}
                {data.total_outstanding_usd > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-muted-foreground">Aging Breakdown (USD)</h4>
                        {buckets.map((bucket) => {
                            const bucketData = data.aging_buckets_usd[bucket.key as keyof typeof data.aging_buckets_usd];
                            if (bucketData.count === 0) return null;
                            return (
                                <div key={bucket.key} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge className={bucket.color}>{bucket.label}</Badge>
                                        <span className="text-sm text-muted-foreground">
                                            {bucketData.count} invoice{bucketData.count !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold">{formatCurrency(bucketData.amount, 'USD')}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardCard>
    );
}
