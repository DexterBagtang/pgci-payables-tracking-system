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
    onReject
}) {
    return (
        <div className="flex items-center justify-between mb-4">
            <div>
                <h1 className="text-xl font-bold text-slate-900">Invoice Review</h1>
                <p className="text-sm text-slate-500 mt-0.5">Review and process invoices efficiently</p>
            </div>

            {/* Action Buttons */}
            {selectedCount > 0 && (
                <div className="flex items-center gap-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-blue-600">{selectedCount}</span>
                            <span className="text-xs text-slate-600">selected</span>
                            <span className="text-slate-300 mx-1">|</span>
                            <span className="text-lg font-bold text-blue-600">
                                {formatCurrency(selectedTotal, selectedCurrency)}
                            </span>
                        </div>
                    </div>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onMarkReceived}
                        className="h-9"
                    >
                        <FileCheck className="h-4 w-4 mr-2" />
                        Mark Received
                    </Button>
                    <Button
                        size="sm"
                        onClick={onApprove}
                        className="h-9 bg-emerald-600 hover:bg-emerald-700"
                    >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={onReject}
                        className="h-9"
                    >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                    </Button>
                </div>
            )}
        </div>
    );
}
