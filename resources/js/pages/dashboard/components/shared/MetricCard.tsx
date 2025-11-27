import type { LucideIcon } from 'lucide-react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon?: LucideIcon;
    trend?: {
        value: number;
        label?: string;
    };
    color?: 'default' | 'blue' | 'green' | 'red' | 'orange' | 'purple';
    loading?: boolean;
    className?: string;
    onClick?: () => void;
}

const COLOR_VARIANTS = {
    default: {
        bg: 'bg-primary/10',
        icon: 'text-primary',
        text: 'text-foreground',
    },
    blue: {
        bg: 'bg-blue-500/10',
        icon: 'text-blue-500',
        text: 'text-foreground',
    },
    green: {
        bg: 'bg-green-500/10',
        icon: 'text-green-500',
        text: 'text-foreground',
    },
    red: {
        bg: 'bg-red-500/10',
        icon: 'text-red-500',
        text: 'text-foreground',
    },
    orange: {
        bg: 'bg-orange-500/10',
        icon: 'text-orange-500',
        text: 'text-foreground',
    },
    purple: {
        bg: 'bg-purple-500/10',
        icon: 'text-purple-500',
        text: 'text-foreground',
    },
};

export default function MetricCard({
    title,
    value,
    icon: Icon,
    trend,
    color = 'default',
    loading = false,
    className,
    onClick,
}: MetricCardProps) {
    const colorVariant = COLOR_VARIANTS[color];

    const getTrendIcon = () => {
        if (!trend) return null;
        if (trend.value > 0) return ArrowUp;
        if (trend.value < 0) return ArrowDown;
        return Minus;
    };

    const getTrendColor = () => {
        if (!trend) return '';
        if (trend.value > 0) return 'text-green-600';
        if (trend.value < 0) return 'text-red-600';
        return 'text-muted-foreground';
    };

    const TrendIcon = getTrendIcon();

    return (
        <Card
            className={cn(
                'transition-all hover:shadow-md',
                onClick && 'cursor-pointer',
                className
            )}
            onClick={onClick}
        >
            <CardContent className="p-6">
                {loading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                ) : (
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground">
                                {title}
                            </p>
                            <p className={cn('mt-2 text-3xl font-bold', colorVariant.text)}>
                                {value}
                            </p>
                            {trend && TrendIcon && (
                                <div className="mt-2 flex items-center gap-1">
                                    <TrendIcon className={cn('h-4 w-4', getTrendColor())} />
                                    <span className={cn('text-sm font-medium', getTrendColor())}>
                                        {Math.abs(trend.value)}%
                                    </span>
                                    {trend.label && (
                                        <span className="text-sm text-muted-foreground">
                                            {trend.label}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        {Icon && (
                            <div
                                className={cn(
                                    'flex h-12 w-12 items-center justify-center rounded-lg',
                                    colorVariant.bg
                                )}
                            >
                                <Icon className={cn('h-6 w-6', colorVariant.icon)} />
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
