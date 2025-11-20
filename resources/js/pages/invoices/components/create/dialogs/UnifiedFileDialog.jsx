import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Check, FileStack, FileText, Receipt, Settings, Sparkles, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Unified smart dialog for all file upload scenarios
 * Replaces: SingleFileDialog, PartialUploadDialog, and provides better guidance
 */
export default function UnifiedFileDialog({
    open,
    onOpenChange,
    scenario, // 'single-file' | 'partial-upload' | 'normal'
    filesCount,
    invoicesCount,
    files = [],
    unmatchedInvoiceCount = 0,
    onShareWithAll,
    onAssignToOne,
    onContinueManualAssignment,
    onLeaveUnmatched,
}) {
    // Determine which scenario we're in
    const isSingleFile = scenario === 'single-file' || (filesCount === 1 && invoicesCount > 1);
    const isPartialUpload = scenario === 'partial-upload' || (filesCount > 1 && filesCount < invoicesCount);
    const pendingFile = files[0];

    // Smart title based on scenario
    const getTitle = () => {
        if (isSingleFile) return 'Single File Detected';
        if (isPartialUpload) return 'Partial Upload Detected';
        return 'File Upload';
    };

    // Smart description
    const getDescription = () => {
        if (isSingleFile) {
            return `You've uploaded 1 file with ${invoicesCount} invoices. How should we handle this?`;
        }
        if (isPartialUpload) {
            return `You've uploaded ${filesCount} files for ${invoicesCount} invoices. ${unmatchedInvoiceCount > 0 ? `${unmatchedInvoiceCount} invoice(s) will remain unmatched.` : ''}`;
        }
        return 'Choose how to handle your files';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileStack className="h-5 w-5 text-blue-600" />
                        {getTitle()}
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        {getDescription()}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* File Info Summary */}
                    {isSingleFile ? (
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
                    ) : isPartialUpload ? (
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-lg border bg-blue-50 p-3 text-center">
                                <FileStack className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                                <div className="text-xl font-bold text-blue-900">{filesCount}</div>
                                <div className="text-xs text-blue-700">Files uploaded</div>
                            </div>
                            <div className="rounded-lg border bg-green-50 p-3 text-center">
                                <Receipt className="h-6 w-6 text-green-600 mx-auto mb-1" />
                                <div className="text-xl font-bold text-green-900">{invoicesCount}</div>
                                <div className="text-xs text-green-700">Total invoices</div>
                            </div>
                            <div className="rounded-lg border bg-orange-50 p-3 text-center">
                                <AlertCircle className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                                <div className="text-xl font-bold text-orange-900">{unmatchedInvoiceCount}</div>
                                <div className="text-xs text-orange-700">Will be unmatched</div>
                            </div>
                        </div>
                    ) : null}

                    {/* Smart Options based on scenario */}
                    <div className="space-y-3">
                        {isSingleFile && (
                            <>
                                {/* Option 1: Share with all (Recommended for single file) */}
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
                            </>
                        )}

                        {isPartialUpload && (
                            <>
                                {/* Option 1: Manual assignment (Recommended for partial) */}
                                <div className="relative rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-sm">
                                    <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        Recommended
                                    </Badge>
                                    <div className="mb-3 flex items-start gap-3">
                                        <div className="rounded-full bg-blue-600 p-2">
                                            <Settings className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-blue-900 mb-1">Smart auto-match + manual assignment</h4>
                                            <p className="text-sm text-blue-700 mb-2">
                                                We'll automatically match files to invoices by SI number, then you can manually assign any unmatched files.
                                            </p>
                                            <div className="flex items-start gap-2 rounded bg-white/60 p-2 text-xs text-blue-800">
                                                <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                                <span>Most accurate: Matches files like "INV-001.pdf" to invoice "INV001", you handle the rest</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={onContinueManualAssignment}
                                        className="w-full bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        Continue with Smart Matching
                                    </Button>
                                </div>

                                {/* Option 2: Share all with all */}
                                <div className="rounded-lg border bg-white p-4">
                                    <div className="mb-3 flex items-start gap-3">
                                        <div className="rounded-full bg-slate-200 p-2">
                                            <FileStack className="h-5 w-5 text-slate-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-slate-900 mb-1">Share all files with all invoices</h4>
                                            <p className="text-sm text-slate-600 mb-2">
                                                All {filesCount} files will be attached to all {invoicesCount} invoices.
                                            </p>
                                            <div className="flex items-start gap-2 rounded bg-slate-50 p-2 text-xs text-slate-700">
                                                <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                                <span>Best for: Supporting documents needed by all invoices (contracts, terms, etc.)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onShareWithAll}
                                        className="w-full"
                                    >
                                        <FileStack className="mr-2 h-4 w-4" />
                                        Share All Files
                                    </Button>
                                </div>

                                {/* Option 3: Auto-match only */}
                                <div className="rounded-lg border border-orange-200 bg-orange-50/30 p-4">
                                    <div className="mb-3 flex items-start gap-3">
                                        <div className="rounded-full bg-orange-200 p-2">
                                            <AlertCircle className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-orange-900 mb-1">Auto-match only (skip unmatched)</h4>
                                            <p className="text-sm text-orange-700 mb-2">
                                                Only matched files will be assigned. {unmatchedInvoiceCount} invoice(s) will have no files attached.
                                            </p>
                                            <div className="flex items-start gap-2 rounded bg-white/60 p-2 text-xs text-orange-800">
                                                <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                                <span>Use when: You'll upload missing files later or some invoices don't need attachments</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onLeaveUnmatched}
                                        className="w-full border-orange-300 text-orange-900 hover:bg-orange-100"
                                    >
                                        <AlertCircle className="mr-2 h-4 w-4" />
                                        Auto-Match Only
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Files Preview (for partial upload) */}
                    {isPartialUpload && files.length > 0 && (
                        <div className="rounded-lg border bg-slate-50 p-3">
                            <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Uploaded Files ({files.length})
                            </h4>
                            <div className="max-h-32 space-y-1 overflow-y-auto">
                                {files.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 bg-white rounded px-2 py-1">
                                        <FileText className="h-3 w-3 flex-shrink-0 text-blue-500" />
                                        <span className="flex-1 truncate font-medium">{file.name}</span>
                                        <span className="text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
