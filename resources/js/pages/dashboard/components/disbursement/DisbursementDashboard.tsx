import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDashboardFilter } from '@/contexts/DashboardFilterContext';
import DisbursementActionableBanner from './DisbursementActionableBanner';
import CheckStatusPipeline from './CheckStatusPipeline';
import CheckPrintingQueue from './CheckPrintingQueue';
import PendingReleasesWidget from './PendingReleasesWidget';
import CheckSchedule from './CheckSchedule';
import CheckAgingChart from './CheckAgingChart';
import QuickDisbursementActions from './QuickDisbursementActions';
import DisbursementActivityTimeline from './DisbursementActivityTimeline';

export default function DisbursementDashboard() {
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
            '/api/dashboard/disbursement/actionable-items',
            '/api/dashboard/disbursement/check-status-pipeline',
            '/api/dashboard/disbursement/printing-queue',
            '/api/dashboard/disbursement/pending-releases',
        ];

        // Prefetch all critical endpoints in parallel
        criticalEndpoints.forEach(endpoint => {
            queryClient.prefetchQuery({
                queryKey: [endpoint, {
                    start: customDates?.start?.toISOString(),
                    end: customDates?.end?.toISOString(),
                }],
                queryFn: () => fetch(`${endpoint}?${params.toString()}`).then(r => r.json()),
                staleTime: 3 * 60 * 1000, // 3 minutes
            });
        });
    }, [queryClient, customDates]);

    return (
        <div className="space-y-4">
            {/* 1. Hero Section - Critical Actionable Items */}
            <DisbursementActionableBanner />

            {/* 2. Check Processing Pipeline */}
            <CheckStatusPipeline />

            {/* 3. Work Queues */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <CheckPrintingQueue />
                <PendingReleasesWidget />
            </div>

            {/* 4. Planning & Tracking */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column - Schedule & Aging */}
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <CheckSchedule />
                        <CheckAgingChart />
                    </div>
                </div>

                {/* Right Column - Quick Actions & Activity */}
                <div className="space-y-4">
                    <QuickDisbursementActions />
                    <DisbursementActivityTimeline />
                </div>
            </div>
        </div>
    );
}
