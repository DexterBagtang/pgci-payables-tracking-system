import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, TrendingUp } from 'lucide-react';

/**
 * Review Progress Tracker Component
 * Shows progress for the current review session
 */
export default function ReviewProgressTracker({
    totalInvoices,
    reviewedCount,
    selectedCount
}) {
    const progressPercentage = totalInvoices > 0
        ? ((reviewedCount / totalInvoices) * 100).toFixed(0)
        : 0;

    const remainingCount = totalInvoices - reviewedCount;

    return (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-2">
                <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                        <div className="bg-blue-600 rounded p-0.5">
                            <TrendingUp className="h-2.5 w-2.5 text-white" />
                        </div>
                        <h3 className="font-semibold text-[10px] text-slate-900">
                            Progress
                        </h3>
                    </div>
                    {reviewedCount > 0 && (
                        <div className="flex items-center gap-0.5 bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded-full">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            <span className="text-[10px] font-bold">{reviewedCount}</span>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                    <Progress
                        value={progressPercentage}
                        className="h-1.5 bg-blue-100"
                    />

                    {/* Stats */}
                    <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-600">
                            <span className="font-bold text-blue-600">{reviewedCount}</span>
                            {' / '}
                            <span className="font-semibold">{totalInvoices}</span>
                        </span>
                        <span className="font-bold text-blue-600">
                            {progressPercentage}%
                        </span>
                    </div>
                </div>

                {/* Selected Indicator */}
                {selectedCount > 0 && (
                    <div className="mt-1.5 pt-1.5 border-t border-blue-200">
                        <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-600">Selected:</span>
                            <span className="font-bold text-indigo-600">{selectedCount}</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
