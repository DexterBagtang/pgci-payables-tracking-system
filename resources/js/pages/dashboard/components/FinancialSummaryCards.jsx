import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, FileText, ShoppingCart, CheckCircle, CreditCard } from 'lucide-react';

export default function FinancialSummaryCards({ summary = {} }) {
    const {
        outstanding_balance = 0,
        pending_invoices_count = 0,
        pending_invoices_amount = 0,
        active_pos_count = 0,
        active_pos_amount = 0,
        payments_this_month = 0,
        pending_disbursements_count = 0,
        pending_disbursements_amount = 0,
        checks_released_this_month = 0,
    } = summary;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const cards = [
        {
            title: 'Outstanding Balance',
            value: formatCurrency(outstanding_balance),
            icon: DollarSign,
            iconColor: 'text-red-600',
            bgColor: 'bg-red-50 dark:bg-red-950/20',
            description: 'Total amount owed to vendors',
        },
        {
            title: 'Pending Invoices',
            value: pending_invoices_count,
            subtitle: formatCurrency(pending_invoices_amount),
            icon: FileText,
            iconColor: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-950/20',
            description: 'Awaiting review',
        },
        {
            title: 'Active Purchase Orders',
            value: active_pos_count,
            subtitle: formatCurrency(active_pos_amount),
            icon: ShoppingCart,
            iconColor: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-950/20',
            description: 'Open POs',
        },
        {
            title: 'Payments This Month',
            value: formatCurrency(payments_this_month),
            icon: CheckCircle,
            iconColor: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-950/20',
            description: 'Amount paid out',
        },
        {
            title: 'Pending Disbursements',
            value: pending_disbursements_count,
            subtitle: formatCurrency(pending_disbursements_amount),
            icon: CreditCard,
            iconColor: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-950/20',
            description: 'Awaiting check release',
        },
        {
            title: 'Checks Released (Month)',
            value: checks_released_this_month,
            icon: CheckCircle,
            iconColor: 'text-teal-600',
            bgColor: 'bg-teal-50 dark:bg-teal-950/20',
            description: 'This month',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {cards.map((card, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {card.title}
                        </CardTitle>
                        <div className={`rounded-full p-2 ${card.bgColor}`}>
                            <card.icon className={`h-4 w-4 ${card.iconColor}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{card.value}</div>
                        {card.subtitle && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {card.subtitle}
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                            {card.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
