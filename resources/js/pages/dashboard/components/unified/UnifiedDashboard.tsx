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

export default function UnifiedDashboard() {
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

    return (
        <div className="space-y-6">
            {/* Row 1 - Critical Metrics (4 cards on desktop, 2 on tablet, 1 on mobile) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <APAgingSummary />
                <UpcomingCashOut />
                <PendingApprovalsByRole />
                <InvoicePipelineStatus />
            </div>

            {/* Row 2 - Financial Analytics */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <POUtilizationSnapshot />
                <ProcessBottleneckIndicators />
            </div>

            {/* Row 3 - Vendor & Project Analytics */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <TopVendorsByOutstanding />
                <ProjectSpendSummary />
            </div>

            {/* Row 4 - Compliance & Activity */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <DocumentAttachmentHealth />
                <RecentActivityFeed />
            </div>
        </div>
    );
}
