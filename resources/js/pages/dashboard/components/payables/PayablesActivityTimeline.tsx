import { Activity, FileText, FileSignature, CheckCircle2, XCircle } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import WidgetError from '../shared/WidgetError';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
    id: number;
    action: string;
    entity_type: 'invoice' | 'check_requisition';
    entity_id: number;
    entity_name: string;
    user_name: string;
    created_at: string;
    metadata?: {
        status?: string;
        amount?: number;
        currency?: string;
    };
}

export default function PayablesActivityTimeline() {
    const { data, loading, error, refetch } = useDashboardWidget<ActivityItem[]>({
        endpoint: '/api/dashboard/payables/activity-timeline'
    });

    if (loading) {
        return <WidgetSkeleton variant="list" title="Recent Activity" />;
    }

    if (error || !data) {
        return (
            <DashboardCard
                title="Recent Activity"
                description="Latest payables actions"
                icon={Activity}
            >
                <WidgetError message={error || 'Failed to load activity'} onRetry={refetch} />
            </DashboardCard>
        );
    }

    const getEntityIcon = (type: string) => {
        switch (type) {
            case 'invoice':
                return FileText;
            case 'check_requisition':
                return FileSignature;
            default:
                return Activity;
        }
    };

    const getActionBadge = (action: string) => {
        const actionMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
            approved: { variant: 'default', label: 'Approved' },
            rejected: { variant: 'destructive', label: 'Rejected' },
            created: { variant: 'secondary', label: 'Created' },
            updated: { variant: 'outline', label: 'Updated' },
        };
        return actionMap[action] || { variant: 'outline', label: action };
    };

    const formatCurrency = (amount: number, currency: string = 'PHP') =>
        new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
        }).format(amount);

    return (
        <DashboardCard
            title="Recent Activity"
            description={`${data.length} recent action${data.length !== 1 ? 's' : ''}`}
            icon={Activity}
        >
            {data.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                    <p className="text-sm">No recent activity</p>
                </div>
            ) : (
                <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                        {data.map((activity, index) => {
                            const EntityIcon = getEntityIcon(activity.entity_type);
                            const actionBadge = getActionBadge(activity.action);

                            return (
                                <div key={activity.id} className="relative">
                                    {index < data.length - 1 && (
                                        <div className="absolute left-4 top-10 bottom-0 w-px bg-border" />
                                    )}
                                    <div className="flex gap-3 pb-3">
                                        <div className="p-2 rounded-full bg-accent shrink-0 h-fit">
                                            <EntityIcon className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge variant={actionBadge.variant} className="text-xs">
                                                        {actionBadge.label}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {activity.entity_type === 'invoice' ? 'Invoice' : 'CR'}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-muted-foreground shrink-0">
                                                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium mb-1">
                                                {activity.entity_name}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-muted-foreground">
                                                    by {activity.user_name}
                                                </p>
                                                {activity.metadata?.amount && (
                                                    <p className="text-xs font-mono font-medium">
                                                        {formatCurrency(activity.metadata.amount, activity.metadata.currency)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            )}
        </DashboardCard>
    );
}
