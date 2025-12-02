import { AlertCircle, FileText, Clock, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
import { Skeleton } from '@/components/ui/skeleton';

interface ActionableItems {
    draft_pos: number;
    rejected_invoices: number;
    overdue_submissions: number;
    old_drafts: number;
}

export default function ActionableItemsBanner() {
    const { data, loading, error } = useDashboardWidget<ActionableItems>({
        endpoint: '/api/dashboard/purchasing/actionable-items'
    });

    if (loading) {
        return <Skeleton className="h-24 w-full" />;
    }

    if (error || !data) {
        return null;
    }

    const items = [
        {
            count: data.draft_pos,
            label: 'Draft POs to Finalize',
            icon: FileText,
            href: '/purchase-orders?status=draft',
            color: 'text-blue-600',
        },
        {
            count: data.rejected_invoices,
            label: 'Rejected Invoices to Fix',
            icon: XCircle,
            href: '/invoices?status=rejected',
            color: 'text-red-600',
        },
        {
            count: data.overdue_submissions,
            label: 'Overdue Invoice Submissions',
            icon: Clock,
            href: '/invoices?overdue=true',
            color: 'text-orange-600',
        },
        {
            count: data.old_drafts,
            label: 'Drafts Over 7 Days Old',
            icon: AlertCircle,
            href: '/purchase-orders?status=draft&old=true',
            color: 'text-amber-600',
        },
    ];

    const totalActionable = items.reduce((sum, item) => sum + item.count, 0);

    if (totalActionable === 0) {
        return null;
    }

    return (
        <Alert className="border-orange-200 bg-orange-50/50 dark:border-orange-900/50 dark:bg-orange-950/20">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <AlertDescription>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <p className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                            Action Required: {totalActionable} {totalActionable === 1 ? 'item' : 'items'} need your attention
                        </p>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {items.filter(item => item.count > 0).map((item) => (
                                <Link key={item.href} href={item.href}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start gap-2 h-auto py-2 bg-white dark:bg-gray-950"
                                    >
                                        <item.icon className={`h-4 w-4 ${item.color}`} />
                                        <div className="text-left flex-1">
                                            <div className="font-bold text-base">{item.count}</div>
                                            <div className="text-xs text-muted-foreground font-normal">
                                                {item.label}
                                            </div>
                                        </div>
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </AlertDescription>
        </Alert>
    );
}
