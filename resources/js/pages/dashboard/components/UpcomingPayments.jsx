import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Calendar,
    Clock,
    Building2,
    FileText,
    AlertTriangle,
    CheckCircle2,
    ChevronRight
} from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function UpcomingPayments({ payments }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Reset time part for comparison
        today.setHours(0, 0, 0, 0);
        tomorrow.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);

        if (date.getTime() === today.getTime()) {
            return 'Today';
        } else if (date.getTime() === tomorrow.getTime()) {
            return 'Tomorrow';
        } else {
            return new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }).format(date);
        }
    };

    const getDaysUntilDue = (dateString) => {
        const today = new Date();
        const dueDate = new Date(dateString);
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);

        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    };

    const getUrgencyColor = (daysUntil) => {
        if (daysUntil < 0) return 'destructive'; // Overdue
        if (daysUntil <= 3) return 'destructive'; // Critical
        if (daysUntil <= 7) return 'default'; // Warning
        return 'secondary'; // Normal
    };

    const getUrgencyBadge = (daysUntil) => {
        if (daysUntil < 0) return { text: 'Overdue', icon: AlertTriangle };
        if (daysUntil === 0) return { text: 'Due Today', icon: AlertTriangle };
        if (daysUntil === 1) return { text: 'Due Tomorrow', icon: Clock };
        if (daysUntil <= 7) return { text: `${daysUntil} days`, icon: Clock };
        return { text: `${daysUntil} days`, icon: Calendar };
    };

    // Sort by due date (earliest first)
    const sortedPayments = [...payments].sort((a, b) =>
        new Date(a.due_date) - new Date(b.due_date)
    );

    // Group payments by urgency
    const overduePayments = sortedPayments.filter(p => getDaysUntilDue(p.due_date) < 0);
    const urgentPayments = sortedPayments.filter(p => {
        const days = getDaysUntilDue(p.due_date);
        return days >= 0 && days <= 7;
    });
    const upcomingPayments = sortedPayments.filter(p => getDaysUntilDue(p.due_date) > 7);

    const totalAmount = payments.reduce((sum, payment) => sum + parseFloat(payment.net_amount || 0), 0);

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        Upcoming Payments
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm">
                            {payments.length} {payments.length === 1 ? 'invoice' : 'invoices'}
                        </Badge>
                        {overduePayments.length > 0 && (
                            <Badge variant="destructive" className="text-sm">
                                {overduePayments.length} overdue
                            </Badge>
                        )}
                    </div>
                </div>
                {payments.length > 0 && (
                    <div className="text-sm text-muted-foreground mt-2">
                        Total: <span className="font-semibold text-foreground">{formatCurrency(totalAmount)}</span>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                {payments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                            No upcoming payments
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            All invoices are up to date
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {sortedPayments.slice(0, 10).map((payment, index) => {
                            const daysUntil = getDaysUntilDue(payment.due_date);
                            const urgencyBadge = getUrgencyBadge(daysUntil);
                            const UrgencyIcon = urgencyBadge.icon;

                            return (
                                <Link
                                    key={index}
                                    href={`/invoices/${payment.id}`}
                                    className="block"
                                >
                                    <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer group">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className="flex-shrink-0 mt-0.5">
                                                <UrgencyIcon className={`h-4 w-4 ${
                                                    daysUntil < 0 || daysUntil <= 3
                                                        ? 'text-red-600'
                                                        : daysUntil <= 7
                                                        ? 'text-orange-600'
                                                        : 'text-blue-600'
                                                }`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-sm font-medium truncate">
                                                        {payment.vendor_name || 'Unknown Vendor'}
                                                    </p>
                                                    <Badge
                                                        variant={getUrgencyColor(daysUntil)}
                                                        className="text-xs flex-shrink-0"
                                                    >
                                                        {urgencyBadge.text}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <FileText className="h-3 w-3" />
                                                        {payment.si_number || 'No SI'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(payment.due_date)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <div className="text-right">
                                                <p className="text-sm font-semibold">
                                                    {formatCurrency(payment.net_amount)}
                                                </p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}

                        {payments.length > 10 && (
                            <Link href="/invoices?invoice_status=approved" className="block">
                                <Button variant="ghost" className="w-full text-sm">
                                    View all {payments.length} upcoming payments
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </Link>
                        )}
                    </div>
                )}

                {payments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Next 30 days</span>
                            <div className="flex items-center gap-4">
                                {urgentPayments.length > 0 && (
                                    <div className="flex items-center gap-1">
                                        <div className="h-2 w-2 rounded-full bg-orange-500" />
                                        <span>{urgentPayments.length} this week</span>
                                    </div>
                                )}
                                {upcomingPayments.length > 0 && (
                                    <div className="flex items-center gap-1">
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                        <span>{upcomingPayments.length} later</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
