import type { ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ChartContainerProps {
    children: ReactNode;
    height?: number;
    loading?: boolean;
    error?: string | null;
    emptyMessage?: string;
    isEmpty?: boolean;
}

export default function ChartContainer({
    children,
    height = 300,
    loading = false,
    error = null,
    emptyMessage = 'No data available',
    isEmpty = false,
}: ChartContainerProps) {
    if (loading) {
        return <ChartLoadingSkeleton height={height} />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center" style={{ height }}>
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (isEmpty) {
        return (
            <div
                className="flex flex-col items-center justify-center text-center text-muted-foreground"
                style={{ height }}
            >
                <AlertCircle className="h-12 w-12 mb-2 opacity-50" />
                <p className="text-sm">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={height}>
            {children}
        </ResponsiveContainer>
    );
}

function ChartLoadingSkeleton({ height }: { height: number }) {
    return (
        <div className="space-y-3" style={{ height }}>
            <Skeleton className="h-full w-full" />
        </div>
    );
}

export { ChartLoadingSkeleton };
