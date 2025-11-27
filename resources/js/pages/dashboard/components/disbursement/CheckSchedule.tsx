import { CalendarClock } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import { Badge } from '@/components/ui/badge';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { format } from 'date-fns';
import type { CheckScheduleData } from '@/types';

interface CheckScheduleProps {
    data: CheckScheduleData[];
}

export default function CheckSchedule({ data }: CheckScheduleProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const isEmpty = data.length === 0;
    const totalChecks = data.reduce((sum, w) => sum + w.checks.length, 0);
    const totalAmount = data.reduce((sum, w) => sum + w.total_amount, 0);

    return (
        <DashboardCard
            title="Check Schedule (Next 30 Days)"
            description={`${totalChecks} check(s) scheduled • Total: ${formatCurrency(totalAmount)}`}
            icon={CalendarClock}
        >
            {isEmpty ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <p className="text-sm">No checks scheduled</p>
                </div>
            ) : (
                <Accordion type="single" collapsible className="w-full">
                    {data.map((weekSchedule, index) => (
                        <AccordionItem key={index} value={`week-${index}`}>
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center justify-between w-full pr-4">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{weekSchedule.week}</span>
                                        <Badge variant="secondary" className="text-xs">
                                            {weekSchedule.checks.length}
                                        </Badge>
                                    </div>
                                    <span className="font-semibold text-sm">
                                        {formatCurrency(weekSchedule.total_amount)}
                                    </span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-2 pt-2">
                                    {weekSchedule.checks.map((check) => (
                                        <div
                                            key={check.id}
                                            className="border rounded-md p-3 hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex-1">
                                                    <h5 className="font-semibold text-sm">
                                                        {check.check_number || check.requisition_number}
                                                    </h5>
                                                    <p className="text-xs text-muted-foreground">{check.payee_name}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-sm">{formatCurrency(check.php_amount)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>Scheduled: {format(new Date(check.date_check_scheduled), 'MMM dd, yyyy')}</span>
                                                <Badge variant="outline" className="text-xs capitalize">
                                                    {check.payment_method}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
        </DashboardCard>
    );
}
