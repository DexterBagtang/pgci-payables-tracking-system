import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, FileStack, FileText, Receipt, Sparkles, Info } from 'lucide-react';

/**
 * Simplified dialog for single file upload scenario only
 * When 1 file is uploaded for multiple invoices
 */
export default function UnifiedFileDialog({
    open,
    onOpenChange,
    scenario,
    filesCount,
    invoicesCount,
    files = [],
    onShareWithAll,
    onAssignToOne,
}) {
    // Only handle single file scenario
    const isSingleFile = scenario === 'single-file' || (filesCount === 1 && invoicesCount > 1);
    const pendingFile = files[0];

    // If not single file scenario, don't show dialog
    if (!isSingleFile) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileStack className="h-5 w-5 text-blue-600" />
                        Single File Detected
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        You've uploaded 1 file with {invoicesCount} invoices. How should we handle this?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* File Info Summary */}
                    <div className="rounded-lg border bg-gradient-to-r from-slate-50 to-blue-50/30 p-4">
                        <div className="flex items-center gap-3">
                            <FileText className="h-10 w-10 text-blue-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-900 truncate">{pendingFile?.name}</p>
                                <p className="text-sm text-slate-600">
                                    {pendingFile && (pendingFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">1</div>
                                <div className="text-xs text-slate-600">file</div>
                            </div>
                            <div className="text-slate-400">→</div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-green-600">{invoicesCount}</div>
                                <div className="text-xs text-slate-600">invoices</div>
                            </div>
                        </div>
                    </div>

                    {/* Options for single file */}
                    <div className="space-y-3">
                        {/* Option 1: Share with all (Recommended) */}
                        <div className="relative rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-sm">
                            <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Recommended
                            </Badge>
                            <div className="mb-3 flex items-start gap-3">
                                <div className="rounded-full bg-blue-600 p-2">
                                    <FileStack className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-blue-900 mb-1">Share with all invoices</h4>
                                    <p className="text-sm text-blue-700 mb-2">
                                        This file contains multiple pages with all {invoicesCount} invoices. The same file will be attached to all invoices.
                                    </p>
                                    <div className="flex items-start gap-2 rounded bg-white/60 p-2 text-xs text-blue-800">
                                        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                        <span>Best for: Multi-page PDFs with all invoices, shared attachments, or consolidated files</span>
                                    </div>
                                </div>
                            </div>
                            <Button
                                type="button"
                                onClick={onShareWithAll}
                                className="w-full bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                            >
                                <Check className="mr-2 h-4 w-4" />
                                Yes, Share with All {invoicesCount} Invoices
                            </Button>
                        </div>

                        {/* Option 2: Assign to one */}
                        <div className="rounded-lg border bg-white p-4">
                            <div className="mb-3 flex items-start gap-3">
                                <div className="rounded-full bg-slate-200 p-2">
                                    <Receipt className="h-5 w-5 text-slate-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-slate-900 mb-1">Assign to one invoice only</h4>
                                    <p className="text-sm text-slate-600 mb-2">
                                        This file belongs to a single invoice. I'll manually assign it.
                                    </p>
                                    <div className="flex items-start gap-2 rounded bg-slate-50 p-2 text-xs text-slate-700">
                                        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                        <span>Best for: Individual invoice files, single-page documents</span>
                                    </div>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onAssignToOne}
                                className="w-full"
                            >
                                <Receipt className="mr-2 h-4 w-4" />
                                Assign to One Invoice
                            </Button>
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
