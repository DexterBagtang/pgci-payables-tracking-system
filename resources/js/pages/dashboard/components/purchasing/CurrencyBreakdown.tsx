import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { DollarSign } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';

const CURRENCY_COLORS: Record<string, string> = {
    PHP: '#10b981',  // green-500
    USD: '#3b82f6',  // blue-500
};

interface CurrencyBreakdownProps {
    data: { currency: 'PHP' | 'USD'; count: number; total_amount: number }[];
}

export default function CurrencyBreakdown({ data }: CurrencyBreakdownProps) {
    const chartData = data.map(item => ({
        name: item.currency,
        value: item.total_amount,
        count: item.count,
        fill: CURRENCY_COLORS[item.currency] || '#6b7280',
    }));

    const isEmpty = chartData.length === 0;

    const formatCurrency = (value: number, currency: string) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
        }).format(value);
    };

    const renderCustomLabel = (entry: any) => {
        const percentage = ((entry.value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1);
        return `${entry.name}: ${percentage}%`;
    };

    return (
        <DashboardCard
            title="Currency Breakdown"
            description="Open PO value by currency"
            icon={DollarSign}
        >
            {isEmpty ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <p className="text-sm">No currency data available</p>
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
                                                Count: {data.count} PO{data.count !== 1 ? 's' : ''}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Amount: {formatCurrency(data.value, data.name)}
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
