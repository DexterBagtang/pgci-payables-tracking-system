import { useState, useRef, useCallback, useEffect } from 'react';
import { Activity, FileText, ShoppingCart, FolderKanban, Users, Receipt, Wallet, Loader2 } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import WidgetError from '../shared/WidgetError';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
import type { ActivityFeedItem, ActivityFeedResponse } from '@/types';
import { Badge } from '@/components/ui/badge';
import { useDashboardFilter } from '@/contexts/DashboardFilterContext';

export default function RecentActivityFeed() {
    const { customDates } = useDashboardFilter();
    const [page, setPage] = useState(1);
    const [allActivities, setAllActivities] = useState<ActivityFeedItem[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const observerTarget = useRef<HTMLDivElement>(null);

    const { data, loading, error, refetch, isRefetching } = useDashboardWidget<ActivityFeedResponse>({
        endpoint: '/api/dashboard/unified/activity-feed',
    });

    // Reset and load initial data when filter changes or data updates
    useEffect(() => {
        if (data) {
            setAllActivities(data.data);
            setHasMore(data.hasMore);
            setPage(1);
        }
    }, [data, customDates]);

    const buildEndpoint = (currentPage: number) => {
        const params = new URLSearchParams();
        if (customDates?.start) params.append('start', customDates.start.toISOString());
        if (customDates?.end) params.append('end', customDates.end.toISOString());
        params.append('page', currentPage.toString());
        return `/api/dashboard/unified/activity-feed?${params.toString()}`;
    };

    const loadMore = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        try {
            const nextPage = page + 1;
            const response = await fetch(buildEndpoint(nextPage));
            const result: ActivityFeedResponse = await response.json();

            setAllActivities(prev => [...prev, ...result.data]);
            setHasMore(result.hasMore);
            setPage(nextPage);
        } catch (err) {
            console.error('Failed to load more activities:', err);
        } finally {
            setIsLoadingMore(false);
        }
    }, [page, hasMore, isLoadingMore, customDates]);

    // Intersection Observer for infinite scroll
    const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
        const [target] = entries;
        if (target.isIntersecting && hasMore && !isLoadingMore) {
            loadMore();
        }
    }, [hasMore, isLoadingMore, loadMore]);

    // Set up intersection observer
    useEffect(() => {
        const element = observerTarget.current;
        const observer = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: '20px',
            threshold: 1.0
        });

        if (element) observer.observe(element);

        return () => {
            if (element) observer.unobserve(element);
        };
    }, [handleObserver]);

    if (loading) {
        return <WidgetSkeleton variant="list" />;
    }

    if (error || !data) {
        return <WidgetError message={error || 'Failed to load activity feed'} onRetry={refetch} />;
    }

    const displayActivities = allActivities.length > 0 ? allActivities : data.data;

    // Helper to format action text (snake_case to Title Case)
    const formatAction = (action: string): string => {
        return action
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

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
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                {displayActivities.length > 0 ? (
                    <>
                        {displayActivities.map((activity) => {
                            const Icon = getEntityIcon(activity.entity_type);
                            const color = getEntityColor(activity.entity_type);

                            return (
                                <div key={activity.id} className="flex gap-2 p-2 rounded border hover:bg-accent/50 transition-colors">
                                    {/* Icon */}
                                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded ${color.bg}`}>
                                        <Icon className={`h-3.5 w-3.5 ${color.text}`} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-xs font-medium truncate">{activity.user}</span>
                                                <Badge variant={getActionVariant(activity.action)} className="text-[10px] h-4 px-1.5">
                                                    {formatAction(activity.action)}
                                                </Badge>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                {activity.created_at_human}
                                            </span>
                                        </div>

                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            <span className="font-medium">{activity.entity_type}</span>
                                            {activity.entity_identifier !== 'N/A' && (
                                                <span className="ml-1">#{activity.entity_identifier}</span>
                                            )}
                                        </div>

                                        {activity.notes && (
                                            <div className="text-[10px] text-muted-foreground italic truncate mt-0.5">
                                                {activity.notes}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Infinite scroll trigger */}
                        {hasMore && (
                            <div ref={observerTarget} className="flex justify-center py-2">
                                {isLoadingMore && (
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                        No recent activity
                    </div>
                )}
            </div>
        </DashboardCard>
    );
}
