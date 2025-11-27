import { Printer } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import type { DisbursementDashboardData } from '@/types';

interface CheckPrintingQueueProps {
    data: DisbursementDashboardData['printingQueue'];
}

export default function CheckPrintingQueue({ data }: CheckPrintingQueueProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const getUrgencyBadge = (daysWaiting: number) => {
        if (daysWaiting > 7) {
            return { variant: 'destructive' as const, label: 'Urgent' };
        } else if (daysWaiting > 3) {
            return { variant: 'secondary' as const, label: 'High Priority' };
        }
        return { variant: 'outline' as const, label: 'Normal' };
    };

    const isEmpty = data.length === 0;
    const totalAmount = data.reduce((sum, item) => sum + item.php_amount, 0);

    return (
        <DashboardCard
            title="Check Printing Queue"
            description={`${data.length} check(s) ready to print • Total: ${formatCurrency(totalAmount)}`}
            icon={Printer}
        >
            {isEmpty ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <p className="text-sm">No checks ready for printing</p>
                </div>
            ) : (
                <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                        {data.map((check) => (
                            <div
                                key={check.id}
                                className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-sm">{check.requisition_number}</h4>
                                            <Badge variant={getUrgencyBadge(check.days_waiting).variant} className="text-xs">
                                                {getUrgencyBadge(check.days_waiting).label}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{check.payee_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{formatCurrency(check.php_amount)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>
                                        Waiting: {check.days_waiting} day{check.days_waiting !== 1 ? 's' : ''}
                                    </span>
                                    <span>
                                        Scheduled: {format(new Date(check.date_check_scheduled), 'MMM dd, yyyy')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            )}
        </DashboardCard>
    );
}
