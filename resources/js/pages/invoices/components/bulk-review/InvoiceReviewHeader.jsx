import { Button } from '@/components/ui/button';
import { FileCheck, CheckCircle2, XCircle, FileText, TrendingUp } from 'lucide-react';
import { GmailStyleSelectAll } from '@/components/custom/GmailStyleSelectAll.jsx';

/**
 * Bulk Invoice Review Header Component
 * Displays title, stats, and bulk action buttons with elegant inline design
 */
export default function InvoiceReviewHeader({
    selectedCount,
    selectedTotal,
    selectedCurrency,
    formatCurrency,
    onMarkReceived,
    onApprove,
    onReject,
    onSelectVisible,
    onSelectAll,
    onClearSelection,
    totalInvoices,
    reviewedCount,
    loadedCount,
    visibleCount,
    hasSelection
}) {
    const isLoadingMore = loadedCount && loadedCount < totalInvoices;
    const progressPercentage = totalInvoices > 0 ? Math.round((reviewedCount / totalInvoices) * 100) : 0;

    return (
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
                <h1 className="text-sm font-semibold text-slate-800">
                    Invoice Review
                </h1>

                <div className="h-4 w-px bg-slate-200" />

                {/* Elegant Stats Display */}
                <div className="flex items-center gap-3">
                    {/* Total/Loaded Count */}
                    <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-xs text-slate-600 font-medium">
                            {isLoadingMore ? (
                                <>
                                    <span className="text-slate-900 font-semibold">{loadedCount}</span>
                                    <span className="text-slate-400 mx-0.5">/</span>
                                    <span className="text-slate-500">{totalInvoices}</span>
                                </>
                            ) : (
                                <span className="text-slate-900 font-semibold">{totalInvoices}</span>
                            )}
                            <span className="text-slate-400 ml-1">invoices</span>
                        </span>
                    </div>

                    {/* Review Progress */}
                    {reviewedCount > 0 && (
                        <>
                            <div className="h-4 w-px bg-slate-200" />
                            <div className="flex items-center gap-1.5">
                                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                                <span className="text-xs text-slate-600 font-medium">
                                    <span className="text-emerald-700 font-semibold">{reviewedCount}</span>
                                    <span className="text-slate-400 ml-1">reviewed</span>
                                    <span className="text-slate-400 mx-1">•</span>
                                    <span className="text-emerald-600 font-semibold">{progressPercentage}%</span>
                                </span>
                            </div>
                        </>
                    )}

                    {/* Selected Count */}
                    {selectedCount > 0 && (
                        <>
                            <div className="h-4 w-px bg-slate-200" />
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 rounded-md border border-blue-100">
                                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                                <span className="text-xs font-semibold text-blue-700">
                                    {selectedCount} selected
                                </span>
                                <span className="text-xs text-blue-600 font-medium">
                                    {formatCurrency(selectedTotal, selectedCurrency)}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* Gmail-style Select All */}
                {loadedCount > 0 && (
                    <>
                        <div className="h-4 w-px bg-slate-200" />
                        <GmailStyleSelectAll
                            selectedCount={selectedCount}
                            visibleCount={visibleCount || loadedCount}
                            totalLoadedCount={loadedCount}
                            totalCount={totalInvoices}
                            onSelectVisible={onSelectVisible}
                            onSelectAllLoaded={onSelectAll}
                            onClearSelection={onClearSelection}
                            itemLabel="invoices"
                        />
                    </>
                )}
            </div>

            {/* Action Buttons */}
            {selectedCount > 0 && (
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onMarkReceived}
                        className="h-7 px-2 text-xs"
                    >
                        <FileCheck className="h-3 w-3 mr-1" />
                        Mark Received
                    </Button>
                    <Button
                        size="sm"
                        onClick={onApprove}
                        className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700"
                    >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Approve
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={onReject}
                        className="h-7 px-2 text-xs"
                    >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                    </Button>
                </div>
            )}
        </div>
    );
}
