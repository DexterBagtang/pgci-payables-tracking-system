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
            <CardContent className="p-3">
                {loading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-2 w-16" />
                    </div>
                ) : (
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground truncate">
                                {title}
                            </p>
                            <p className={cn('mt-1 text-xl font-bold', colorVariant.text)}>
                                {value}
                            </p>
                            {trend && TrendIcon && (
                                <div className="mt-1 flex items-center gap-1">
                                    <TrendIcon className={cn('h-3 w-3', getTrendColor())} />
                                    <span className={cn('text-xs font-medium', getTrendColor())}>
                                        {Math.abs(trend.value)}%
                                    </span>
                                    {trend.label && (
                                        <span className="text-xs text-muted-foreground">
                                            {trend.label}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        {Icon && (
                            <div
                                className={cn(
                                    'flex h-8 w-8 items-center justify-center rounded-lg shrink-0',
                                    colorVariant.bg
                                )}
                            >
                                <Icon className={cn('h-4 w-4', colorVariant.icon)} />
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
