import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, FileStack, FileText, Settings, Upload } from 'lucide-react';

export default function PartialUploadDialog({
    open,
    onOpenChange,
    filesCount,
    invoicesCount,
    unmatchedInvoiceCount,
    files,
    onShareAllWithAll,
    onContinueManualAssignment,
    onLeaveUnmatched,
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader className="pb-2">
                    <DialogTitle className="flex items-center text-base">
                        <Upload className="mr-2 h-4 w-4 text-orange-600" />
                        Partial Upload: {filesCount} files for {invoicesCount} invoices
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        {unmatchedInvoiceCount > 0 && (
                            <span className="font-medium text-orange-600">
                                {unmatchedInvoiceCount} invoice(s) will remain unmatched.
                            </span>
                        )}
                        {' '}Choose how to handle the files below.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    {/* Compact Summary + Files Preview in one section */}
                    <div className="grid grid-cols-2 gap-2">
                        {/* Left: Stats */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between rounded border bg-blue-50 px-2 py-1.5">
                                <span className="text-xs text-blue-700">Files</span>
                                <span className="text-sm font-bold text-blue-900">{filesCount}</span>
                            </div>
                            <div className="flex items-center justify-between rounded border bg-green-50 px-2 py-1.5">
                                <span className="text-xs text-green-700">Invoices</span>
                                <span className="text-sm font-bold text-green-900">{invoicesCount}</span>
                            </div>
                            <div className="flex items-center justify-between rounded border bg-orange-50 px-2 py-1.5">
                                <span className="text-xs text-orange-700">Unmatched</span>
                                <span className="text-sm font-bold text-orange-900">{unmatchedInvoiceCount}</span>
                            </div>
                        </div>

                        {/* Right: Files List */}
                        <div className="rounded border bg-slate-50 p-2">
                            <h4 className="mb-1 text-xs font-medium text-slate-700">Uploaded Files:</h4>
                            <div className="max-h-20 space-y-0.5 overflow-y-auto">
                                {files.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600">
                                        <FileText className="h-3 w-3 flex-shrink-0" />
                                        <span className="flex-1 truncate">{file.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Compact Options - Reduced vertical spacing */}
                    <div className="space-y-2">
                        {/* Option 1: Share all files with all invoices */}
                        <div className="rounded border-2 border-blue-200 bg-blue-50/50 p-2.5">
                            <div className="mb-2 flex items-start gap-2">
                                <FileStack className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-blue-900">Share with all invoices</h4>
                                    <p className="text-xs text-blue-700">
                                        All {filesCount} files → all {invoicesCount} invoices
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                onClick={onShareAllWithAll}
                                size="sm"
                                className="w-full bg-blue-600 text-white hover:bg-blue-700"
                            >
                                <FileStack className="mr-1.5 h-3.5 w-3.5" />
                                Share All Files
                            </Button>
                        </div>

                        {/* Option 2: Manual assignment */}
                        <div className="rounded border bg-slate-50 p-2.5">
                            <div className="mb-2 flex items-start gap-2">
                                <Settings className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-600" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-slate-900">Manual assignment</h4>
                                    <p className="text-xs text-slate-600">
                                        Auto-match by SI number, then assign unmatched files manually
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onContinueManualAssignment}
                                className="w-full"
                            >
                                <Settings className="mr-1.5 h-3.5 w-3.5" />
                                Manual Assignment
                            </Button>
                        </div>

                        {/* Option 3: Leave unmatched */}
                        <div className="rounded border border-orange-200 bg-orange-50/50 p-2.5">
                            <div className="mb-2 flex items-start gap-2">
                                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-orange-900">Auto-match only</h4>
                                    <p className="text-xs text-orange-700">
                                        Only matched files assigned, rest left empty
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onLeaveUnmatched}
                                className="w-full border-orange-300 text-orange-900 hover:bg-orange-100"
                            >
                                <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
                                Auto-Match Only
                            </Button>
                        </div>
                    </div>

                    {/* Compact Info Box */}
                    <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1.5">
                        <p className="text-xs text-slate-600">
                            <strong>Tip:</strong> Fuzzy matching compares filenames with SI numbers (e.g., "INV-001.pdf" → "INV001")
                        </p>
                    </div>
                </div>

                <DialogFooter className="pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
