import { Skeleton } from '@/components/ui/skeleton';
import DashboardCard from './DashboardCard';

interface WidgetSkeletonProps {
    title?: string;
    description?: string;
    variant?: 'table' | 'metrics' | 'chart' | 'list';
}

export default function WidgetSkeleton({
    title = '',
    description = '',
    variant = 'table'
}: WidgetSkeletonProps) {
    return (
        <DashboardCard title={title} description={description}>
            {variant === 'metrics' && <MetricsGridSkeleton />}
            {variant === 'table' && <TableSkeleton />}
            {variant === 'chart' && <ChartSkeleton />}
            {variant === 'list' && <ListSkeleton />}
        </DashboardCard>
    );
}

// Metrics Grid Skeleton (for cards like Financial Commitments)
function MetricsGridSkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, idx) => (
                <div key={idx} className="p-3 space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-full" />
                </div>
            ))}
        </div>
    );
}

// Table Skeleton (for widgets like Vendor Performance)
function TableSkeleton() {
    return (
        <div className="space-y-3">
            {/* Table Header */}
            <div className="flex gap-4 border-b pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
            </div>
            {/* Table Rows */}
            {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-28" />
                    <Skeleton className="h-10 w-20" />
                </div>
            ))}
        </div>
    );
}

// Chart Skeleton (for aging charts)
function ChartSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-end gap-2 h-48">
                {Array.from({ length: 5 }).map((_, idx) => (
                    <Skeleton
                        key={idx}
                        className="flex-1"
                        style={{ height: `${Math.random() * 60 + 40}%` }}
                    />
                ))}
            </div>
            <div className="flex gap-4 justify-center">
                {Array.from({ length: 5 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-4 w-16" />
                ))}
            </div>
        </div>
    );
}

// List Skeleton (for queues and schedules)
function ListSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 border rounded-lg">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                </div>
            ))}
        </div>
    );
}

// Export individual skeletons for specific use cases
export { MetricsGridSkeleton, TableSkeleton, ChartSkeleton, ListSkeleton };
