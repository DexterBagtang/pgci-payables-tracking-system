import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDashboardFilter } from '@/contexts/DashboardFilterContext';

interface UseDashboardWidgetOptions {
    endpoint: string;
    enabled?: boolean;
    staleTime?: number;
}

interface UseDashboardWidgetReturn<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
    isRefetching: boolean;
    isFetching: boolean;
}

export function useDashboardWidget<T = any>({
    endpoint,
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes default
}: UseDashboardWidgetOptions): UseDashboardWidgetReturn<T> {
    const { timeRange, customDates } = useDashboardFilter();
    const queryClient = useQueryClient();

    // Build query key with all dependencies
    const queryKey = [
        endpoint,
        {
            start: customDates?.start?.toISOString(),
            end: customDates?.end?.toISOString(),
            timeRange,
        },
    ];

    const fetchData = async (): Promise<T> => {
        const params = new URLSearchParams();

        if (customDates?.start) {
            params.append('start', customDates.start.toISOString());
        }
        if (customDates?.end) {
            params.append('end', customDates.end.toISOString());
        }

        const response = await fetch(`${endpoint}?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    };

    const query = useQuery({
        queryKey,
        queryFn: fetchData,
        enabled,
        staleTime,
        // Show cached data while fetching fresh data (stale-while-revalidate pattern)
        placeholderData: (previousData) => previousData,
    });

    // Manual refetch function that invalidates the query
    const refetch = () => {
        queryClient.invalidateQueries({ queryKey });
    };

    return {
        data: query.data ?? null,
        loading: query.isLoading,
        error: query.error?.message ?? null,
        refetch,
        isRefetching: query.isRefetching,
        isFetching: query.isFetching,
    };
}
