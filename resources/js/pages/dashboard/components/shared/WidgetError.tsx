import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WidgetErrorProps {
    message?: string;
    onRetry?: () => void;
}

export default function WidgetError({
    message = 'Failed to load data',
    onRetry
}: WidgetErrorProps) {
    return (
        <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-sm text-muted-foreground mb-4">{message}</p>
            {onRetry && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    className="gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Retry
                </Button>
            )}
        </div>
    );
}
