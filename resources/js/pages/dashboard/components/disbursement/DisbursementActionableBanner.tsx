import { AlertCircle, Printer, Send } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
import { cn } from '@/lib/utils';

interface ActionableItems {
    overdue_printing: number;
    delayed_releases: number;
    scheduled_today: number;
}

export default function DisbursementActionableBanner() {
    const { data, loading } = useDashboardWidget<ActionableItems>({
        endpoint: '/api/dashboard/disbursement/actionable-items'
    });

    if (loading) {
        return <WidgetSkeleton variant="banner" />;
    }

    if (!data) return null;

    const totalActionable = data.overdue_printing + data.delayed_releases;

    // Only show if there are actionable items
    if (totalActionable === 0) return null;

    const actionCards = [
        {
            icon: AlertCircle,
            label: 'Overdue for Printing',
            count: data.overdue_printing,
            color: 'red' as const,
            description: 'Scheduled for release but not printed',
        },
        {
            icon: Send,
            label: 'Delayed Releases',
            count: data.delayed_releases,
            color: 'orange' as const,
            description: 'Printed checks awaiting release >7 days',
        },
        {
            icon: Printer,
            label: 'Scheduled Today',
            count: data.scheduled_today,
            color: 'blue' as const,
            description: 'Checks scheduled for release today',
        },
    ];

    const colorMap = {
        red: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
        orange: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
        blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    };

    return (
        <div className="rounded-lg border bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 p-6">
            <div className="flex items-start gap-3 mb-4">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                        Action Required
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300">
                        {totalActionable} item{totalActionable !== 1 ? 's' : ''} need{totalActionable === 1 ? 's' : ''} your attention
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {actionCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.label}
                            className={cn(
                                'rounded-lg border p-4 bg-background/50 backdrop-blur-sm',
                                colorMap[card.color]
                            )}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <Icon className="h-5 w-5" />
                                <span className="text-2xl font-bold">{card.count}</span>
                            </div>
                            <div>
                                <p className="font-medium text-sm mb-0.5">{card.label}</p>
                                <p className="text-xs opacity-80">{card.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
