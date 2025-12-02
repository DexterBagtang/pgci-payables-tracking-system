import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from '@inertiajs/react';

/**
 * Hook for invalidating dashboard queries after data mutations
 * This ensures the dashboard stays up-to-date when data changes
 */
export function useDashboardInvalidation() {
    const queryClient = useQueryClient();

    /**
     * Invalidate all dashboard queries for a specific dashboard type
     */
    const invalidateDashboard = (dashboardType: 'disbursement' | 'payables' | 'purchasing' | 'all') => {
        if (dashboardType === 'all') {
            // Invalidate all dashboard queries
            queryClient.invalidateQueries({
                predicate: (query) => {
                    const key = query.queryKey[0];
                    return typeof key === 'string' && key.startsWith('/api/dashboard/');
                },
            });
        } else {
            // Invalidate specific dashboard queries
            queryClient.invalidateQueries({
                predicate: (query) => {
                    const key = query.queryKey[0];
                    return typeof key === 'string' && key.startsWith(`/api/dashboard/${dashboardType}`);
                },
            });
        }
    };

    return { invalidateDashboard };
}

/**
 * Hook for updating disbursements with automatic dashboard refresh
 */
export function useUpdateDisbursement() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { id: number; [key: string]: any }) => {
            const response = await fetch(`/api/disbursements/${data.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to update disbursement');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate all disbursement dashboard queries
            queryClient.invalidateQueries({
                predicate: (query) => {
                    const key = query.queryKey[0];
                    return typeof key === 'string' && key.startsWith('/api/dashboard/disbursement');
                },
                refetchType: 'active', // Only refetch currently visible widgets
            });
        },
    });
}

/**
 * Hook for updating invoices with automatic dashboard refresh
 */
export function useUpdateInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { id: number; [key: string]: any }) => {
            const response = await fetch(`/api/invoices/${data.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to update invoice');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate payables dashboard queries
            queryClient.invalidateQueries({
                predicate: (query) => {
                    const key = query.queryKey[0];
                    return typeof key === 'string' && key.startsWith('/api/dashboard/payables');
                },
                refetchType: 'active',
            });
        },
    });
}

/**
 * Hook for updating check requisitions with automatic dashboard refresh
 */
export function useUpdateCheckRequisition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { id: number; [key: string]: any }) => {
            const response = await fetch(`/api/check-requisitions/${data.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to update check requisition');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate both payables and disbursement dashboards
            queryClient.invalidateQueries({
                predicate: (query) => {
                    const key = query.queryKey[0];
                    return typeof key === 'string' && (
                        key.startsWith('/api/dashboard/payables') ||
                        key.startsWith('/api/dashboard/disbursement')
                    );
                },
                refetchType: 'active',
            });
        },
    });
}

/**
 * Hook for updating purchase orders with automatic dashboard refresh
 */
export function useUpdatePurchaseOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { id: number; [key: string]: any }) => {
            const response = await fetch(`/api/purchase-orders/${data.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to update purchase order');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate purchasing dashboard queries
            queryClient.invalidateQueries({
                predicate: (query) => {
                    const key = query.queryKey[0];
                    return typeof key === 'string' && key.startsWith('/api/dashboard/purchasing');
                },
                refetchType: 'active',
            });
        },
    });
}

/**
 * Hook for manually refreshing dashboard after Inertia page visits
 * Useful when navigating back to dashboard after making changes elsewhere
 */
export function useInertiaInvalidation() {
    const queryClient = useQueryClient();

    // Invalidate queries when returning to dashboard
    const invalidateOnReturn = () => {
        queryClient.invalidateQueries({
            predicate: (query) => {
                const key = query.queryKey[0];
                return typeof key === 'string' && key.startsWith('/api/dashboard/');
            },
        });
    };

    return { invalidateOnReturn };
}
