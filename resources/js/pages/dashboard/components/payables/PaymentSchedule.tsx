import { CalendarDays } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import WidgetError from '../shared/WidgetError';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
import { Badge } from '@/components/ui/badge';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { format } from 'date-fns';

interface Invoice {
    id: number;
    si_number: string;
    vendor_name: string;
    net_amount: number;
    due_date: string;
    invoice_status: string;
}

interface WeekSchedule {
    week: string;
    total_amount: number;
    invoices: Invoice[];
}

export default function PaymentSchedule() {
    const { data, loading, error, refetch } = useDashboardWidget<WeekSchedule[]>({
        endpoint: '/api/dashboard/payables/payment-schedule'
    });

    if (loading) {
        return <WidgetSkeleton variant="list" title="Payment Schedule" />;
    }

    if (error || !data) {
        return (
            <DashboardCard
                title="Payment Schedule"
                description="Upcoming payments by week"
                icon={CalendarDays}
            >
                <WidgetError message={error || 'Failed to load payment schedule'} onRetry={refetch} />
            </DashboardCard>
        );
    }
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const isEmpty = data.length === 0;
    const totalPayments = data.reduce((sum, week) => sum + week.total_amount, 0);

    return (
        <DashboardCard
            title="Payment Schedule (Next 30 Days)"
            description={`${data.reduce((sum, w) => sum + w.invoices.length, 0)} payment(s) • Total: ${formatCurrency(totalPayments)}`}
            icon={CalendarDays}
        >
            {isEmpty ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <p className="text-sm">No upcoming payments scheduled</p>
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
                                            {weekSchedule.invoices.length}
                                        </Badge>
                                    </div>
                                    <span className="font-semibold text-sm">
                                        {formatCurrency(weekSchedule.total_amount)}
                                    </span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-2 pt-2">
                                    {weekSchedule.invoices.map((invoice) => (
                                        <div
                                            key={invoice.id}
                                            className="border rounded-md p-3 hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex-1">
                                                    <h5 className="font-semibold text-sm">{invoice.si_number}</h5>
                                                    <p className="text-xs text-muted-foreground">{invoice.vendor_name}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-sm">{formatCurrency(invoice.net_amount)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>Due: {format(new Date(invoice.due_date), 'MMM dd, yyyy')}</span>
                                                <Badge variant="outline" className="text-xs capitalize">
                                                    {invoice.invoice_status.replace('_', ' ')}
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
