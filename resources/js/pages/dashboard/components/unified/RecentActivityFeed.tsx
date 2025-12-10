import { Activity, User, FileText, ShoppingCart, FolderKanban, Users, Receipt, Wallet } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import WidgetError from '../shared/WidgetError';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
import type { ActivityFeedItem } from '@/types';
import { Badge } from '@/components/ui/badge';

export default function RecentActivityFeed() {
    const { data, loading, error, refetch, isRefetching } = useDashboardWidget<ActivityFeedItem[]>({
        endpoint: '/api/dashboard/unified/activity-feed',
    });

    if (loading) {
        return <WidgetSkeleton variant="list" />;
    }

    if (error || !data) {
        return <WidgetError message={error || 'Failed to load activity feed'} onRetry={refetch} />;
    }

    // Helper to get icon for entity type
    const getEntityIcon = (entityType: string) => {
        switch (entityType) {
            case 'Purchase Order':
                return ShoppingCart;
            case 'Invoice':
                return FileText;
            case 'Vendor':
                return Users;
            case 'Project':
                return FolderKanban;
            case 'Check Requisition':
                return Receipt;
            case 'Disbursement':
                return Wallet;
            default:
                return Activity;
        }
    };

    // Helper to get color for entity type
    const getEntityColor = (entityType: string) => {
        switch (entityType) {
            case 'Purchase Order':
                return { text: 'text-blue-600', bg: 'bg-blue-100' };
            case 'Invoice':
                return { text: 'text-purple-600', bg: 'bg-purple-100' };
            case 'Vendor':
                return { text: 'text-green-600', bg: 'bg-green-100' };
            case 'Project':
                return { text: 'text-orange-600', bg: 'bg-orange-100' };
            case 'Check Requisition':
                return { text: 'text-pink-600', bg: 'bg-pink-100' };
            case 'Disbursement':
                return { text: 'text-teal-600', bg: 'bg-teal-100' };
            default:
                return { text: 'text-gray-600', bg: 'bg-gray-100' };
        }
    };

    // Helper to get badge color for action
    const getActionVariant = (action: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
        const lowerAction = action.toLowerCase();
        if (lowerAction.includes('created') || lowerAction.includes('added')) return 'default';
        if (lowerAction.includes('approved')) return 'default';
        if (lowerAction.includes('rejected') || lowerAction.includes('deleted')) return 'destructive';
        if (lowerAction.includes('updated') || lowerAction.includes('modified')) return 'secondary';
        return 'outline';
    };

    return (
        <DashboardCard
            title="Recent Activity"
            description="Latest system actions"
            icon={Activity}
            isRefreshing={isRefetching}
        >
            <div className="space-y-3">
                {data.length > 0 ? (
                    data.map((activity) => {
                        const Icon = getEntityIcon(activity.entity_type);
                        const color = getEntityColor(activity.entity_type);

                        return (
                            <div key={activity.id} className="flex gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                                {/* Icon */}
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded ${color.bg}`}>
                                    <Icon className={`h-5 w-5 ${color.text}`} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-medium truncate">{activity.user}</span>
                                            <Badge variant={getActionVariant(activity.action)} className="text-xs">
                                                {activity.action}
                                            </Badge>
                                        </div>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {activity.created_at_human}
                                        </span>
                                    </div>

                                    <div className="text-sm text-muted-foreground">
                                        <span className="font-medium">{activity.entity_type}</span>
                                        {activity.entity_identifier !== 'N/A' && (
                                            <span className="ml-1">#{activity.entity_identifier}</span>
                                        )}
                                    </div>

                                    {activity.notes && (
                                        <div className="text-xs text-muted-foreground italic truncate">
                                            {activity.notes}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                        No recent activity
                    </div>
                )}
            </div>
        </DashboardCard>
    );
}
