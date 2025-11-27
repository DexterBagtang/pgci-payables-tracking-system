import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    children: ReactNode;
    actions?: ReactNode;
    loading?: boolean;
    className?: string;
    contentClassName?: string;
}

export default function DashboardCard({
    title,
    description,
    icon: Icon,
    children,
    actions,
    loading = false,
    className,
    contentClassName,
}: DashboardCardProps) {
    return (
        <Card className={cn('flex flex-col', className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                        </div>
                    )}
                    <div>
                        <CardTitle className="text-base font-semibold">{title}</CardTitle>
                        {description && (
                            <CardDescription className="text-sm">
                                {description}
                            </CardDescription>
                        )}
                    </div>
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </CardHeader>
            <CardContent className={cn('flex-1', contentClassName)}>
                {loading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                ) : (
                    children
                )}
            </CardContent>
        </Card>
    );
}
