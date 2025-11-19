import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Check, FileStack, FileText, Receipt } from 'lucide-react';

export default function SingleFileDialog({
    open,
    onOpenChange,
    pendingFile,
    invoiceCount,
    onShareWithAll,
    onAssignToOne,
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <FileStack className="mr-2 h-5 w-5 text-blue-600" />
                        Single File Detected
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        You've uploaded a single file with {invoiceCount} invoices. How would you like to handle this file?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* File Info */}
                    <div className="rounded border bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-blue-600" />
                            <div className="flex-1">
                                <p className="font-medium text-slate-900">{pendingFile?.name}</p>
                                <p className="text-sm text-slate-500">
                                    {pendingFile && (pendingFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                        <div className="rounded border-2 border-blue-200 bg-blue-50/50 p-4">
                            <div className="mb-2 flex items-start gap-2">
                                <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
                                <div className="flex-1">
                                    <h4 className="font-semibold text-blue-900">Share with all invoices</h4>
                                    <p className="text-sm text-blue-700">
                                        This file contains multiple pages with all {invoiceCount} invoices.
                                        The same file will be attached to all invoices.
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                onClick={onShareWithAll}
                                className="mt-3 w-full bg-blue-600 text-white hover:bg-blue-700"
                            >
                                <Check className="mr-2 h-4 w-4" />
                                Yes, Share with All {invoiceCount} Invoices
                            </Button>
                        </div>

                        <div className="rounded border bg-slate-50 p-4">
                            <div className="mb-2">
                                <h4 className="font-semibold text-slate-900">Assign to one invoice only</h4>
                                <p className="text-sm text-slate-600">
                                    This file belongs to a single invoice. I'll assign it manually.
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onAssignToOne}
                                className="mt-3 w-full"
                            >
                                <Receipt className="mr-2 h-4 w-4" />
                                No, Assign to One Invoice
                            </Button>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="rounded border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs text-slate-600">
                            <strong>Tip:</strong> If your PDF contains all invoices in one file (e.g., 10 invoices in a single PDF),
                            choose "Share with all invoices". If it's a single invoice file, choose "Assign to one invoice".
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
