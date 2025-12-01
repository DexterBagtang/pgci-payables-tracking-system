import { Plus, FileText, Receipt, Users, Briefcase, Zap } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function QuickPOActions() {
    const actions = [
        {
            label: 'Add PO',
            href: '/purchase-orders/create',
            icon: FileText,
            variant: 'default' as const,
        },
        {
            label: 'Add Invoice',
            href: '/invoices/create',
            icon: Receipt,
            variant: 'default' as const,
        },
        {
            label: 'Add Vendor',
            href: '/vendors/create',
            icon: Users,
            variant: 'outline' as const,
        },
        {
            label: 'Add Project',
            href: '/projects/create',
            icon: Briefcase,
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
