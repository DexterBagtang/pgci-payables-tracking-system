import { Wallet, Calendar, TrendingDown } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import WidgetError from '../shared/WidgetError';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
import type { UpcomingCashOut as UpcomingCashOutData } from '@/types';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

const formatNumber = (value: number) => new Intl.NumberFormat('en-PH').format(value);

export default function UpcomingCashOut() {
    const { data, loading, error, refetch, isRefetching } = useDashboardWidget<UpcomingCashOutData>({
        endpoint: '/api/dashboard/unified/upcoming-cashout',
    });

    if (loading) {
        return <WidgetSkeleton variant="metrics" />;
    }

    if (error || !data) {
        return <WidgetError message={error || 'Failed to load cash out data'} onRetry={refetch} />;
    }

    const timeframes = [
        {
            label: 'Next 7 Days',
            key: 'due_7_days',
            icon: Calendar,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
            borderColor: 'border-orange-200',
        },
        {
            label: 'Next 15 Days',
            key: 'due_15_days',
            icon: Calendar,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
            borderColor: 'border-blue-200',
        },
        {
            label: 'Next 30 Days',
            key: 'due_30_days',
            icon: Calendar,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
            borderColor: 'border-purple-200',
        },
    ];

    const totalAmount = data.due_7_days.amount + data.due_15_days.amount + data.due_30_days.amount;
    const totalCount = data.due_7_days.count + data.due_15_days.count + data.due_30_days.count;

    return (
        <DashboardCard
            title="Upcoming Cash Out"
            description="Projected payments by timeframe"
            icon={Wallet}
            isRefreshing={isRefetching}
        >
            <div className="space-y-4">
                {/* Total Cash Out */}
                <div className="rounded-lg border bg-gradient-to-br from-purple-50 to-blue-50 p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <TrendingDown className="h-4 w-4 text-purple-600" />
                        Total Upcoming (30 days)
                    </div>
                    <div className="text-3xl font-bold text-purple-600">{formatCurrency(totalAmount)}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                        {formatNumber(totalCount)} invoice{totalCount !== 1 ? 's' : ''}
                    </div>
                </div>

                {/* Timeframe Breakdown */}
                <div className="space-y-3">
                    {timeframes.map((timeframe) => {
                        const timeframeData = data[timeframe.key as keyof UpcomingCashOutData];
                        const Icon = timeframe.icon;

                        return (
                            <div key={timeframe.key} className={`rounded-lg border ${timeframe.borderColor} p-3`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`flex h-8 w-8 items-center justify-center rounded ${timeframe.bgColor}`}>
                                            <Icon className={`h-4 w-4 ${timeframe.color}`} />
                                        </div>
                                        <span className="text-sm font-medium">{timeframe.label}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {formatNumber(timeframeData.count)} invoice{timeframeData.count !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="text-xl font-bold pl-10">{formatCurrency(timeframeData.amount)}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </DashboardCard>
    );
}
