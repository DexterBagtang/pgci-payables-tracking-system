import { FileText, ArrowRight } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import WidgetError from '../shared/WidgetError';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface InvoiceStatusData {
    received: number;
    in_progress: number;
    approved: number;
    pending_disbursement: number;
    paid: number;
    rejected: number;
    total: number;
    total_amount: number;
    pending_amount: number;
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        notation: value > 1000000 ? 'compact' : 'standard'
    }).format(value);

export default function InvoiceStatusPipeline() {
    const { data, loading, error, refetch } = useDashboardWidget<InvoiceStatusData>({
        endpoint: '/api/dashboard/payables/invoice-status-pipeline'
    });

    if (loading) {
        return <WidgetSkeleton variant="chart" title="Invoice Processing Pipeline" />;
    }

    if (error || !data) {
        return (
            <DashboardCard
                title="Invoice Processing Pipeline"
                description="Invoice status flow"
                icon={FileText}
            >
                <WidgetError message={error || 'Failed to load pipeline data'} onRetry={refetch} />
            </DashboardCard>
        );
    }

    const stages = [
        { key: 'received', label: 'Received', count: data.received, color: 'blue' },
        { key: 'in_progress', label: 'In Progress', count: data.in_progress, color: 'yellow' },
        { key: 'approved', label: 'Approved', count: data.approved, color: 'green' },
        { key: 'pending_disbursement', label: 'Pending Disbursement', count: data.pending_disbursement, color: 'purple' },
        { key: 'paid', label: 'Paid', count: data.paid, color: 'gray' },
    ];

    return (
        <DashboardCard
            title="Invoice Processing Pipeline"
            description={`${data.total} total • ${formatCurrency(data.pending_amount)} pending`}
            icon={FileText}
            actions={
                <Link href="/invoices">
                    <span className="text-xs text-muted-foreground hover:text-primary cursor-pointer flex items-center gap-1">
                        View All <ArrowRight className="h-3 w-3" />
                    </span>
                </Link>
            }
        >
            <div className="space-y-4">
                {/* Pipeline Flow */}
                <div className="flex items-center justify-between gap-2">
                    {stages.map((stage, index) => (
                        <div key={stage.key} className="flex items-center gap-2 flex-1">
                            <Link
                                href={`/invoices?status=${stage.key}`}
                                className="flex-1"
                            >
                                <div className={cn(
                                    "p-3 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer",
                                    stage.color === 'blue' && "border-blue-200 bg-blue-50 hover:border-blue-300",
                                    stage.color === 'yellow' && "border-yellow-200 bg-yellow-50 hover:border-yellow-300",
                                    stage.color === 'green' && "border-green-200 bg-green-50 hover:border-green-300",
                                    stage.color === 'purple' && "border-purple-200 bg-purple-50 hover:border-purple-300",
                                    stage.color === 'gray' && "border-gray-200 bg-gray-50 hover:border-gray-300",
                                )}>
                                    <div className="text-center">
                                        <p className={cn(
                                            "text-2xl font-bold mb-1",
                                            stage.color === 'blue' && "text-blue-700",
                                            stage.color === 'yellow' && "text-yellow-700",
                                            stage.color === 'green' && "text-green-700",
                                            stage.color === 'purple' && "text-purple-700",
                                            stage.color === 'gray' && "text-gray-700",
                                        )}>
                                            {stage.count}
                                        </p>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            {stage.label}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                            {index < stages.length - 1 && (
                                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Total Invoices</p>
                        <p className="text-lg font-bold">{data.total}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Pending Amount</p>
                        <p className="text-lg font-bold text-orange-600">{formatCurrency(data.pending_amount)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Rejected</p>
                        <p className="text-lg font-bold text-red-600">{data.rejected}</p>
                    </div>
                </div>
            </div>
        </DashboardCard>
    );
}
