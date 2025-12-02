import { FileCheck, AlertCircle } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import WidgetError from '../shared/WidgetError';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Invoice {
    id: number;
    si_number: string;
    vendor_name: string;
    invoice_status: string;
    net_amount: number;
    currency: string;
    due_date: string | null;
    si_received_at: string | null;
    aging_days: number;
    is_overdue: boolean;
}

export default function InvoiceReviewQueue() {
    const { data, loading, error, refetch, isRefetching } = useDashboardWidget<Invoice[]>({
        endpoint: '/api/dashboard/payables/invoice-review-queue',
        staleTime: 3 * 60 * 1000, // 3 minutes - invoices are time-sensitive
    });

    if (loading) {
        return <WidgetSkeleton variant="list" title="Invoice Review Queue" />;
    }

    if (error || !data) {
        return (
            <DashboardCard
                title="Invoice Review Queue"
                description="Invoices pending review"
                icon={FileCheck}
            >
                <WidgetError message={error || 'Failed to load invoice queue'} onRetry={refetch} />
            </DashboardCard>
        );
    }
    const formatCurrency = (value: number, currency: string = 'PHP') => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
        }).format(value);
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
            pending: { variant: 'secondary', label: 'Pending' },
            received: { variant: 'outline', label: 'Received' },
            in_progress: { variant: 'default', label: 'In Progress' },
        };
        return variants[status] || { variant: 'secondary', label: status };
    };

    const isEmpty = data.length === 0;

    return (
        <DashboardCard
            title="Invoice Review Queue"
            description={`${data.length} invoice(s) pending review`}
            icon={FileCheck}
            isRefreshing={isRefetching}
        >
            {isEmpty ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <p className="text-sm">No invoices pending review</p>
                </div>
            ) : (
                <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                        {data.map((invoice) => (
                            <div
                                key={invoice.id}
                                className={cn(
                                    "border rounded-lg p-4 hover:bg-accent/50 transition-colors",
                                    invoice.is_overdue && "border-red-200 bg-red-50/50"
                                )}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-sm">{invoice.si_number}</h4>
                                            {invoice.is_overdue && (
                                                <Badge variant="destructive" className="text-xs">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    Overdue
                                                </Badge>
                                            )}
                                            <Badge variant={getStatusBadge(invoice.invoice_status).variant} className="text-xs">
                                                {getStatusBadge(invoice.invoice_status).label}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{invoice.vendor_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{formatCurrency(invoice.net_amount, invoice.currency)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>
                                        Aging: {invoice.aging_days} day{invoice.aging_days !== 1 ? 's' : ''}
                                    </span>
                                    {invoice.due_date && (
                                        <span>
                                            Due: {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            )}
        </DashboardCard>
    );
}
