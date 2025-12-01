import { Card, CardContent } from '@/components/ui/card';
import { FolderOpen, CheckCircle, DollarSign, TrendingUp } from 'lucide-react';

export default function ProjectStats({ stats }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const statCards = [
        {
            title: 'Total Projects',
            value: stats.total || 0,
            icon: FolderOpen,
            bgColor: 'bg-blue-50 dark:bg-blue-950',
            textColor: 'text-blue-700 dark:text-blue-300'
        },
        {
            title: 'Active Projects',
            value: stats.active || 0,
            icon: CheckCircle,
            bgColor: 'bg-green-50 dark:bg-green-950',
            textColor: 'text-green-700 dark:text-green-300'
        },
        {
            title: 'Completed',
            value: stats.completed || 0,
            icon: TrendingUp,
            bgColor: 'bg-purple-50 dark:bg-purple-950',
            textColor: 'text-purple-700 dark:text-purple-300'
        },
        {
            title: 'Total Budget',
            value: formatCurrency(stats.total_budget || 0),
            icon: DollarSign,
            bgColor: 'bg-amber-50 dark:bg-amber-950',
            textColor: 'text-amber-700 dark:text-amber-300'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
