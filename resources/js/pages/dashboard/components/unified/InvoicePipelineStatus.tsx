import { FileText, Inbox, Clock, CheckCircle, SendHorizontal, XCircle, Banknote } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import WidgetError from '../shared/WidgetError';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
import type { InvoicePipelineStatus as InvoicePipelineStatusData } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const formatNumber = (value: number) => new Intl.NumberFormat('en-PH').format(value);

export default function InvoicePipelineStatus() {
    const { data, loading, error, refetch, isRefetching } = useDashboardWidget<InvoicePipelineStatusData>({
        endpoint: '/api/dashboard/unified/invoice-pipeline',
    });

    if (loading) {
        return <WidgetSkeleton variant="chart" />;
    }

    if (error || !data) {
        return <WidgetError message={error || 'Failed to load pipeline data'} onRetry={refetch} />;
    }

    const statuses = [
        { label: 'Pending', key: 'pending', icon: Inbox, color: 'text-gray-600', bgColor: 'bg-gray-100' },
        { label: 'Received', key: 'received', icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-100' },
        { label: 'In Progress', key: 'in_progress', icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-100' },
        { label: 'Approved', key: 'approved', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
        { label: 'Pending Disbursement', key: 'pending_disbursement', icon: SendHorizontal, color: 'text-purple-600', bgColor: 'bg-purple-100' },
        { label: 'Paid', key: 'paid', icon: Banknote, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
        { label: 'Rejected', key: 'rejected', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
    ];

    return (
        <DashboardCard
            title="Invoice Pipeline Status"
            description="Invoices by processing stage"
            icon={FileText}
            isRefreshing={isRefetching}
        >
            <div className="space-y-4">
                {/* Total Count */}
                <div className="flex items-center justify-between pb-2 border-b">
                    <span className="text-sm font-medium text-muted-foreground">Total Invoices</span>
                    <span className="text-2xl font-bold">{formatNumber(data.total)}</span>
                </div>

                {/* Status Breakdown */}
                <div className="space-y-3">
                    {statuses.map((status) => {
                        const count = data[status.key as keyof InvoicePipelineStatusData] as number;
                        const percentage = data.total > 0 ? (count / data.total) * 100 : 0;
                        const Icon = status.icon;

                        return (
                            <div key={status.key} className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`flex h-8 w-8 items-center justify-center rounded ${status.bgColor}`}>
                                            <Icon className={`h-4 w-4 ${status.color}`} />
                                        </div>
                                        <span className="text-sm font-medium">{status.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold">{formatNumber(count)}</span>
                                        <span className="text-xs text-muted-foreground w-12 text-right">
                                            {percentage.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                                <Progress value={percentage} className="h-1.5" />
                            </div>
                        );
                    })}
                </div>
            </div>
        </DashboardCard>
    );
}
