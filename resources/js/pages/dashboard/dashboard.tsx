import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import FinancialSummaryCards from './components/FinancialSummaryCards';
import PendingActionsWidget from './components/PendingActionsWidget';
import QuickActionsPanel from './components/QuickActionsPanel';
import UpcomingPayments from './components/UpcomingPayments';
import RecentDisbursements from './components/RecentDisbursements';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface UpcomingPayment {
    id: number;
    si_number: string;
    due_date: string;
    net_amount: number;
    invoice_status: string;
    vendor_name: string;
}

interface RecentDisbursement {
    id: number;
    check_voucher_number: string;
    date_check_scheduled: string | null;
    date_check_released_to_vendor: string | null;
    total_amount: number;
    check_req_count: number;
    creator_name: string;
    status: 'released' | 'pending';
    created_at: string;
}

interface DashboardProps {
    summary?: {
        outstanding_balance?: number;
        pending_invoices_count?: number;
        pending_invoices_amount?: number;
        active_pos_count?: number;
        active_pos_amount?: number;
        payments_this_month?: number;
        pending_disbursements_count?: number;
        pending_disbursements_amount?: number;
        checks_released_this_month?: number;
        aging_disbursements?: number;
    };
    actions?: {
        invoices_for_review?: number;
        check_reqs_for_approval?: number;
        overdue_invoices?: number;
        pos_near_delivery?: number;
        disbursements_pending_release?: number;
    };
    upcomingPayments?: UpcomingPayment[];
    recentDisbursements?: RecentDisbursement[];
}

export default function Dashboard({
    summary = {},
    actions = {},
    upcomingPayments = [],
    recentDisbursements = []
}: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Financial Summary Cards */}
                <FinancialSummaryCards summary={summary} />

                {/* Pending Actions Widget */}
                <PendingActionsWidget actions={actions} />

                {/* Quick Actions and Upcoming Payments Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Quick Actions Panel */}
                    <QuickActionsPanel />

                    {/* Upcoming Payments */}
                    <UpcomingPayments payments={upcomingPayments} />
                </div>

                {/* Recent Disbursements */}
                {recentDisbursements && recentDisbursements.length > 0 && (
                    <RecentDisbursements disbursements={recentDisbursements} />
                )}
            </div>
        </AppLayout>
    );
}
