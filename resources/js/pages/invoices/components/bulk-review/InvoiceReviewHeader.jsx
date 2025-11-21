import { Button } from '@/components/ui/button';
import { FileCheck, CheckCircle2, XCircle } from 'lucide-react';

/**
 * Bulk Invoice Review Header Component
 * Displays title and bulk action buttons
 * Principle: Single Responsibility - Only handles header display and actions
 */
export default function InvoiceReviewHeader({
    selectedCount,
    selectedTotal,
    selectedCurrency,
    formatCurrency,
    onMarkReceived,
    onApprove,
    onReject,
    smartSelectionMenu
}) {
    return (
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
                <div>
                    <h1 className="text-sm font-bold text-slate-900">Invoice Review</h1>
                </div>

                {/* Smart Selection Menu */}
                {smartSelectionMenu}
            </div>

            {/* Action Buttons */}
            {selectedCount > 0 && (
                <div className="flex items-center gap-2">
                    <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-bold text-blue-600">{selectedCount}</span>
                            <span className="text-[10px] text-slate-600">sel</span>
                            <span className="text-slate-300 mx-0.5">|</span>
                            <span className="text-xs font-bold text-blue-600">
                                {formatCurrency(selectedTotal, selectedCurrency)}
                            </span>
                        </div>
                    </div>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onMarkReceived}
                        className="h-6 px-2 text-[10px]"
                    >
                        <FileCheck className="h-3 w-3 mr-1" />
                        Recv
                    </Button>
                    <Button
                        size="sm"
                        onClick={onApprove}
                        className="h-6 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-700"
                    >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Approve
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={onReject}
                        className="h-6 px-2 text-[10px]"
                    >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                    </Button>
                </div>
            )}
        </div>
    );
}
