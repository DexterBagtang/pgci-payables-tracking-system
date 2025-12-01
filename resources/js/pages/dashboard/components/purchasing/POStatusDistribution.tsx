import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PackageOpen } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import type { POStatusData } from '@/types';

const STATUS_COLORS: Record<string, string> = {
    draft: '#9ca3af',      // gray-400
    open: '#3b82f6',       // blue-500
    closed: '#14b8a6',     // teal-500
    cancelled: '#ef4444',  // red-500
};

const STATUS_LABELS: Record<string, string> = {
    draft: 'Draft',
    open: 'Open',
    closed: 'Closed',
    cancelled: 'Cancelled',
};

interface POStatusDistributionProps {
    data: POStatusData[];
}

export default function POStatusDistribution({ data }: POStatusDistributionProps) {
    // Group data by status (combining PHP and USD counts)
    const groupedData = data.reduce((acc, item) => {
        const existing = acc.find(d => d.status === item.status);
        if (existing) {
            existing.count += item.count;
            existing.total_amount += item.total_amount;
        } else {
            acc.push({
                status: item.status,
                count: item.count,
                total_amount: item.total_amount,
            });
        }
        return acc;
    }, [] as Array<{ status: string; count: number; total_amount: number }>);

    const chartData = groupedData.map(item => ({
        name: STATUS_LABELS[item.status] || item.status,
        value: item.count,
        amount: item.total_amount,
        fill: STATUS_COLORS[item.status] || '#6b7280',
    }));

    const isEmpty = chartData.length === 0;

    const renderCustomLabel = (entry: any) => {
        return `${entry.name}: ${entry.value}`;
    };

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
            title="PO Status Distribution"
            description="Purchase orders grouped by status"
            icon={PackageOpen}
        >
            {isEmpty ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <p className="text-sm">No purchase orders found</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomLabel}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                                            <p className="font-semibold">{data.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Count: {data.value}
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
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </DashboardCard>
    );
}
