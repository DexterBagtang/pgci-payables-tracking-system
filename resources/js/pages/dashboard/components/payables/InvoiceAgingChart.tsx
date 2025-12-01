import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import WidgetError from '../shared/WidgetError';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
import type { InvoiceAgingBucket } from '@/types';

const BUCKET_COLORS: Record<string, string> = {
    'Overdue': '#ef4444',      // red-500
    '0-7 days': '#f97316',     // orange-500
    '8-30 days': '#eab308',    // yellow-500
    '31-60 days': '#3b82f6',   // blue-500
    '60+ days': '#6b7280',     // gray-500
};

const BUCKET_ORDER = ['Overdue', '0-7 days', '8-30 days', '31-60 days', '60+ days'];

export default function InvoiceAgingChart() {
    const { data, loading, error, refetch } = useDashboardWidget<InvoiceAgingBucket[]>({
        endpoint: '/api/dashboard/payables/invoice-aging'
    });

    if (loading) {
        return <WidgetSkeleton variant="chart" title="Invoice Aging" />;
    }

    if (error || !data) {
        return (
            <DashboardCard
                title="Invoice Aging"
                description="Invoices grouped by days until due"
                icon={Calendar}
            >
                <WidgetError message={error || 'Failed to load aging data'} onRetry={refetch} />
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
            title="Invoice Aging Analysis"
            description="Invoices by payment timeline"
            icon={Calendar}
        >
            {isEmpty ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <p className="text-sm">No invoices with due dates</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="bucket" type="category" width={90} />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                                            <p className="font-semibold">{data.bucket}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Count: {data.count} invoice{data.count !== 1 ? 's' : ''}
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
