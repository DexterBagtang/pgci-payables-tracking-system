import { ClipboardCheck, FileText, Receipt, ShoppingCart, AlertCircle } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import WidgetError from '../shared/WidgetError';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
import type { PendingApprovalsByRole as PendingApprovalsByRoleData } from '@/types';

const formatNumber = (value: number) => new Intl.NumberFormat('en-PH').format(value);

export default function PendingApprovalsByRole() {
    const { data, loading, error, refetch, isRefetching } = useDashboardWidget<PendingApprovalsByRoleData>({
        endpoint: '/api/dashboard/unified/pending-approvals',
    });

    if (loading) {
        return <WidgetSkeleton variant="metrics" />;
    }

    if (error || !data) {
        return <WidgetError message={error || 'Failed to load pending approvals'} onRetry={refetch} />;
    }

    const approvals = [
        {
            label: 'Invoices Waiting Review',
            value: data.invoices_waiting_review,
            icon: FileText,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            label: 'Check Requisitions Pending',
            value: data.check_requisitions_pending,
            icon: Receipt,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
        {
            label: 'POs Pending Finalization',
            value: data.pos_pending_finalization,
            icon: ShoppingCart,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
        },
    ];

    const hasApprovals = data.total > 0;

    return (
        <DashboardCard
            title="Pending Approvals"
            description="Items requiring action"
            icon={ClipboardCheck}
            isRefreshing={isRefetching}
        >
            <div className="space-y-4">
                {/* Total Pending */}
                <div className={`rounded-lg border p-4 ${hasApprovals ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className={`h-5 w-5 ${hasApprovals ? 'text-orange-600' : 'text-green-600'}`} />
                        <span className="text-sm font-medium text-muted-foreground">Total Pending</span>
                    </div>
                    <div className={`text-3xl font-bold ${hasApprovals ? 'text-orange-600' : 'text-green-600'}`}>
                        {formatNumber(data.total)}
                    </div>
                </div>

                {/* Approval Breakdown */}
                <div className="space-y-3">
                    {approvals.map((approval) => {
                        const Icon = approval.icon;
                        return (
                            <div key={approval.label} className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded ${approval.bgColor}`}>
                                        <Icon className={`h-5 w-5 ${approval.color}`} />
                                    </div>
                                    <span className="text-sm font-medium">{approval.label}</span>
                                </div>
                                <span className="text-xl font-bold">{formatNumber(approval.value)}</span>
                            </div>
                        );
                    })}
                </div>

                {!hasApprovals && (
                    <div className="text-center py-2">
                        <p className="text-sm text-muted-foreground">All caught up! No pending approvals.</p>
                    </div>
                )}
            </div>
        </DashboardCard>
    );
}
