import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDashboardFilter } from '@/contexts/DashboardFilterContext';
import PayablesActionableBanner from './PayablesActionableBanner';
import InvoiceStatusPipeline from './InvoiceStatusPipeline';
import InvoiceReviewQueue from './InvoiceReviewQueue';
import CRApprovalWidget from './CRApprovalWidget';
import InvoiceAgingChart from './InvoiceAgingChart';
import PaymentSchedule from './PaymentSchedule';
import QuickPayablesActions from './QuickPayablesActions';
import PayablesActivityTimeline from './PayablesActivityTimeline';

export default function PayablesDashboard() {
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
            '/api/dashboard/payables/actionable-items',
            '/api/dashboard/payables/invoice-status-pipeline',
            '/api/dashboard/payables/invoice-review-queue',
            '/api/dashboard/payables/cr-approval-queue',
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
            <PayablesActionableBanner />

            {/* 2. Invoice Processing Pipeline */}
            <InvoiceStatusPipeline />

            {/* 3. Work Queues */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <InvoiceReviewQueue />
                <CRApprovalWidget />
            </div>

            {/* 4. Planning & Tracking */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column - Aging & Payment Schedule */}
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <InvoiceAgingChart />
                        <PaymentSchedule />
                    </div>
                </div>

                {/* Right Column - Quick Actions & Activity */}
                <div className="space-y-4">
                    <QuickPayablesActions />
                    <PayablesActivityTimeline />
                </div>
            </div>
        </div>
    );
}
