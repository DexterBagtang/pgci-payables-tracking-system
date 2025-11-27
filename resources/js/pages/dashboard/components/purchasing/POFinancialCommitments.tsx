import { DollarSign, TrendingUp, CheckCircle2, PhilippinePeso, FileText, Clock, Receipt, PackageOpen, XCircle } from 'lucide-react';
import MetricCard from '../shared/MetricCard';
import type { POFinancialMetrics } from '@/types';

interface POFinancialCommitmentsProps {
    data: POFinancialMetrics;
    statusData: {
        draft: number;
        open: number;
        closed_this_month: number;
        cancelled_this_month: number;
    };
    currencyData: {
        php_count: number;
        php_total: number;
        usd_count: number;
        usd_total: number;
    };
}

const formatCurrency = (value: number, currency: 'PHP' | 'USD' = 'PHP') =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

const formatNumber = (value: number) => new Intl.NumberFormat('en-PH').format(value);

export default function POFinancialCommitments({ data, statusData, currencyData }: POFinancialCommitmentsProps) {
    const metrics = [
        { title: "Draft", value: statusData.draft, icon: FileText, color: "default" as const },
        { title: "Open", value: statusData.open, icon: PackageOpen, color: "blue" as const },
        { title: "Open (PHP)", value: formatCurrency(data.open_po_value_php, 'PHP'), icon: PhilippinePeso, color: "green" as const },
        { title: "Open (USD)", value: formatCurrency(data.open_po_value_usd, 'USD'), icon: DollarSign, color: "green" as const },
        { title: "Created (MTD)", value: data.pos_created_this_month, icon: TrendingUp, color: "purple" as const },
        { title: "Closed (MTD)", value: data.pos_closed_this_month, icon: CheckCircle2, color: "blue" as const },
        { title: "Cancelled (MTD)", value: statusData.cancelled_this_month, icon: XCircle, color: "red" as const },
        { title: "Invoices", value: formatNumber(data.total_invoices), icon: FileText, color: "default" as const },
        { title: "Invoices (MTD)", value: data.invoices_this_month, icon: Receipt, color: "purple" as const },
        { title: "Pending", value: data.pending_invoices, icon: Clock, color: "orange" as const },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {metrics.map((metric, idx) => (
                <MetricCard key={idx} {...metric} />
            ))}
        </div>
    );
}
