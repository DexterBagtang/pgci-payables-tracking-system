import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
    AlertCircle,
    Building2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    Eye,
    FileCheck,
    FileText,
    Package,
    Receipt,
} from 'lucide-react';
import StatusBadge from '@/components/custom/StatusBadge.jsx';
import AttachmentViewer from './AttachmentViewer.jsx';

export default function BulkInvoiceDetails({
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
                <div className="text-center p-8">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                        <Eye className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-base font-semibold text-slate-700 mb-2">Select an invoice to review</p>
                    <p className="text-sm text-slate-500">Choose from the list to view details</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="shadow-sm flex flex-col h-full overflow-hidden">
            {/* Header with Navigation */}
            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white px-5 py-3 space-y-0 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 rounded-lg p-2">
                            <Receipt className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-semibold text-slate-900">Invoice Details</CardTitle>
                            <p className="text-xs text-slate-500">Review and verify information</p>
                        </div>
                    </div>
                    
                    {/* Navigation */}
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => handleNavigate('prev')}
                            disabled={currentInvoiceIndex === 0}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="bg-slate-100 rounded px-3 py-1">
                            <span className="text-xs font-semibold text-slate-700">
                                {currentInvoiceIndex + 1} / {invoices.data.length}
                            </span>
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => handleNavigate('next')}
                            disabled={currentInvoiceIndex === invoices.data.length - 1}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            {/* Content with proper scrolling */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-5 space-y-4">
                    {/* Primary Info Row */}
                    <div className="grid grid-cols-3 gap-4">
                        {/* Invoice Number & Status */}
                        <div className="col-span-1 bg-slate-50 border border-slate-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-slate-600" />
                                    <span className="text-xs font-semibold text-slate-600 uppercase">Invoice</span>
                                </div>
                                <StatusBadge status={currentInvoice.invoice_status} size="sm" />
                            </div>
                            <p className="font-mono text-lg font-bold text-slate-900 mb-3">{currentInvoice.si_number}</p>
                            
                            {/* Invoice Date */}
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Calendar className="h-3.5 w-3.5" />
                                <span className="font-medium">{formatDate(currentInvoice.si_date)}</span>
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="col-span-1 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="h-4 w-4 text-emerald-600" />
                                <span className="text-xs font-semibold text-emerald-700 uppercase">Invoice Amount</span>
                            </div>
                            <p className="text-2xl font-bold text-emerald-700">{formatCurrency(currentInvoice.invoice_amount, currentInvoice.currency)}</p>
                        </div>

                        {/* Due Date */}
                        <div className={`col-span-1 rounded-lg p-4 border ${
                            currentInvoice.due_date 
                                ? 'bg-amber-50 border-amber-200' 
                                : 'bg-slate-50 border-slate-200'
                        }`}>
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className={`h-4 w-4 ${
                                    currentInvoice.due_date ? 'text-amber-600' : 'text-slate-400'
                                }`} />
                                <span className={`text-xs font-semibold uppercase ${
                                    currentInvoice.due_date ? 'text-amber-700' : 'text-slate-500'
                                }`}>Due Date</span>
                            </div>
                            <p className={`text-lg font-bold ${
                                currentInvoice.due_date ? 'text-amber-700' : 'text-slate-400'
                            }`}>
                                {currentInvoice.due_date ? formatDate(currentInvoice.due_date) : 'Not set'}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Vendor & PO Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-slate-600" />
                            Vendor & Purchase Order
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Vendor Name</label>
                                    <p className="text-sm font-bold text-slate-900">{currentInvoice.purchase_order?.vendor?.name}</p>
                                </div>
                                <Separator />
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">PO Number</label>
                                    <p className="font-mono text-sm font-bold text-blue-700">{currentInvoice.purchase_order?.po_number}</p>
                                </div>
                            </div>
                            
                            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">PO Amount</label>
                                    <p className="text-sm font-bold text-emerald-700">
                                        {formatCurrency(currentInvoice.purchase_order?.po_amount || 0, currentInvoice.currency)}
                                    </p>
                                </div>
                                <Separator />
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Balance</label>
                                    <p className="text-sm font-bold text-slate-700">
                                        {formatCurrency(
                                            (currentInvoice.purchase_order?.po_amount || 0) -
                                            (currentInvoice.invoice_amount || 0),
                                            currentInvoice.currency
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Project Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <Package className="h-4 w-4 text-slate-600" />
                            Project Information
                        </h3>
                        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Project Title</label>
                                <p className="text-sm font-bold text-slate-900 leading-relaxed">
                                    {currentInvoice.purchase_order?.project?.project_title}
                                </p>
                            </div>
                            {currentInvoice.purchase_order?.project?.cer_number && (
                                <>
                                    <Separator />
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">CER Number</label>
                                        <p className="font-mono text-sm font-bold text-indigo-700">
                                            {currentInvoice.purchase_order?.project?.cer_number}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Files Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <FileCheck className="h-4 w-4 text-slate-600" />
                                Attached Files
                            </span>
                            {currentInvoice.files && currentInvoice.files.length > 0 && (
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                                    {currentInvoice.files.length}
                                </Badge>
                            )}
                        </h3>
                        <AttachmentViewer files={currentInvoice.files} />
                    </div>

                    <Separator />

                    {/* Review Notes Section */}
                    <div className="pb-4">
                        <Label htmlFor="notes" className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-600" />
                            Review Notes
                        </Label>
                        <Textarea
                            id="notes"
                            placeholder="Add your review notes here...&#10;&#10;• Flag any discrepancies&#10;• Document verification steps&#10;• Note missing information"
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            className="min-h-[120px] resize-none border-slate-200 text-sm font-mono"
                        />
                    </div>
                </div>
            </div>
        </Card>
    );
}
