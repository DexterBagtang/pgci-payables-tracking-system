import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, FileText, CheckSquare, Square } from 'lucide-react';

export default function CheckReqHeader({
    selectedCount,
    selectedTotal,
    totalInvoices,
    loadedCount,
    formatCurrency,
    onSubmit,
    onClearSelection,
    onSelectAll,
    processing,
    hasSelection
}) {
    const selectionPercentage = totalInvoices > 0 ? Math.round((selectedCount / totalInvoices) * 100) : 0;
    const isLoadingMore = loadedCount < totalInvoices;

    return (
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-slate-800">
                    Check Requisition Form
                </h3>

                <div className="h-4 w-px bg-slate-200" />

                {/* Elegant Stats Display */}
                <div className="flex items-center gap-3">
                    {/* Total Count */}
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

                    {/* Selected Count */}
                    {selectedCount > 0 && (
                        <>
                            <div className="h-4 w-px bg-slate-200" />
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 rounded-md border border-blue-100">
                                <CheckSquare className="h-3.5 w-3.5 text-blue-600" />
                                <span className="text-xs font-semibold text-blue-700">
                                    {selectedCount} selected
                                </span>
                                <span className="text-xs text-blue-600 font-medium">
                                    {formatCurrency(selectedTotal)}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* Select All Button */}
                {loadedCount > 0 && (
                    <>
                        <div className="h-4 w-px bg-slate-200" />
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={hasSelection ? onClearSelection : onSelectAll}
                            className="h-6 px-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        >
                            {hasSelection ? (
                                <>
                                    <Square className="h-3.5 w-3.5 mr-1" />
                                    Clear All
                                </>
                            ) : (
                                <>
                                    <CheckSquare className="h-3.5 w-3.5 mr-1" />
                                    Select All ({loadedCount})
                                </>
                            )}
                        </Button>
                    </>
                )}
            </div>

            <div className="flex items-center gap-2">
                {selectedCount > 0 && (
                    <Button
                        size="sm"
                        onClick={onSubmit}
                        disabled={processing}
                        className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                    >
                        {processing ? (
                            <>
                                <div className="h-3 w-3 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Save className="h-3 w-3 mr-1" />
                                Submit ({selectedCount})
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}
