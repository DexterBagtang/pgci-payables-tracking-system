import { Printer, Send, Eye, Calendar, Zap } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function QuickDisbursementActions() {
    const actions = [
        {
            icon: Printer,
            label: 'Print Checks',
            description: 'Process printing queue',
            href: '/disbursements?status=pending_printing',
            color: 'blue' as const,
        },
        {
            icon: Send,
            label: 'Release Checks',
            description: 'Release to vendors',
            href: '/disbursements?status=pending_release',
            color: 'green' as const,
        },
        {
            icon: Eye,
            label: 'View All',
            description: 'All disbursements',
            href: '/disbursements',
            color: 'purple' as const,
        },
        {
            icon: Calendar,
            label: 'Schedule Check',
            description: 'New disbursement',
            href: '/disbursements/create',
            color: 'orange' as const,
        },
    ];

    const colorMap = {
        blue: 'hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600 dark:text-blue-400',
        green: 'hover:bg-green-50 dark:hover:bg-green-950/30 text-green-600 dark:text-green-400',
        purple: 'hover:bg-purple-50 dark:hover:bg-purple-950/30 text-purple-600 dark:text-purple-400',
        orange: 'hover:bg-orange-50 dark:hover:bg-orange-950/30 text-orange-600 dark:text-orange-400',
    };

    return (
        <DashboardCard
            title="Quick Actions"
            description="Common disbursement tasks"
            icon={Zap}
        >
            <div className="space-y-2">
                {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <Button
                            key={action.label}
                            variant="outline"
                            className={cn(
                                'w-full justify-start h-auto py-3 px-4',
                                colorMap[action.color]
                            )}
                            asChild
                        >
                            <a href={action.href}>
                                <div className="flex items-center gap-3 w-full">
                                    <Icon className="h-5 w-5 shrink-0" />
                                    <div className="flex-1 text-left">
                                        <div className="font-medium text-sm">{action.label}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {action.description}
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </Button>
                    );
                })}
            </div>
        </DashboardCard>
    );
}
