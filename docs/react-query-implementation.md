# React Query Dashboard Implementation

## Overview

This document describes the React Query implementation for the dashboard, which provides automatic caching, background refetching, and optimistic updates for better performance and user experience.

## What Was Implemented

### 1. React Query Setup (`resources/js/app.tsx`)

- Installed `@tanstack/react-query` and `@tanstack/react-query-devtools`
- Configured QueryClient with optimized settings:
  - **staleTime**: 5 minutes - data considered fresh
  - **gcTime**: 10 minutes - cache retention time
  - **refetchOnWindowFocus**: true - auto-refresh when user returns
  - **refetchOnReconnect**: true - auto-refresh when internet reconnects
  - **retry**: 2 - retry failed requests twice

### 2. Enhanced useDashboardWidget Hook (`resources/js/hooks/useDashboardWidget.ts`)

Replaced the manual fetch implementation with React Query's `useQuery` hook.

**New Features:**
- Automatic caching with smart cache keys
- Stale-while-revalidate pattern (shows cached data while fetching fresh)
- Background refetching
- Request deduplication
- Configurable stale times per widget

**API:**
```tsx
const {
    data,           // The fetched data
    loading,        // Initial loading state
    error,          // Error message if any
    refetch,        // Manual refetch function
    isRefetching,   // Background refetch indicator
    isFetching      // Any fetch in progress
} = useDashboardWidget<T>({
    endpoint: '/api/dashboard/...',
    enabled: true,                    // Optional: enable/disable query
    staleTime: 5 * 60 * 1000         // Optional: custom stale time
});
```

### 3. DashboardCard Refresh Indicator (`resources/js/pages/dashboard/components/shared/DashboardCard.tsx`)

Added `isRefreshing` prop to show a subtle loading spinner when data is being refetched in the background.

**Usage:**
```tsx
<DashboardCard
    title="Widget Title"
    description="Widget description"
    icon={IconComponent}
    isRefreshing={isRefetching}  // Shows spinner when refetching
>
    {/* Widget content */}
</DashboardCard>
```

### 4. Widget Component Updates

Updated sample widgets to use the new features:

**CheckPrintingQueue.tsx:**
```tsx
const { data, loading, error, refetch, isRefetching } = useDashboardWidget<PrintingQueueItem[]>({
    endpoint: '/api/dashboard/disbursement/printing-queue',
    staleTime: 3 * 60 * 1000, // 3 minutes for time-sensitive data
});
```

**InvoiceReviewQueue.tsx:**
```tsx
const { data, loading, error, refetch, isRefetching } = useDashboardWidget<Invoice[]>({
    endpoint: '/api/dashboard/payables/invoice-review-queue',
    staleTime: 3 * 60 * 1000, // 3 minutes for time-sensitive data
});
```

### 5. Dashboard Prefetching

Added prefetching to all three dashboard pages to load critical widgets instantly.

**How it works:**
1. When a dashboard page loads, it prefetches data for critical widgets
2. Widgets load instantly from cache instead of waiting for API calls
3. Background refetch ensures data stays fresh

**Example (DisbursementDashboard.tsx):**
```tsx
const queryClient = useQueryClient();
const { customDates } = useDashboardFilter();

useEffect(() => {
    const criticalEndpoints = [
        '/api/dashboard/disbursement/actionable-items',
        '/api/dashboard/disbursement/check-status-pipeline',
        '/api/dashboard/disbursement/printing-queue',
        '/api/dashboard/disbursement/pending-releases',
    ];

    criticalEndpoints.forEach(endpoint => {
        queryClient.prefetchQuery({
            queryKey: [endpoint, { start: ..., end: ... }],
            queryFn: () => fetch(`${endpoint}?${params}`).then(r => r.json()),
            staleTime: 3 * 60 * 1000,
        });
    });
}, [queryClient, customDates]);
```

### 6. Mutation Hooks (`resources/js/hooks/useDashboardMutations.ts`)

Created hooks for automatic dashboard invalidation after data mutations.

**Available Hooks:**

1. **useDashboardInvalidation** - Manual invalidation
```tsx
const { invalidateDashboard } = useDashboardInvalidation();
invalidateDashboard('disbursement'); // or 'payables', 'purchasing', 'all'
```

2. **useUpdateDisbursement** - Update disbursements
```tsx
const updateMutation = useUpdateDisbursement();
updateMutation.mutate({ id: 123, status: 'released' });
// Automatically refreshes disbursement dashboard
```

3. **useUpdateInvoice** - Update invoices
```tsx
const updateMutation = useUpdateInvoice();
updateMutation.mutate({ id: 456, invoice_status: 'approved' });
// Automatically refreshes payables dashboard
```

4. **useUpdateCheckRequisition** - Update check requisitions
```tsx
const updateMutation = useUpdateCheckRequisition();
updateMutation.mutate({ id: 789, requisition_status: 'approved' });
// Automatically refreshes both payables and disbursement dashboards
```

5. **useUpdatePurchaseOrder** - Update purchase orders
```tsx
const updateMutation = useUpdatePurchaseOrder();
updateMutation.mutate({ id: 321, po_status: 'closed' });
// Automatically refreshes purchasing dashboard
```

