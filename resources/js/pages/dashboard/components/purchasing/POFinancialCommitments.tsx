import { DollarSign, TrendingUp, CheckCircle2, PhilippinePeso, FileText, Clock, Receipt, PackageOpen, XCircle } from 'lucide-react';
import MetricCard from '../shared/MetricCard';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import WidgetError from '../shared/WidgetError';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';

const formatCurrency = (value: number, currency: 'PHP' | 'USD' = 'PHP') =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

const formatNumber = (value: number) => new Intl.NumberFormat('en-PH').format(value);

export default function POFinancialCommitments() {
    const { data: financial, loading: financialLoading, error: financialError, refetch: refetchFinancial } =
        useDashboardWidget({ endpoint: '/api/dashboard/purchasing/financial-commitments' });

    const { data: statusData, loading: statusLoading, error: statusError, refetch: refetchStatus } =
        useDashboardWidget({ endpoint: '/api/dashboard/purchasing/po-status-summary' });

    const { data: currencyData, loading: currencyLoading, error: currencyError, refetch: refetchCurrency } =
        useDashboardWidget({ endpoint: '/api/dashboard/purchasing/currency-summary' });

    const loading = financialLoading || statusLoading || currencyLoading;
    const error = financialError || statusError || currencyError;

    if (loading) {
        return <WidgetSkeleton variant="metrics" />;
    }

    if (error || !financial || !statusData || !currencyData) {
        return (
            <WidgetError
                message={error || 'Failed to load financial data'}
                onRetry={() => {
                    refetchFinancial();
                    refetchStatus();
                    refetchCurrency();
                }}
            />
        );
    }

    const metrics = [
        { title: "Draft", value: statusData.draft, icon: FileText, color: "default" as const },
        { title: "Open", value: statusData.open, icon: PackageOpen, color: "blue" as const },
        { title: "Open (PHP)", value: formatCurrency(financial.open_po_value_php, 'PHP'), icon: PhilippinePeso, color: "green" as const },
        { title: "Open (USD)", value: formatCurrency(financial.open_po_value_usd, 'USD'), icon: DollarSign, color: "green" as const },
        { title: "Created (MTD)", value: financial.pos_created_this_month, icon: TrendingUp, color: "purple" as const },
        { title: "Closed (MTD)", value: financial.pos_closed_this_month, icon: CheckCircle2, color: "blue" as const },
        { title: "Cancelled (MTD)", value: statusData.cancelled_this_month, icon: XCircle, color: "red" as const },
        { title: "Invoices", value: formatNumber(financial.total_invoices), icon: FileText, color: "default" as const },
        { title: "Invoices (MTD)", value: financial.invoices_this_month, icon: Receipt, color: "purple" as const },
        { title: "Pending", value: financial.pending_invoices, icon: Clock, color: "orange" as const },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {metrics.map((metric, idx) => (
                <MetricCard key={idx} {...metric} />
            ))}
        </div>
    );
}
