import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    AlertCircle,
    FileText,
    CheckSquare,
    Clock,
    Calendar,
    ChevronRight
} from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function PendingActionsWidget({ actions = {} }) {
    const {
        invoices_for_review = 0,
        check_reqs_for_approval = 0,
        overdue_invoices = 0,
        pos_near_delivery = 0,
    } = actions;

    const actionItems = [
        {
            title: 'Invoices Awaiting Review',
            count: invoices_for_review,
            icon: FileText,
            iconColor: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-950/20',
            href: '/invoices?invoice_status=in_progress',
            priority: 'high',
            show: invoices_for_review > 0,
        },
        {
            title: 'Check Requisitions for Approval',
            count: check_reqs_for_approval,
            icon: CheckSquare,
            iconColor: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-950/20',
            href: '/check-requisitions?requisition_status=pending_approval',
            priority: 'medium',
            show: check_reqs_for_approval > 0,
        },
        {
            title: 'Overdue Invoices',
            count: overdue_invoices,
            icon: AlertCircle,
            iconColor: 'text-red-600',
            bgColor: 'bg-red-50 dark:bg-red-950/20',
            href: '/invoices?invoice_status=overdue',
            priority: 'urgent',
            show: overdue_invoices > 0,
        },
        {
            title: 'POs Near Expected Delivery',
            count: pos_near_delivery,
            icon: Calendar,
            iconColor: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-950/20',
            href: '/purchase-orders?po_status=open',
            priority: 'low',
            show: pos_near_delivery > 0,
        },
    ];

    const priorityColors = {
        urgent: 'bg-red-500',
        high: 'bg-orange-500',
        medium: 'bg-blue-500',
        low: 'bg-purple-500',
    };

    const visibleActions = actionItems.filter(item => item.show);
    const totalPending = visibleActions.reduce((sum, item) => sum + item.count, 0);

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        Pending Actions
                    </CardTitle>
                    {totalPending > 0 && (
                        <Badge variant="destructive" className="text-sm">
                            {totalPending} items
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {visibleActions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CheckSquare className="h-12 w-12 text-green-500 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                            All caught up!
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            No pending actions at the moment
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {visibleActions.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className="block"
                            >
                                <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer group">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className={`rounded-full p-2 ${item.bgColor}`}>
                                            <item.icon className={`h-4 w-4 ${item.iconColor}`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium">
                                                    {item.title}
                                                </p>
                                                <div
                                                    className={`h-1.5 w-1.5 rounded-full ${priorityColors[item.priority]}`}
                                                    title={`${item.priority} priority`}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {item.count} {item.count === 1 ? 'item' : 'items'} require attention
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs font-bold">
                                            {item.count}
                                        </Badge>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {visibleActions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Priority indicators:</span>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-red-500" />
                                    <span>Urgent</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                                    <span>High</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                    <span>Medium</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
