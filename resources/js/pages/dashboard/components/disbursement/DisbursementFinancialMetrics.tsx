import { Printer, PackageCheck, TrendingUp, Banknote } from 'lucide-react';
import MetricCard from '../shared/MetricCard';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import WidgetError from '../shared/WidgetError';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
import type { DisbursementMetrics } from '@/types';

export default function DisbursementFinancialMetrics() {
    const { data, loading, error, refetch } = useDashboardWidget<DisbursementMetrics>({
        endpoint: '/api/dashboard/disbursement/financial-metrics'
    });

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
        }).format(value);
    };

    if (loading) {
        return <WidgetSkeleton variant="metrics" />;
    }

    if (error || !data) {
        return <WidgetError message={error || 'Failed to load disbursement metrics'} onRetry={refetch} />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
                title="Ready to Print"
                value={data.checks_ready_to_print.toString()}
                icon={Printer}
                color="blue"
            />

            <MetricCard
                title="Pending Release"
                value={data.checks_pending_release.toString()}
                icon={PackageCheck}
                color="orange"
            />

            <MetricCard
                title="Released This Month"
                value={formatCurrency(data.released_this_month)}
                icon={TrendingUp}
                color="green"
            />

            <MetricCard
                title="Total Pending Value"
                value={formatCurrency(data.total_pending_value)}
                icon={Banknote}
                color="purple"
            />
        </div>
    );
}
