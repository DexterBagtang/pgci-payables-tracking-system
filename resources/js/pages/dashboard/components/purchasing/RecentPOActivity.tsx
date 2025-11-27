import { Clock, ExternalLink } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RecentPO {
    id: number;
    po_number: string;
    vendor_name: string;
    project_code: string;
    total_amount: number;
    currency: 'PHP' | 'USD';
    status: 'draft' | 'open' | 'closed' | 'cancelled';
    created_at: string;
}

interface RecentPOActivityProps {
    data: RecentPO[];
}

const STATUS_CONFIG = {
    draft: { label: 'Draft', variant: 'secondary' as const, color: 'text-gray-600' },
    open: { label: 'Open', variant: 'default' as const, color: 'text-blue-600' },
    closed: { label: 'Closed', variant: 'default' as const, color: 'text-teal-600' },
    cancelled: { label: 'Cancelled', variant: 'destructive' as const, color: 'text-red-600' },
};

export default function RecentPOActivity({ data }: RecentPOActivityProps) {
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
            title="Recent PO Activity"
            description="Latest purchase orders created"
            icon={Clock}
        >
            {isEmpty ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <p className="text-sm">No recent purchase orders</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {data.map((po) => {
                        const statusConfig = STATUS_CONFIG[po.status];
                        return (
                            <Link
                                key={po.id}
                                href={`/purchase-orders/${po.id}`}
                                className="block group"
                            >
                                <div className="flex items-center gap-3 p-2.5 rounded-md border bg-card hover:bg-accent transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-medium text-sm truncate group-hover:text-primary">
                                                {po.po_number}
                                            </p>
                                            <Badge variant={statusConfig.variant} className="text-xs px-1.5 py-0">
                                                {statusConfig.label}
                                            </Badge>
                                            <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="truncate">{po.vendor_name}</span>
                                            <span>•</span>
                                            <span>{po.project_code}</span>
                                            <span>•</span>
                                            <span>{formatDate(po.created_at)}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn('text-sm font-semibold font-mono', statusConfig.color)}>
                                            {formatCurrency(po.total_amount, po.currency)}
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
