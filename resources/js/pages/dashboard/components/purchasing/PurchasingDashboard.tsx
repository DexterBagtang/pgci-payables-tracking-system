import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDashboardFilter } from '@/contexts/DashboardFilterContext';
import ActionableItemsBanner from './ActionableItemsBanner';
import POStatusOverview from './POStatusOverview';
import InvoiceStatusTracking from './InvoiceStatusTracking';
import QuickPOActions from './QuickPOActions';
import VendorMetrics from './VendorMetrics';
import ProjectMetrics from './ProjectMetrics';
import ActivityTimeline from './ActivityTimeline';

export default function PurchasingDashboard() {
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
            '/api/dashboard/purchasing/actionable-items',
            '/api/dashboard/purchasing/po-status-overview',
            '/api/dashboard/purchasing/invoice-status-tracking',
            '/api/dashboard/purchasing/vendor-metrics',
        ];

        // Prefetch all critical endpoints in parallel
        criticalEndpoints.forEach(endpoint => {
            queryClient.prefetchQuery({
                queryKey: [endpoint, {
                    start: customDates?.start?.toISOString(),
                    end: customDates?.end?.toISOString(),
                }],
                queryFn: () => fetch(`${endpoint}?${params.toString()}`).then(r => r.json()),
                staleTime: 5 * 60 * 1000, // 5 minutes for purchasing metrics
            });
        });
    }, [queryClient, customDates]);

    return (
        <div className="space-y-4">
            {/* 1. Hero Section - Critical Actionable Items */}
            <ActionableItemsBanner />

            {/* 2. Primary Status Tracking */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <POStatusOverview />
                <InvoiceStatusTracking />
            </div>

            {/* 3. Insights & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column - Vendor & Project Metrics */}
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <VendorMetrics />
                        <ProjectMetrics />
                    </div>
                </div>

                {/* Right Column - Quick Actions & Activity */}
                <div className="space-y-4">
                    <QuickPOActions />
                    <ActivityTimeline />
                </div>
            </div>
        </div>
    );
}
