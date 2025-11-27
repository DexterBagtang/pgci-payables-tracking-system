import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { dashboard } from '@/routes';
import type { TimeRange, DashboardFilterContext as FilterContextType } from '@/types';

const DashboardFilterContext = createContext<FilterContextType | undefined>(undefined);

interface DashboardFilterProviderProps {
    children: ReactNode;
    initialRange?: TimeRange;
    initialStart?: string | null;
    initialEnd?: string | null;
}

export function DashboardFilterProvider({
    children,
    initialRange = 'all',
    initialStart = null,
    initialEnd = null,
}: DashboardFilterProviderProps) {
    const [timeRange, setTimeRange] = useState<TimeRange>(initialRange);
    const [customDates, setCustomDates] = useState<{ start: Date; end: Date } | null>(() => {
        if (initialStart && initialEnd) {
            return {
                start: new Date(initialStart),
                end: new Date(initialEnd),
            };
        }
        return null;
    });

    // Update URL when filter changes
    useEffect(() => {
        // Save to localStorage for user preference
        localStorage.setItem('dashboard_time_range', timeRange);
        if (customDates) {
            localStorage.setItem('dashboard_custom_dates', JSON.stringify(customDates));
        }

        // Build URL params
        const params: Record<string, string> = { range: timeRange };
        if (timeRange === 'custom' && customDates) {
            params.start = customDates.start.toISOString().split('T')[0];
            params.end = customDates.end.toISOString().split('T')[0];
        }

        // Update URL with Inertia
        router.visit(dashboard().url, {
            data: params,
            preserveState: true,
            preserveScroll: true,
            only: [
                'alerts',
                'timeRange',
                'poStatusDistribution',
                'poAging',
                'financialCommitments',
                'budgetTracking',
                'vendorPerformance',
                'currencyBreakdown',
                'poCreationTrend',
                'expectedDeliveries',
                'invoiceReviewQueue',
                'crApprovalQueue',
                'invoiceAging',
                'paymentSchedule',
                'invoiceStatusFunnel',
                'financialMetrics',
                'approvalVelocity',
                'checkSchedule',
                'printingQueue',
                'pendingReleases',
                'disbursementTrends',
                'checkAging',
                'vendorPaymentStatus',
                'disbursementMetrics',
                'releaseVelocity',
                'systemOverview',
                'processBottlenecks',
                'teamPerformance',
                'financialHealthScore',
                'endToEndProcessTime',
                'completeSummary',
                'activityHeatmap',
                'allStatusDistributions',
            ],
        });
    }, [timeRange, customDates]);

    const handleSetTimeRange = (range: TimeRange) => {
        setTimeRange(range);
        // Clear custom dates when switching to a preset range
        if (range !== 'custom') {
            setCustomDates(null);
        }
    };

    const handleSetCustomDates = (dates: { start: Date; end: Date } | null) => {
        setCustomDates(dates);
        if (dates) {
            setTimeRange('custom');
        }
    };

    const value: FilterContextType = {
        timeRange,
        setTimeRange: handleSetTimeRange,
        customDates,
        setCustomDates: handleSetCustomDates,
    };

    return (
        <DashboardFilterContext.Provider value={value}>
            {children}
        </DashboardFilterContext.Provider>
    );
}

export function useDashboardFilter() {
    const context = useContext(DashboardFilterContext);
    if (context === undefined) {
        throw new Error('useDashboardFilter must be used within a DashboardFilterProvider');
    }
    return context;
}
