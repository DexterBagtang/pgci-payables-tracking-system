import { FileCheck, FileSignature, Calendar, TrendingUp } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Zap } from 'lucide-react';

export default function QuickPayablesActions() {
    const actions = [
        {
            icon: FileCheck,
            label: 'Review Invoices',
            description: 'Review pending invoices',
            href: '/invoices?status=pending',
            color: 'blue' as const,
        },
        {
            icon: FileSignature,
            label: 'Approve CRs',
            description: 'Approve check requisitions',
            href: '/check-requisitions?status=pending',
            color: 'purple' as const,
        },
        {
            icon: Calendar,
            label: 'Payment Schedule',
            description: 'View upcoming payments',
            href: '/invoices?view=schedule',
            color: 'green' as const,
        },
        {
            icon: TrendingUp,
            label: 'Aging Report',
            description: 'View invoice aging',
            href: '/invoices?view=aging',
            color: 'orange' as const,
        },
    ];

    return (
        <DashboardCard
            title="Quick Actions"
            description="Common payables tasks"
            icon={Zap}
        >
            <div className="space-y-2">
                {actions.map((action) => (
                    <Link key={action.label} href={action.href}>
                        <Button
                            variant="outline"
                            className="w-full justify-start h-auto py-3 hover:bg-accent"
                        >
                            <div className="flex items-center gap-3 w-full">
                                <div className={`
                                    p-2 rounded-md
                                    ${action.color === 'blue' ? 'bg-blue-100 text-blue-700' : ''}
                                    ${action.color === 'purple' ? 'bg-purple-100 text-purple-700' : ''}
                                    ${action.color === 'green' ? 'bg-green-100 text-green-700' : ''}
                                    ${action.color === 'orange' ? 'bg-orange-100 text-orange-700' : ''}
                                `}>
                                    <action.icon className="h-4 w-4" />
                                </div>
                                <div className="text-left flex-1">
                                    <p className="font-medium text-sm">{action.label}</p>
                                    <p className="text-xs text-muted-foreground">{action.description}</p>
                                </div>
                            </div>
                        </Button>
                    </Link>
                ))}
            </div>
        </DashboardCard>
    );
}
