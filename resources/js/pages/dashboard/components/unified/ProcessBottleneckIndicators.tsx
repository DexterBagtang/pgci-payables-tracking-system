import { Gauge, Clock, CheckCircle, Send, Activity } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import WidgetError from '../shared/WidgetError';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
import type { ProcessBottleneckIndicators as ProcessBottleneckIndicatorsData } from '@/types';

const formatNumber = (value: number) => new Intl.NumberFormat('en-PH').format(value);

export default function ProcessBottleneckIndicators() {
    const { data, loading, error, refetch, isRefetching } = useDashboardWidget<ProcessBottleneckIndicatorsData>({
        endpoint: '/api/dashboard/unified/bottlenecks',
    });

    if (loading) {
        return <WidgetSkeleton variant="metrics" />;
    }

    if (error || !data) {
        return <WidgetError message={error || 'Failed to load bottleneck data'} onRetry={refetch} />;
    }

    const stages = [
        {
            label: 'Received → Reviewed',
            days: data.avg_received_to_reviewed_days,
            icon: Clock,
            color: getColorForDays(data.avg_received_to_reviewed_days),
        },
        {
            label: 'Reviewed → Approved',
            days: data.avg_reviewed_to_approved_days,
            icon: CheckCircle,
            color: getColorForDays(data.avg_reviewed_to_approved_days),
        },
        {
            label: 'Approved → Disbursed',
            days: data.avg_approved_to_disbursed_days,
            icon: Send,
            color: getColorForDays(data.avg_approved_to_disbursed_days),
        },
    ];

    const totalAvgDays = data.avg_received_to_reviewed_days + data.avg_reviewed_to_approved_days + data.avg_approved_to_disbursed_days;

    return (
        <DashboardCard
            title="Process Bottleneck Indicators"
            description="Average processing time by stage"
            icon={Gauge}
            isRefreshing={isRefetching}
        >
            <div className="space-y-4">
                {/* Total Processing Time */}
                <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-purple-50 p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Activity className="h-4 w-4 text-blue-600" />
                        Total Avg. Processing Time
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                        {totalAvgDays.toFixed(1)} <span className="text-lg">days</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                        {formatNumber(data.total_in_pipeline)} invoice{data.total_in_pipeline !== 1 ? 's' : ''} in pipeline
                    </div>
                </div>

                {/* Stage Breakdown */}
                <div className="space-y-3">
                    {stages.map((stage) => {
                        const Icon = stage.icon;
                        const colorClasses = stage.color;

                        return (
                            <div key={stage.label} className="rounded-lg border p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded ${colorClasses.bg}`}>
                                            <Icon className={`h-5 w-5 ${colorClasses.text}`} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">{stage.label}</div>
                                            <div className="text-xs text-muted-foreground">Average time</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-2xl font-bold ${colorClasses.text}`}>
                                            {stage.days.toFixed(1)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">days</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </DashboardCard>
    );
}

// Helper function to determine color based on processing days
function getColorForDays(days: number) {
    if (days <= 2) {
        return { text: 'text-green-600', bg: 'bg-green-100' };
    } else if (days <= 5) {
        return { text: 'text-blue-600', bg: 'bg-blue-100' };
    } else if (days <= 10) {
        return { text: 'text-orange-600', bg: 'bg-orange-100' };
    } else {
        return { text: 'text-red-600', bg: 'bg-red-100' };
    }
}
