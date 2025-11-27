import { Plus, List, FileText, BarChart3 } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

export default function QuickPOActions() {
    const actions = [
        {
            label: 'Add PO',
            href: '/purchase-orders/create',
            icon: Plus,
            variant: 'default' as const,
        },
        {
            label: 'View All',
            href: '/purchase-orders',
            icon: List,
            variant: 'outline' as const,
        },
        {
            label: 'Drafts',
            href: '/purchase-orders?status=draft',
            icon: FileText,
            variant: 'outline' as const,
        },
        {
            label: 'Reports',
            href: '/reports/purchase-orders',
            icon: BarChart3,
            variant: 'outline' as const,
        },
    ];

    return (
        <DashboardCard
            title="Quick Actions"
            description="Common purchasing tasks"
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
