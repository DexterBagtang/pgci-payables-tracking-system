import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';

export default function ConfirmationDialog({
    open,
    onOpenChange,
    isBulkMode,
    bulkInvoices,
    bulkSummary,
    singleData,
    selectedPO,
    calculateVAT,
    calculatePOPercentage,
    processing,
    onConfirm,
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <Eye className="mr-2 h-5 w-5 text-blue-600" />
                        {isBulkMode ? `Review ${bulkInvoices.length} Invoices` : 'Review Invoice'}
                    </DialogTitle>
                    <DialogDescription className="text-xs">Please verify all information before submission.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {isBulkMode && bulkSummary ? (
                        <div>
                            <div className="mb-4 rounded bg-blue-50 p-3">
                                <h3 className="mb-2 font-medium text-blue-900">Bulk Submission Summary</h3>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-blue-700">Total Invoices:</span>
                                        <span className="ml-2 font-medium">{bulkSummary.count}</span>
                                    </div>
                                    <div>
                                        <span className="text-blue-700">Total Amount:</span>
                                        <span className="ml-2 font-medium">
                                            {bulkSummary.currency === 'USD' ? '$' : '₱'}
                                            {bulkSummary.totalAmount.toLocaleString()}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-blue-700">Total VAT:</span>
                                        <span className="ml-2 font-medium">
                                            {bulkSummary.currency === 'USD' ? '$' : '₱'}
                                            {bulkSummary.totalVAT.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="max-h-60 space-y-2 overflow-y-auto">
                                {bulkInvoices.map((invoice, index) => (
                                    <div key={index} className="rounded border p-2 text-sm">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <span className="font-medium">{invoice.si_number}</span>
                                                <span className="ml-2 text-slate-500">
                                                    {invoice.si_date ? format(new Date(invoice.si_date), 'MMM d, yyyy') : 'No date'}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium">{invoice.currency === 'USD' ? '$' : '₱'}{Number(invoice.invoice_amount || 0).toLocaleString()}</div>
                                                <div className="text-xs text-slate-500">
                                                    VAT: {invoice.currency === 'USD' ? '$' : '₱'}{calculateVAT(invoice.invoice_amount).vatAmount.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-slate-600">SI Number:</span>
                                    <span className="ml-2 font-medium">{singleData.si_number}</span>
                                </div>
                                <div>
                                    <span className="text-slate-600">Amount:</span>
                                    <span className="ml-2 font-medium">{singleData.currency === 'USD' ? '$' : '₱'}{Number(singleData.invoice_amount || 0).toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="text-slate-600">SI Date:</span>
                                    <span className="ml-2 font-medium">
                                        {singleData.si_date ? format(new Date(singleData.si_date), 'PPP') : 'Not set'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-600">VAT Amount:</span>
                                    <span className="ml-2 font-medium">{singleData.currency === 'USD' ? '$' : '₱'}{calculateVAT(singleData.invoice_amount).vatAmount.toFixed(2)}</span>
                                </div>
                                <div>
                                    <span className="text-slate-600">VAT Exclusive:</span>
                                    <span className="ml-2 font-medium">
                                        {singleData.currency === 'USD' ? '$' : '₱'}{calculateVAT(singleData.invoice_amount).vatableAmount.toFixed(2)}
                                    </span>
                                </div>
                                {selectedPO && singleData.invoice_amount && (
                                    <div>
                                        <span className="text-slate-600">% of PO Amount:</span>
                                        <span className="ml-2 font-medium">
                                            {calculatePOPercentage(singleData.invoice_amount, selectedPO.po_amount).toFixed(2)}%
                                        </span>
                                    </div>
                                )}
                            </div>

                            {selectedPO && (
                                <div className="rounded bg-slate-50 p-3">
                                    <h4 className="mb-2 font-medium text-slate-900">Purchase Order</h4>
                                    <div className="text-sm text-slate-700">
                                        {selectedPO.po_number} - {selectedPO.vendor_name}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                        {processing ? 'Processing...' : `Confirm & Submit ${isBulkMode ? `(${bulkInvoices.length})` : ''}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
