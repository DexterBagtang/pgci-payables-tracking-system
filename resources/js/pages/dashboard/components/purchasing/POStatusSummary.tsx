import { FileText, PackageOpen, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface POStatusSummaryData {
    draft: number;
    open: number;
    closed_this_month: number;
    cancelled_this_month: number;
}

interface POStatusSummaryProps {
    data: POStatusSummaryData;
}

export default function POStatusSummary({ data }: POStatusSummaryProps) {
    const stats = [
        {
            label: 'Draft',
            value: data.draft,
            icon: FileText,
            color: 'text-gray-600',
            bgColor: 'bg-gray-50',
        },
        {
            label: 'Open',
            value: data.open,
            icon: PackageOpen,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            label: 'Closed (MTD)',
            value: data.closed_this_month,
            icon: CheckCircle2,
            color: 'text-teal-600',
            bgColor: 'bg-teal-50',
        },
        {
            label: 'Cancelled (MTD)',
            value: data.cancelled_this_month,
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((stat) => (
                <Card key={stat.label} className={cn('p-3', stat.bgColor)}>
                    <div className="flex items-center gap-2">
                        <stat.icon className={cn('h-4 w-4', stat.color)} />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                            <p className={cn('text-lg font-semibold', stat.color)}>{stat.value}</p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
