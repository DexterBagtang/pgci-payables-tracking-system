import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type DashboardData } from '@/types';
import { Head } from '@inertiajs/react';
import { DashboardFilterProvider } from '@/contexts/DashboardFilterContext';
import TimeRangeFilter from './components/shared/TimeRangeFilter';

// Legacy components (to be replaced in phases 2-4)
import FinancialSummaryCards from './components/FinancialSummaryCards';
import PendingActionsWidget from './components/PendingActionsWidget';
import QuickActionsPanel from './components/QuickActionsPanel';
import UpcomingPayments from './components/UpcomingPayments';
import RecentDisbursements from './components/RecentDisbursements';

// Role-specific dashboard containers
import PurchasingDashboard from './components/purchasing/PurchasingDashboard';
import PayablesDashboard from './components/payables/PayablesDashboard';
import DisbursementDashboard from './components/disbursement/DisbursementDashboard';
import AdminDashboard from './components/admin/AdminDashboard';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard(props: DashboardData) {
    const { role, alerts, timeRange } = props;

    // Temporary fallback to old dashboard data structure for legacy components
    const legacyProps = {
        summary: {},
        actions: {},
        upcomingPayments: [],
        recentDisbursements: [],
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
                        <h1 className="text-2xl font-semibold">
                            {role === 'purchasing' && 'Purchasing Dashboard'}
                            {role === 'payables' && 'Payables Dashboard'}
                            {role === 'disbursement' && 'Disbursement Dashboard'}
                            {role === 'admin' && 'Admin Dashboard'}
                        </h1>
                        <TimeRangeFilter />
                    </div>

                    {/* Alert Summary - TODO: Implement AlertWidget in Phase 6 */}
                    {alerts && alerts.length > 0 && (
                        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                            <p className="text-sm font-medium text-orange-800">
                                {alerts.length} active alert{alerts.length > 1 ? 's' : ''} requiring attention
                            </p>
                        </div>
                    )}

                    {/* Role-Based Dashboard Content */}
                    {role === 'purchasing' && <PurchasingDashboard />}

                    {role === 'payables' && <PayablesDashboard />}

                    {role === 'disbursement' && <DisbursementDashboard />}

                    {role === 'admin' && <AdminDashboard />}

                    {/* Legacy Dashboard - No longer needed, all roles have custom dashboards */}
                    {!['purchasing', 'payables', 'disbursement', 'admin'].includes(role) && (
                        <div className="space-y-6 border-t pt-6">
                            <h2 className="text-lg font-semibold text-muted-foreground">
                                Legacy Dashboard (temporary - custom dashboard not yet implemented)
                            </h2>

                            {/* Financial Summary Cards */}
                            <FinancialSummaryCards summary={legacyProps.summary} />

                            {/* Pending Actions Widget */}
                            <PendingActionsWidget actions={legacyProps.actions} />

                            {/* Quick Actions and Upcoming Payments Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Quick Actions Panel */}
                                <QuickActionsPanel />

                                {/* Upcoming Payments */}
                                <UpcomingPayments payments={legacyProps.upcomingPayments} />
                            </div>

                            {/* Recent Disbursements */}
                            {legacyProps.recentDisbursements && legacyProps.recentDisbursements.length > 0 && (
                                <RecentDisbursements disbursements={legacyProps.recentDisbursements} />
                            )}
                        </div>
                    )}
                </div>
            </DashboardFilterProvider>
        </AppLayout>
    );
}
