import { Activity, Printer, Send, XCircle } from 'lucide-react';
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
    entity_type: 'disbursement';
    entity_id: number;
    entity_name: string;
    user_name: string;
    created_at: string;
    metadata?: {
        status?: string;
        amount?: number;
        check_number?: string;
    };
}

export default function DisbursementActivityTimeline() {
    const { data, loading, error, refetch } = useDashboardWidget<ActivityItem[]>({
        endpoint: '/api/dashboard/disbursement/activity-timeline'
    });

    if (loading) {
        return <WidgetSkeleton variant="list" title="Recent Activity" />;
    }

    if (error || !data) {
        return (
            <DashboardCard
                title="Recent Activity"
                description="Latest disbursement actions"
                icon={Activity}
            >
                <WidgetError message={error || 'Failed to load activity'} onRetry={refetch} />
            </DashboardCard>
        );
    }

    const getActivityIcon = (action: string) => {
        switch (action) {
            case 'printed':
                return Printer;
            case 'released':
                return Send;
            case 'voided':
                return XCircle;
            default:
                return Activity;
        }
    };

    const getActionBadge = (action: string) => {
        const actionMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
            printed: { variant: 'default', label: 'Printed' },
            released: { variant: 'default', label: 'Released' },
            voided: { variant: 'destructive', label: 'Voided' },
            created: { variant: 'secondary', label: 'Created' },
            updated: { variant: 'outline', label: 'Updated' },
        };
        return actionMap[action] || { variant: 'outline', label: action };
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
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
                            const ActivityIcon = getActivityIcon(activity.action);
                            const actionBadge = getActionBadge(activity.action);

                            return (
                                <div key={activity.id} className="relative">
                                    {index < data.length - 1 && (
                                        <div className="absolute left-4 top-10 bottom-0 w-px bg-border" />
                                    )}
                                    <div className="flex gap-3 pb-3">
                                        <div className="p-2 rounded-full bg-accent shrink-0 h-fit">
                                            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge variant={actionBadge.variant} className="text-xs">
                                                        {actionBadge.label}
                                                    </Badge>
                                                    {activity.metadata?.check_number && (
                                                        <span className="text-xs font-mono text-muted-foreground">
                                                            #{activity.metadata.check_number}
                                                        </span>
                                                    )}
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
                                                        {formatCurrency(activity.metadata.amount)}
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
