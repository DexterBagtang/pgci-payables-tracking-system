import { Receipt, Clock, Eye, CheckCircle, XCircle, Wallet, ArrowRight } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import WidgetError from '../shared/WidgetError';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface InvoiceStatusData {
    pending: number;
    received: number;
    in_progress: number;
    approved: number;
    rejected: number;
    pending_disbursement: number;
    paid: number;
    total: number;
}

export default function InvoiceStatusTracking() {
    const { data, loading, error, refetch } = useDashboardWidget<InvoiceStatusData>({
        endpoint: '/api/dashboard/purchasing/invoice-status-tracking'
    });

    if (loading) {
        return <WidgetSkeleton variant="chart" title="Invoice Status Flow" />;
    }

    if (error || !data) {
        return (
            <DashboardCard
                title="Invoice Status Flow"
                description="Track invoice processing status"
                icon={Receipt}
            >
                <WidgetError message={error || 'Failed to load invoice status'} onRetry={refetch} />
            </DashboardCard>
        );
    }

    const statuses = [
        {
            status: 'pending',
            label: 'Pending',
            count: data.pending,
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
            borderColor: 'border-yellow-300 dark:border-yellow-700',
            href: '/invoices?status=pending',
            description: 'With Purchasing',
        },
        {
            status: 'received',
            label: 'Received',
            count: data.received,
            icon: Eye,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            borderColor: 'border-blue-300 dark:border-blue-700',
            href: '/invoices?status=received',
            description: 'In Accounting',
        },
        {
            status: 'approved',
            label: 'Approved',
            count: data.approved,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            borderColor: 'border-green-300 dark:border-green-700',
            href: '/invoices?status=approved',
            description: 'Ready for Payment',
        },
        {
            status: 'rejected',
            label: 'Rejected',
            count: data.rejected,
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            borderColor: 'border-red-300 dark:border-red-700',
            href: '/invoices?status=rejected',
            description: 'Needs Action',
        },
    ];

    const purchasingRelevant = data.pending + data.rejected;

    return (
        <DashboardCard
            title="Invoice Status Flow"
            description={`${purchasingRelevant} need attention • ${data.total} total invoices`}
            icon={Receipt}
            actions={
                <Link href="/invoices">
                    <span className="text-xs text-muted-foreground hover:text-primary cursor-pointer flex items-center gap-1">
                        View All <ArrowRight className="h-3 w-3" />
                    </span>
                </Link>
            }
        >
            <div className="space-y-4">
                {/* Status Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {statuses.map((status) => (
                        <Link key={status.status} href={status.href}>
                            <div
                                className={cn(
                                    'flex flex-col p-3 rounded-lg border transition-all hover:shadow-md cursor-pointer',
                                    status.bgColor,
                                    status.borderColor
                                )}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <status.icon className={cn('h-5 w-5', status.color)} />
                                    {status.status === 'rejected' && status.count > 0 && (
                                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                    )}
                                </div>
                                <div className="text-2xl font-bold mb-1">{status.count}</div>
                                <div className="text-xs font-medium">{status.label}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {status.description}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Additional Stats */}
                <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <div className="text-xs text-muted-foreground">In Progress</div>
                                <div className="text-sm font-bold">{data.in_progress}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <div className="text-xs text-muted-foreground">Pending Disbursement</div>
                                <div className="text-sm font-bold">{data.pending_disbursement}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <div>
                                <div className="text-xs text-muted-foreground">Paid</div>
                                <div className="text-sm font-bold text-green-600">{data.paid}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardCard>
    );
}
