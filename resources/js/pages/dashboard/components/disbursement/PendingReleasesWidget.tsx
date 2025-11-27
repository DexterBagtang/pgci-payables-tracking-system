import { PackageCheck, AlertCircle } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DisbursementDashboardData } from '@/types';

interface PendingReleasesWidgetProps {
    data: DisbursementDashboardData['pendingReleases'];
}

export default function PendingReleasesWidget({ data }: PendingReleasesWidgetProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const getUrgencyBadge = (daysPending: number) => {
        if (daysPending > 14) {
            return { variant: 'destructive' as const, label: 'Critical', isOverdue: true };
        } else if (daysPending > 7) {
            return { variant: 'secondary' as const, label: 'High Priority', isOverdue: false };
        }
        return { variant: 'outline' as const, label: 'Normal', isOverdue: false };
    };

    const isEmpty = data.length === 0;
    const totalAmount = data.reduce((sum, item) => sum + item.php_amount, 0);

    return (
        <DashboardCard
            title="Pending Check Releases"
            description={`${data.length} check(s) pending release • Total: ${formatCurrency(totalAmount)}`}
            icon={PackageCheck}
        >
            {isEmpty ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <p className="text-sm">No checks pending release</p>
                </div>
            ) : (
                <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                        {data.map((check) => {
                            const urgency = getUrgencyBadge(check.days_pending);
                            return (
                                <div
                                    key={check.id}
                                    className={cn(
                                        "border rounded-lg p-4 hover:bg-accent/50 transition-colors",
                                        urgency.isOverdue && "border-red-200 bg-red-50/50"
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-sm">{check.check_number}</h4>
                                                {urgency.isOverdue && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        <AlertCircle className="h-3 w-3 mr-1" />
                                                        Overdue
                                                    </Badge>
                                                )}
                                                <Badge variant={urgency.variant} className="text-xs">
                                                    {urgency.label}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-1">{check.payee_name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                CR: {check.requisition_number}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">{formatCurrency(check.php_amount)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>
                                            Pending: {check.days_pending} day{check.days_pending !== 1 ? 's' : ''}
                                        </span>
                                        <span>
                                            Printed: {format(new Date(check.date_check_printed), 'MMM dd, yyyy')}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            )}
        </DashboardCard>
    );
}
