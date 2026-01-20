import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDashboardFilter } from '@/contexts/DashboardFilterContext';
import APAgingSummary from './APAgingSummary';
import InvoicePipelineStatus from './InvoicePipelineStatus';
import PendingApprovalsByRole from './PendingApprovalsByRole';
import UpcomingCashOut from './UpcomingCashOut';
import POUtilizationSnapshot from './POUtilizationSnapshot';
import ProcessBottleneckIndicators from './ProcessBottleneckIndicators';
import TopVendorsByOutstanding from './TopVendorsByOutstanding';
import ProjectSpendSummary from './ProjectSpendSummary';
import DocumentAttachmentHealth from './DocumentAttachmentHealth';
import RecentActivityFeed from './RecentActivityFeed';
import { getDashboardConfig, type WidgetType } from '../../config/dashboardConfig';

interface UnifiedDashboardProps {
    role: string;
}

export default function UnifiedDashboard({ role }: UnifiedDashboardProps) {
    const queryClient = useQueryClient();
    const { customDates } = useDashboardFilter();

    // Prefetch critical widgets on mount for instant loading
    useEffect(() => {
        const params = new URLSearchParams();
        if (customDates?.start) {
            params.append('start', customDates.start.toISOString());
        }
        if (customDates?.end) {
            params.append('end', customDates.end.toISOString());
        }

        // Define critical endpoints that should load immediately
        const criticalEndpoints = [
            '/api/dashboard/unified/ap-aging',
            '/api/dashboard/unified/invoice-pipeline',
            '/api/dashboard/unified/pending-approvals',
            '/api/dashboard/unified/upcoming-cashout',
            '/api/dashboard/unified/po-utilization',
            '/api/dashboard/unified/bottlenecks',
            '/api/dashboard/unified/top-vendors',
            '/api/dashboard/unified/project-spend',
            '/api/dashboard/unified/compliance',
            '/api/dashboard/unified/activity-feed',
        ];

        // Prefetch all critical endpoints in parallel
        criticalEndpoints.forEach(endpoint => {
            queryClient.prefetchQuery({
                queryKey: [endpoint, {
                    start: customDates?.start?.toISOString(),
                    end: customDates?.end?.toISOString(),
                }],
                queryFn: () => fetch(`${endpoint}?${params.toString()}`).then(r => r.json()),
                staleTime: 5 * 60 * 1000, // 5 minutes
            });
        });
    }, [queryClient, customDates]);

    // Widget component mapping
    const widgetComponents: Record<WidgetType, React.ReactNode> = {
        'ap-aging': <APAgingSummary key="ap-aging" />,
        'upcoming-cashout': <UpcomingCashOut key="upcoming-cashout" />,
        'pending-approvals': <PendingApprovalsByRole key="pending-approvals" />,
        'invoice-pipeline': <InvoicePipelineStatus key="invoice-pipeline" />,
        'po-utilization': <POUtilizationSnapshot key="po-utilization" />,
        'bottlenecks': <ProcessBottleneckIndicators key="bottlenecks" />,
        'top-vendors': <TopVendorsByOutstanding key="top-vendors" />,
        'project-spend': <ProjectSpendSummary key="project-spend" />,
        'compliance': <DocumentAttachmentHealth key="compliance" />,
        'activity-feed': <RecentActivityFeed key="activity-feed" />,
    };

    // Get configuration for current role
    const config = getDashboardConfig(role);

    return (
        <div className="space-y-6">
            {config.rows.map((row, rowIndex) => (
                <div key={`row-${rowIndex}`} className={row.gridClass}>
                    {row.widgets.map(widgetId => widgetComponents[widgetId])}
                </div>
            ))}
        </div>
    );
}
