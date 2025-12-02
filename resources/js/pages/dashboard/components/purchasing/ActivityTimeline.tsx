import { Activity, FileText, Receipt, Users, Briefcase, CheckCircle, XCircle, Clock } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import WidgetError from '../shared/WidgetError';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
import { cn } from '@/lib/utils';

interface ActivityItem {
    id: number;
    action: string;
    entity_type: 'purchase_order' | 'invoice' | 'vendor' | 'project';
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

const ENTITY_CONFIG = {
    purchase_order: {
        icon: FileText,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        label: 'PO',
    },
    invoice: {
        icon: Receipt,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        label: 'Invoice',
    },
    vendor: {
        icon: Users,
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        label: 'Vendor',
    },
    project: {
        icon: Briefcase,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        label: 'Project',
    },
};

const ACTION_CONFIG: Record<string, { icon: any; color: string }> = {
    created: { icon: CheckCircle, color: 'text-green-600' },
    updated: { icon: Activity, color: 'text-blue-600' },
    finalized: { icon: CheckCircle, color: 'text-green-600' },
    rejected: { icon: XCircle, color: 'text-red-600' },
    approved: { icon: CheckCircle, color: 'text-green-600' },
};

export default function ActivityTimeline() {
    const { data, loading, error, refetch } = useDashboardWidget<ActivityItem[]>({
        endpoint: '/api/dashboard/purchasing/activity-timeline'
    });

    if (loading) {
        return <WidgetSkeleton variant="list" title="Recent Activity" />;
    }

    if (error || !data) {
        return (
            <DashboardCard
                title="Recent Activity"
                description="Latest purchasing activities"
                icon={Activity}
            >
                <WidgetError message={error || 'Failed to load activity timeline'} onRetry={refetch} />
            </DashboardCard>
        );
    }

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
    };

    const isEmpty = data.length === 0;

    return (
        <DashboardCard
            title="Recent Activity"
            description="Latest purchasing activities"
            icon={Activity}
        >
            {isEmpty ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <p className="text-sm">No recent activity</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {data.map((activity, index) => {
                        const entityConfig = ENTITY_CONFIG[activity.entity_type];
                        const actionConfig = ACTION_CONFIG[activity.action] || { icon: Activity, color: 'text-gray-600' };
                        const EntityIcon = entityConfig.icon;
                        const ActionIcon = actionConfig.icon;

                        return (
                            <div key={activity.id} className="relative">
                                {index < data.length - 1 && (
                                    <div className="absolute left-4 top-9 bottom-0 w-px bg-border" />
                                )}
                                <div className="flex gap-3">
                                    <div className={cn(
                                        "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                                        entityConfig.bgColor
                                    )}>
                                        <EntityIcon className={cn("h-4 w-4", entityConfig.color)} />
                                        <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-background border">
                                            <ActionIcon className={cn("h-2.5 w-2.5", actionConfig.color)} />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0 pb-3">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm">
                                                    <span className="font-medium">{activity.user_name}</span>
                                                    {' '}
                                                    <span className="text-muted-foreground">{activity.action}</span>
                                                    {' '}
                                                    <span className="font-medium">{entityConfig.label}</span>
                                                </p>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {activity.entity_name}
                                                </p>
                                            </div>
                                            <span className="text-xs text-muted-foreground shrink-0">
                                                {formatTimeAgo(activity.created_at)}
                                            </span>
                                        </div>
                                        {activity.metadata && (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                {activity.metadata.status && (
                                                    <span className="px-1.5 py-0.5 rounded bg-muted">
                                                        {activity.metadata.status}
                                                    </span>
                                                )}
                                                {activity.metadata.amount && (
                                                    <span className="font-mono">
                                                        {new Intl.NumberFormat('en-PH', {
                                                            style: 'currency',
                                                            currency: activity.metadata.currency || 'PHP',
                                                            minimumFractionDigits: 0,
                                                        }).format(activity.metadata.amount)}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </DashboardCard>
    );
}
