import { DollarSign, TrendingUp, Package, CheckCircle2, Activity } from 'lucide-react';
import MetricCard from '../shared/MetricCard';
import type { POFinancialMetrics } from '@/types';

interface POFinancialCommitmentsProps {
    data: POFinancialMetrics;
}

export default function POFinancialCommitments({ data }: POFinancialCommitmentsProps) {
    const formatCurrency = (value: number, currency: 'PHP' | 'USD' = 'PHP') => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <MetricCard
                title="Open PO Value (PHP)"
                value={formatCurrency(data.open_po_value_php, 'PHP')}
                icon={DollarSign}
                color="blue"
            />

            <MetricCard
                title="Open PO Value (USD)"
                value={formatCurrency(data.open_po_value_usd, 'USD')}
                icon={DollarSign}
                color="green"
            />

            <MetricCard
                title="POs Created This Month"
                value={data.pos_created_this_month}
                icon={TrendingUp}
                color="purple"
            />

            <MetricCard
                title="Average PO Value"
                value={formatCurrency(data.average_po_value, 'PHP')}
                icon={Activity}
                color="orange"
            />

            <MetricCard
                title="POs Closed This Month"
                value={data.pos_closed_this_month}
                icon={CheckCircle2}
                color="default"
            />
        </div>
    );
}
