import { ClipboardCheck, FileSignature, List, Clock, Zap } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function QuickPayablesActions() {
    const actions = [
        {
            label: 'Review Invoices',
            href: '/invoice/bulk-review',
            icon: ClipboardCheck,
            variant: 'default' as const,
        },
        {
            label: 'Generate CR',
            href: '/check-requisitions/create',
            icon: FileSignature,
            variant: 'default' as const,
        },
        {
            label: 'All Invoices',
            href: '/invoices',
            icon: List,
            variant: 'outline' as const,
        },
        {
            label: 'CR Queue',
            href: '/check-requisitions?status=pending_approval',
            icon: Clock,
            variant: 'outline' as const,
        },
    ];

    return (
        <DashboardCard
            title="Quick Actions"
            description="Common payables tasks"
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
