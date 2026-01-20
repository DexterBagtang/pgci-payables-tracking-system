import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type DashboardData } from '@/types';
import { Head } from '@inertiajs/react';
import { DashboardFilterProvider } from '@/contexts/DashboardFilterContext';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TimeRangeFilter from './components/shared/TimeRangeFilter';
import UnifiedDashboard from './components/unified/UnifiedDashboard';
// Role-based dashboards (commented out for unified dashboard)
// import PurchasingDashboard from './components/purchasing/PurchasingDashboard';
// import PayablesDashboard from './components/payables/PayablesDashboard';
// import DisbursementDashboard from './components/disbursement/DisbursementDashboard';
// import AdminDashboard from './components/admin/AdminDashboard';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard(props: DashboardData) {
    const { role, alerts, timeRange } = props;
    const queryClient = useQueryClient();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await queryClient.invalidateQueries({
            predicate: (query) => {
                const queryKey = query.queryKey[0];
                return typeof queryKey === 'string' && queryKey.startsWith('/api/dashboard/unified');
            },
        });
        setIsRefreshing(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <DashboardFilterProvider
                initialRange={timeRange.range}
                initialStart={timeRange.start}
                initialEnd={timeRange.end}
            >
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                    {/* Time Range Filter */}
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold">Dashboard</h1>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                variant="ghost"
                                size="icon"
                                title={isRefreshing ? 'Refreshing...' : 'Refresh dashboard data'}
                            >
                                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </Button>
                            <TimeRangeFilter />
                        </div>
                    </div>

                    {/* Alert Summary */}
                    {alerts && alerts.length > 0 && (
                        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                            <p className="text-sm font-medium text-orange-800">
                                {alerts.length} active alert{alerts.length > 1 ? 's' : ''} requiring attention
                            </p>
                        </div>
                    )}

                    {/* Unified Dashboard Content (Role-Based Widget Ordering) */}
                    <UnifiedDashboard role={role} />

                    {/* Role-Based Dashboards (Commented out for unified approach)
                    {role === 'purchasing' && <PurchasingDashboard />}
                    {role === 'payables' && <PayablesDashboard />}
                    {role === 'disbursement' && <DisbursementDashboard />}
                    {role === 'admin' && <AdminDashboard />}
                    */}
                </div>
            </DashboardFilterProvider>
        </AppLayout>
    );
}
