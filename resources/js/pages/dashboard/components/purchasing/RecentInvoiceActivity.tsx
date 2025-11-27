import { FileText, ExternalLink } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RecentInvoice {
    id: number;
    si_number: string;
    vendor_name: string;
    po_number: string;
    net_amount: number;
    currency: 'PHP' | 'USD';
    invoice_status: 'pending' | 'received' | 'in_progress' | 'approved' | 'pending_disbursement' | 'paid' | 'rejected';
    si_received_at: string;
}

interface RecentInvoiceActivityProps {
    data: RecentInvoice[];
}

const STATUS_CONFIG = {
    pending: { label: 'Pending', variant: 'secondary' as const, color: 'text-gray-600' },
    received: { label: 'Received', variant: 'default' as const, color: 'text-blue-600' },
    in_progress: { label: 'In Review', variant: 'default' as const, color: 'text-yellow-600' },
    approved: { label: 'Approved', variant: 'default' as const, color: 'text-green-600' },
    pending_disbursement: { label: 'Pending Disbursement', variant: 'default' as const, color: 'text-purple-600' },
    paid: { label: 'Paid', variant: 'default' as const, color: 'text-teal-600' },
    rejected: { label: 'Rejected', variant: 'destructive' as const, color: 'text-red-600' },
};

export default function RecentInvoiceActivity({ data }: RecentInvoiceActivityProps) {
    const formatCurrency = (value: number, currency: 'PHP' | 'USD') => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            const hours = Math.floor(diffInHours);
            return hours === 0 ? 'Just now' : `${hours}h ago`;
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
        }
    };

    const isEmpty = data.length === 0;

    return (
        <DashboardCard
            title="Recent Invoice Activity"
            description="Latest invoices added to the system"
            icon={FileText}
        >
            {isEmpty ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <p className="text-sm">No recent invoices</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {data.map((invoice) => {
                        const statusConfig = STATUS_CONFIG[invoice.invoice_status];
                        return (
                            <Link
                                key={invoice.id}
                                href={`/invoices/${invoice.id}`}
                                className="block group"
                            >
                                <div className="flex items-center gap-3 p-2.5 rounded-md border bg-card hover:bg-accent transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-medium text-sm truncate group-hover:text-primary">
                                                {invoice.si_number}
                                            </p>
                                            <Badge variant={statusConfig.variant} className="text-xs px-1.5 py-0">
                                                {statusConfig.label}
                                            </Badge>
                                            <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="truncate">{invoice.vendor_name}</span>
                                            <span>•</span>
                                            <span>{invoice.po_number}</span>
                                            <span>•</span>
                                            <span>{formatDate(invoice.si_received_at)}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn('text-sm font-semibold font-mono', statusConfig.color)}>
                                            {formatCurrency(invoice.net_amount, invoice.currency)}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </DashboardCard>
    );
}
