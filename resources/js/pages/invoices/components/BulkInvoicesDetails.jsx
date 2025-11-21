import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    ChevronLeft,
    ChevronRight,
    Eye,
    FileCheck,
    FileText,
    Receipt,
} from 'lucide-react';
import { memo } from 'react';
import StatusBadge from '@/components/custom/StatusBadge.jsx';
import AttachmentViewer from './AttachmentViewer.jsx';

/**
 * Memoized invoice details component to prevent unnecessary re-renders
 * Only re-renders when the current invoice or its index changes
 */
const BulkInvoiceDetails = memo(function BulkInvoiceDetails({
    currentInvoice,
    currentInvoiceIndex,
    invoices,
    handleNavigate,
    getStatusConfig,
    formatCurrency,
    formatDate,
    reviewNotes,
    setReviewNotes,
}) {
    if (!currentInvoice) {
        return (
            <Card className="shadow-sm h-full flex items-center justify-center">
                <div className="text-center p-4">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                        <Eye className="h-5 w-5 text-slate-400" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">Select an invoice to review</p>
                    <p className="text-[10px] text-slate-500">Choose from the list to view details</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="shadow-sm flex flex-col h-full">
            {/* Header with Navigation */}
            <CardHeader className="border-b bg-slate-50 px-2 py-1.5 space-y-0 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <Receipt className="h-3 w-3 text-blue-600" />
                        <CardTitle className="text-xs font-semibold text-slate-900">Invoice Details</CardTitle>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center gap-1">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0"
                            onClick={() => handleNavigate('prev')}
                            disabled={currentInvoiceIndex === 0}
                        >
                            <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <div className="bg-slate-100 rounded px-2 py-0.5">
                            <span className="text-[10px] font-semibold text-slate-700">
                                {currentInvoiceIndex + 1} / {invoices.data.length}
                            </span>
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0"
                            onClick={() => handleNavigate('next')}
                            disabled={currentInvoiceIndex === invoices.data.length - 1}
                        >
                            <ChevronRight className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            {/* Content - Compact Grid Layout */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-2 space-y-2">
                    {/* Primary Info Row - Super Compact */}
                    <div className="grid grid-cols-4 gap-1.5">
                        {/* Invoice Number */}
                        <div className="bg-slate-50 border border-slate-200 rounded p-1.5">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span className="text-[9px] font-semibold text-slate-500 uppercase">Invoice</span>
                                <StatusBadge status={currentInvoice.invoice_status} size="xs" />
                            </div>
                            <p className="font-mono text-[11px] font-bold text-slate-900 leading-tight">{currentInvoice.si_number}</p>
                        </div>

                        {/* Invoice Date */}
                        <div className="bg-slate-50 border border-slate-200 rounded p-1.5">
                            <span className="text-[9px] font-semibold text-slate-500 uppercase block mb-0.5">Date</span>
                            <p className="text-[11px] font-bold text-slate-900">{formatDate(currentInvoice.si_date)}</p>
                        </div>

                        {/* Amount */}
                        <div className="bg-emerald-50 border border-emerald-200 rounded p-1.5">
                            <span className="text-[9px] font-semibold text-emerald-600 uppercase block mb-0.5">Amount</span>
                            <p className="text-[11px] font-bold text-emerald-700">{formatCurrency(currentInvoice.invoice_amount, currentInvoice.currency)}</p>
                        </div>

                        {/* Due Date */}
                        <div className={`rounded p-1.5 border ${
                            currentInvoice.due_date
                                ? 'bg-amber-50 border-amber-200'
                                : 'bg-slate-50 border-slate-200'
                        }`}>
                            <span className={`text-[9px] font-semibold uppercase block mb-0.5 ${
                                currentInvoice.due_date ? 'text-amber-600' : 'text-slate-500'
                            }`}>Due</span>
                            <p className={`text-[11px] font-bold ${
                                currentInvoice.due_date ? 'text-amber-700' : 'text-slate-400'
                            }`}>
                                {currentInvoice.due_date ? formatDate(currentInvoice.due_date) : 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Vendor, PO & Project - Compact Table Layout */}
                    <div className="border border-slate-200 rounded bg-white">
                        <table className="w-full text-[10px]">
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="px-2 py-1.5 w-20 text-slate-500 font-semibold bg-slate-50">Vendor</td>
                                    <td className="px-2 py-1.5 font-bold text-slate-900">{currentInvoice.purchase_order?.vendor?.name}</td>
                                    <td className="px-2 py-1.5 w-20 text-slate-500 font-semibold bg-slate-50">PO #</td>
                                    <td className="px-2 py-1.5 font-mono font-bold text-blue-700">{currentInvoice.purchase_order?.po_number}</td>
                                </tr>
                                <tr>
                                    <td className="px-2 py-1.5 text-slate-500 font-semibold bg-slate-50">PO Amount</td>
                                    <td className="px-2 py-1.5 font-bold text-emerald-700">
                                        {formatCurrency(currentInvoice.purchase_order?.po_amount || 0, currentInvoice.currency)}
                                    </td>
                                    <td className="px-2 py-1.5 text-slate-500 font-semibold bg-slate-50">Balance</td>
                                    <td className="px-2 py-1.5 font-bold text-slate-700">
                                        {formatCurrency(
                                            (currentInvoice.purchase_order?.po_amount || 0) -
                                            (currentInvoice.invoice_amount || 0),
                                            currentInvoice.currency
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-2 py-1.5 text-slate-500 font-semibold bg-slate-50">Project</td>
                                    <td colSpan="3" className="px-2 py-1.5 font-bold text-slate-900">
                                        {currentInvoice.purchase_order?.project?.project_title}
                                    </td>
                                </tr>
                                {currentInvoice.purchase_order?.project?.cer_number && (
                                    <tr>
                                        <td className="px-2 py-1.5 text-slate-500 font-semibold bg-slate-50">CER #</td>
                                        <td colSpan="3" className="px-2 py-1.5 font-mono font-bold text-indigo-700">
                                            {currentInvoice.purchase_order?.project?.cer_number}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Files & Notes */}
                    <div className="space-y-2">
                        {/* Files Section */}
                        <div className="border border-slate-200 rounded bg-white p-2">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-700 uppercase">
                                    <FileCheck className="h-2.5 w-2.5" />
                                    Attachments
                                </span>
                                {currentInvoice.files && currentInvoice.files.length > 0 && (
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-[9px] h-4 px-1">
                                        {currentInvoice.files.length}
                                    </Badge>
                                )}
                            </div>
                            <AttachmentViewer files={currentInvoice.files} compact />
                        </div>

                        {/* Review Notes Section */}
                        <div className="border border-slate-200 rounded bg-white p-2">
                            <Label htmlFor="notes" className="text-[10px] font-semibold text-slate-700 uppercase mb-1.5 flex items-center gap-1">
                                <FileText className="h-2.5 w-2.5" />
                                Review Notes
                            </Label>
                            <Textarea
                                id="notes"
                                placeholder="Notes..."
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                className="min-h-[60px] resize-none border-slate-200 text-[10px] font-mono p-1.5"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
});

export default BulkInvoiceDetails;
