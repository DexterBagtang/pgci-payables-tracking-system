import { Card, CardContent } from '@/components/ui/card';
import { Users, CheckCircle, XCircle, Package, Calendar } from 'lucide-react';

export default function VendorStats({ stats }) {
    const statCards = [
        {
            title: 'Total Vendors',
            value: stats.total || 0,
            icon: Users,
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-700'
        },
        {
            title: 'Active',
            value: stats.active || 0,
            icon: CheckCircle,
            color: 'bg-green-500',
            bgColor: 'bg-green-50',
            textColor: 'text-green-700'
        },
        {
            title: 'Inactive',
            value: stats.inactive || 0,
            icon: XCircle,
            color: 'bg-gray-500',
            bgColor: 'bg-gray-50',
            textColor: 'text-gray-700'
        },
        {
            title: 'SAP',
            value: stats.sap || 0,
            icon: Package,
            color: 'bg-purple-500',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-700'
        },
        {
            title: 'Manual',
            value: stats.manual || 0,
            icon: Package,
            color: 'bg-orange-500',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-700'
        },
        {
            title: 'Recently Added',
            value: stats.recent || 0,
            icon: Calendar,
            color: 'bg-cyan-500',
            bgColor: 'bg-cyan-50',
            textColor: 'text-cyan-700',
            subtitle: 'Last 7 days'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {statCards.map((stat, index) => (
                <Card key={index} className="overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                    {stat.title}
                                </p>
                                <p className="text-2xl font-bold">
                                    {stat.value}
                                </p>
                                {stat.subtitle && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {stat.subtitle}
                                    </p>
                                )}
                            </div>
                            <div className={`${stat.bgColor} ${stat.textColor} p-3 rounded-lg`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
