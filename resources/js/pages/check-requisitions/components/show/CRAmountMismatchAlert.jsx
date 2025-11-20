import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

/**
 * Check Requisition Amount Mismatch Alert
 * Shows warning when CR amount doesn't match total invoices
 * Principle: Single Responsibility - Only handles mismatch alert
 */
export default function CRAmountMismatchAlert({
    isMatching,
    requisitionAmount,
    totalInvoicesAmount,
    variance,
    variancePercentage,
    formatCurrency
}) {
    if (isMatching) return null;

    return (
        <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
                <div className="flex justify-between items-center">
                    <span>
                        Amount mismatch: Check requisition ({formatCurrency(requisitionAmount)}) vs Total invoices ({formatCurrency(totalInvoicesAmount)})
                    </span>
                    <Badge variant="outline" className="ml-2 bg-white">
                        Variance: {formatCurrency(Math.abs(variance))} ({Math.abs(variancePercentage).toFixed(2)}%)
                    </Badge>
                </div>
            </AlertDescription>
        </Alert>
    );
}
