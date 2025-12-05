import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import WidgetError from '../shared/WidgetError';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
import type { CheckAgingBucket } from '@/types';

const BUCKET_COLORS: Record<string, string> = {
    'Overdue for Printing': '#ef4444',                      // red-500
    'Scheduled for Release (Not Printed)': '#f97316',       // orange-500
    'Printed (0-7 days)': '#22c55e',                        // green-500
    'Printed (8-14 days)': '#eab308',                       // yellow-500
    'Printed (>14 days)': '#dc2626',                        // red-600
};

const BUCKET_ORDER = [
    'Overdue for Printing',
    'Scheduled for Release (Not Printed)',
    'Printed (0-7 days)',
    'Printed (8-14 days)',
    'Printed (>14 days)'
];

export default function CheckAgingChart() {
    const { data, loading, error, refetch } = useDashboardWidget<CheckAgingBucket[]>({
        endpoint: '/api/dashboard/disbursement/check-aging'
    });

    if (loading) {
        return <WidgetSkeleton variant="chart" title="Check Aging" />;
    }

    if (error || !data) {
        return (
            <DashboardCard title="Check Aging" description="Check status by aging" icon={Clock}>
                <WidgetError message={error || 'Failed to load check aging'} onRetry={refetch} />
            </DashboardCard>
        );
    }
    // Sort data by bucket order
    const sortedData = [...data].sort((a, b) => {
        return BUCKET_ORDER.indexOf(a.bucket) - BUCKET_ORDER.indexOf(b.bucket);
    });

    const chartData = sortedData.map(item => ({
        bucket: item.bucket,
        count: item.count,
        amount: item.total_amount,
        fill: BUCKET_COLORS[item.bucket] || '#6b7280',
    }));

    const isEmpty = chartData.length === 0;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <DashboardCard
            title="Check Aging Analysis"
            description="Checks by processing stage"
            icon={Clock}
        >
            {isEmpty ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <p className="text-sm">No pending checks</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="bucket" type="category" width={140} />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                                            <p className="font-semibold">{data.bucket}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Count: {data.count} check{data.count !== 1 ? 's' : ''}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Amount: {formatCurrency(data.amount)}
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </DashboardCard>
    );
}