6. **useInertiaInvalidation** - Invalidate on Inertia navigation
```tsx
const { invalidateOnReturn } = useInertiaInvalidation();
// Call when returning to dashboard from other pages
```

## Performance Benefits

### Before React Query:
- ❌ Each widget makes fresh API call on every load
- ❌ No caching - slow repeated loads
- ❌ Waterfall effect - widgets load sequentially
- ❌ Manual state management
- ❌ No background sync

### After React Query:
- ✅ **Instant loading** - Cached data shows immediately
- ✅ **Smart caching** - Data cached for 5 minutes by default
- ✅ **Parallel loading** - All widgets fetch simultaneously
- ✅ **Stale-while-revalidate** - Show cached data, fetch fresh in background
- ✅ **Automatic refetch** - Refreshes on window focus, reconnect
- ✅ **Request deduplication** - Multiple same requests = 1 API call
- ✅ **Background sync** - Keeps data fresh without blocking UI
- ✅ **Optimistic updates** - UI updates instantly on mutations

## Recommended Stale Times

Configure `staleTime` based on data sensitivity:

- **High Priority/Time-Sensitive** (3 minutes)
  - Check printing queue
  - Invoice review queue
  - Actionable items
  - CR approval queue

- **Medium Priority** (5 minutes) - Default
  - Financial metrics
  - Status pipelines
  - Recent activity

- **Low Priority** (10 minutes)
  - Historical charts
  - Vendor metrics
  - Project metrics

## Usage Examples

### Basic Widget Implementation
```tsx
export default function MyWidget() {
    const { data, loading, error, refetch, isRefetching } = useDashboardWidget<MyDataType[]>({
        endpoint: '/api/dashboard/my-endpoint',
        staleTime: 5 * 60 * 1000,
    });

    if (loading) {
        return <WidgetSkeleton variant="list" title="My Widget" />;
    }

    if (error || !data) {
        return (
            <DashboardCard title="My Widget" icon={Icon}>
                <WidgetError message={error || 'Failed to load'} onRetry={refetch} />
            </DashboardCard>
        );
    }

    return (
        <DashboardCard
            title="My Widget"
            icon={Icon}
            isRefreshing={isRefetching}
        >
            {/* Widget content */}
        </DashboardCard>
    );
}
```

### Using Mutation Hooks
```tsx
import { useUpdateDisbursement } from '@/hooks/useDashboardMutations';

export default function DisbursementActions({ disbursementId }) {
    const updateMutation = useUpdateDisbursement();

    const handleRelease = async () => {
        try {
            await updateMutation.mutateAsync({
                id: disbursementId,
                date_check_released_to_vendor: new Date().toISOString(),
            });
            // Dashboard automatically refreshes!
            toast.success('Disbursement released successfully');
        } catch (error) {
            toast.error('Failed to release disbursement');
        }
    };

    return (
        <Button
            onClick={handleRelease}
            disabled={updateMutation.isPending}
        >
            {updateMutation.isPending ? 'Releasing...' : 'Release Check'}
        </Button>
    );
}
```

### Manual Dashboard Refresh
```tsx
import { useDashboardInvalidation } from '@/hooks/useDashboardMutations';

export default function RefreshButton() {
    const { invalidateDashboard } = useDashboardInvalidation();

    return (
        <Button onClick={() => invalidateDashboard('all')}>
            Refresh All Dashboards
        </Button>
    );
}
```

## DevTools

Access React Query DevTools in development:
- **Floating Button**: Click the React Query icon in bottom-left corner
- **View Queries**: See all cached queries, their states, and data
- **Manually Refetch**: Force refetch any query
- **Inspect Cache**: View cache keys, stale times, and cache status

## Next Steps (Optional Improvements)

1. **Add Optimistic Updates**
   - Update UI immediately before API call completes
   - Rollback if mutation fails

2. **Implement Infinite Scroll**
   - Use `useInfiniteQuery` for paginated widgets
   - Load more data as user scrolls

3. **Add Polling**
   - Use `refetchInterval` for real-time data
   - E.g., critical queue counts every 30 seconds

4. **Add Error Boundaries**
   - Catch and display query errors gracefully
   - Provide retry mechanisms

5. **Backend Optimization**
   - Add database indexes
   - Implement Redis caching
   - Fix N+1 queries
   - Optimize aggregations

## Troubleshooting

### Cache Not Updating
- Check query keys match exactly
- Verify staleTime isn't too long
- Ensure mutations invalidate correct queries

### Widgets Not Prefetching
- Verify endpoints in prefetch list match widget endpoints
- Check query keys structure is identical
- Ensure customDates are formatted consistently

### Slow Initial Load
- Reduce number of prefetched endpoints
- Increase staleTime for less critical widgets
- Optimize backend queries

## Migration Checklist

To migrate remaining widgets to React Query:

- [ ] Update widget to use `useDashboardWidget` hook
- [ ] Add `isRefreshing` prop to DashboardCard
- [ ] Add appropriate `staleTime` based on data sensitivity
- [ ] Add endpoint to dashboard prefetch list if critical
- [ ] Test loading, error, and success states
- [ ] Verify cache invalidation works for mutations

## Conclusion

React Query significantly improves dashboard performance through intelligent caching and background synchronization. Users experience instant loading with always-fresh data, while the development team benefits from automatic state management and reduced boilerplate code.
