import { useState, useEffect } from 'react';
import { useDashboardFilter } from '@/contexts/DashboardFilterContext';

interface UseDashboardWidgetOptions {
    endpoint: string;
    enabled?: boolean;
}

interface UseDashboardWidgetReturn<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useDashboardWidget<T = any>({
    endpoint,
    enabled = true
}: UseDashboardWidgetOptions): UseDashboardWidgetReturn<T> {
    const { timeRange, customDates } = useDashboardFilter();
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        if (!enabled) return;

        setLoading(true);
        setError(null);

        try {
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

            const result = await response.json();
            setData(result);
        } catch (err) {
            console.error(`Failed to fetch from ${endpoint}:`, err);
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [endpoint, timeRange, customDates, enabled]);

    return {
        data,
        loading,
        error,
        refetch: fetchData
    };
}
