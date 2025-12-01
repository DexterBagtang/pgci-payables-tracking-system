import { DollarSign, FileText, CheckCircle2, Clock } from 'lucide-react';
import MetricCard from '../shared/MetricCard';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import WidgetError from '../shared/WidgetError';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
import type { PayablesFinancialMetrics } from '@/types';

export default function PayablesFinancialMetrics() {
    const { data, loading, error, refetch } = useDashboardWidget<PayablesFinancialMetrics>({
        endpoint: '/api/dashboard/payables/financial-metrics'
    });

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    if (loading) {
        return <WidgetSkeleton variant="metrics" />;
    }

    if (error || !data) {
        return <WidgetError message={error || 'Failed to load financial metrics'} onRetry={refetch} />;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
                title="Outstanding Balance"
                value={formatCurrency(data.outstanding_balance)}
                icon={DollarSign}
                color="red"
            />

            <MetricCard
                title="Pending Review Amount"
                value={formatCurrency(data.pending_review_amount)}
                icon={FileText}
                color="orange"
            />

            <MetricCard
                title="Approved This Month"
                value={formatCurrency(data.approved_this_month)}
                icon={CheckCircle2}
                color="green"
            />

            <MetricCard
                title="Avg Approval Time"
                value={`${data.average_approval_time} days`}
                icon={Clock}
                color="blue"
            />
        </div>
    );
}
