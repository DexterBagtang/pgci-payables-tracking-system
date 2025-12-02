import { GitBranch, Calendar, Printer, Send, CheckCircle2 } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import WidgetError from '../shared/WidgetError';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CheckStatusData {
    scheduled: number;
    printed: number;
    released: number;
    voided: number;
    total: number;
    total_amount: number;
    pending_amount: number;
}

export default function CheckStatusPipeline() {
    const { data, loading, error, refetch } = useDashboardWidget<CheckStatusData>({
        endpoint: '/api/dashboard/disbursement/check-status-pipeline'
    });

    if (loading) {
        return <WidgetSkeleton variant="metrics" title="Check Processing Pipeline" />;
    }

    if (error || !data) {
        return (
            <DashboardCard
                title="Check Processing Pipeline"
                description="Visual workflow of check statuses"
                icon={GitBranch}
            >
                <WidgetError message={error || 'Failed to load pipeline'} onRetry={refetch} />
            </DashboardCard>
        );
    }

    const stages = [
        { key: 'scheduled', label: 'Scheduled', count: data.scheduled, icon: Calendar, color: 'blue' },
        { key: 'printed', label: 'Printed', count: data.printed, icon: Printer, color: 'yellow' },
        { key: 'released', label: 'Released', count: data.released, icon: Send, color: 'green' },
    ];

    const colorMap = {
        blue: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
        green: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        purple: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
        gray: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800',
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
        }).format(amount);

    return (
        <DashboardCard
            title="Check Processing Pipeline"
            description={`${data.total} total checks`}
            icon={GitBranch}
        >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-lg border bg-card p-4">
                    <div className="text-sm text-muted-foreground mb-1">Total Value</div>
                    <div className="text-2xl font-bold">{formatCurrency(data.total_amount)}</div>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <div className="text-sm text-muted-foreground mb-1">Pending Release</div>
                    <div className="text-2xl font-bold">{formatCurrency(data.pending_amount)}</div>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <div className="text-sm text-muted-foreground mb-1">Completion Rate</div>
                    <div className="text-2xl font-bold">
                        {data.total > 0 ? Math.round((data.released / data.total) * 100) : 0}%
                    </div>
                </div>
            </div>

            {/* Pipeline Flow */}
            <div className="space-y-2">
                {stages.map((stage, index) => {
                    const Icon = stage.icon;
                    const percentage = data.total > 0 ? (stage.count / data.total) * 100 : 0;

                    return (
                        <div key={stage.key}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{stage.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="font-mono text-xs">
                                        {stage.count}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground w-12 text-right">
                                        {percentage.toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        'h-full rounded-full transition-all',
                                        colorMap[stage.color]
                                    )}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}

                {/* Voided Section */}
                {data.voided > 0 && (
                    <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <span>Voided Checks</span>
                            </div>
                            <Badge variant="outline" className="font-mono">
                                {data.voided}
                            </Badge>
                        </div>
                    </div>
                )}
            </div>
        </DashboardCard>
    );
}
