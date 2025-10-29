import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    FileText,
    ShoppingCart,
    CheckSquare,
    UserPlus,
    BarChart3,
    Zap,
    FolderPlus
} from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function QuickActionsPanel() {
    const actions = [
        {
            title: 'Create Invoice',
            description: 'Add a new invoice',
            icon: FileText,
            iconColor: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-950/20',
            href: '/invoices/create',
        },
        {
            title: 'Create Purchase Order',
            description: 'Generate a new PO',
            icon: ShoppingCart,
            iconColor: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-950/20',
            href: '/purchase-orders/create',
        },
        {
            title: 'Create Check Requisition',
            description: 'Request payment',
            icon: CheckSquare,
            iconColor: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-950/20',
            href: '/invoices/check-requisition',
        },
        {
            title: 'Add Vendor',
            description: 'Register new vendor',
            icon: UserPlus,
            iconColor: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-950/20',
            href: '/vendors',
            action: 'dialog', // Will open add vendor dialog
        },
        {
            title: 'Add Project',
            description: 'Create new project',
            icon: FolderPlus,
            iconColor: 'text-teal-600',
            bgColor: 'bg-teal-50 dark:bg-teal-950/20',
            href: '/projects',
            action: 'dialog',
        },
        {
            title: 'View All Invoices',
            description: 'Browse invoices',
            icon: BarChart3,
            iconColor: 'text-indigo-600',
            bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
            href: '/invoices',
        },
    ];

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-muted-foreground" />
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {actions.map((action, index) => (
                        <Link
                            key={index}
                            href={action.href}
                            className="block"
                        >
                            <Button
                                variant="outline"
                                className="w-full h-auto p-4 justify-start hover:border-primary/50 hover:bg-accent/50 transition-all group"
                            >
                                <div className="flex items-start gap-3 w-full">
                                    <div className={`rounded-lg p-2 ${action.bgColor} group-hover:scale-110 transition-transform`}>
                                        <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="font-semibold text-sm">
                                            {action.title}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            {action.description}
                                        </div>
                                    </div>
                                </div>
                            </Button>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
