import { Plus, List, Printer, BarChart3, Zap } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function QuickDisbursementActions() {
    const actions = [
        {
            label: 'Add Disbursement',
            href: '/disbursements/create',
            icon: Plus,
            variant: 'default' as const,
        },
        {
            label: 'All Disbursements',
            href: '/disbursements',
            icon: List,
            variant: 'outline' as const,
        },
        {
            label: 'Print Queue',
            href: '/disbursements?status=ready_to_print',
            icon: Printer,
            variant: 'outline' as const,
        },
        {
            label: 'Reports',
            href: '/reports/disbursement',
            icon: BarChart3,
            variant: 'outline' as const,
        },
    ];

    return (
        <DashboardCard
            title="Quick Actions"
            description="Common disbursement tasks"
            icon={Zap}
        >
            <div className="grid grid-cols-2 gap-2">
                {actions.map((action) => (
                    <Link key={action.href} href={action.href}>
                        <Button
                            variant={action.variant}
                            size="sm"
                            className="w-full justify-start gap-2"
                        >
                            <action.icon className="h-4 w-4" />
                            {action.label}
                        </Button>
                    </Link>
                ))}
            </div>
        </DashboardCard>
    );
}
