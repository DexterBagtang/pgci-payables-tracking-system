// BulkInvoiceDetails.jsx
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
    Download,
    Eye,
    FileCheck,
    FileText,
    FileX2,
    ShoppingCart,
} from 'lucide-react';
import StatusBadge from '@/components/custom/StatusBadge.jsx';

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
    return (
        <Card className="border-0 shadow-sm">
            {currentInvoice ? (
                <>
                    {/* Header with navigation */}
                    <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white p-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold">Invoice Details</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 w-7 p-0"
                                    onClick={() => handleNavigate('prev')}
                                    disabled={currentInvoiceIndex === 0}
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </Button>
                                <span className="min-w-[50px] text-center text-xs font-medium text-slate-600">
                                    {currentInvoiceIndex + 1} / {invoices.data.length}
                                </span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 w-7 p-0"
                                    onClick={() => handleNavigate('next')}
                                    disabled={currentInvoiceIndex === invoices.data.length - 1}
                                >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    {/* Content */}
                    <CardContent className="p-4">
                        <div className="grid grid-cols-3 gap-4">
                            {/* Column 1: Invoice + Vendor */}
                            <div className="space-y-3">
                                {/* Invoice Header */}
                                <div className="rounded-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-3">
                                    <div className="mb-2 flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <div className="text-[10px] font-medium tracking-wider text-slate-500 uppercase">Invoice</div>
                                            <h3 className="truncate font-mono text-base font-bold text-slate-900">{currentInvoice.si_number}</h3>
                                        </div>
                                        <StatusBadge status={currentInvoice.invoice_status} />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="rounded-lg border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-2.5">
                                            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-emerald-700 uppercase">
                                                <DollarSign className="h-3 w-3" />
                                                Amount
                                            </div>
                                            <div className="text-xl font-bold text-emerald-700">{formatCurrency(currentInvoice.invoice_amount)}</div>
                                        </div>

                                        <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-2.5">
                                            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-blue-700 uppercase">
                                                <Calendar className="h-3 w-3" />
                                                Date
                                            </div>
                                            <div className="text-sm font-bold text-slate-900">{formatDate(currentInvoice.si_date)}</div>
                                        </div>

                                        {currentInvoice.due_date && (
                                            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2">
                                                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-[10px] font-medium text-amber-900">Due Date</div>
                                                    <div className="truncate text-xs font-bold text-amber-700">
                                                        {formatDate(currentInvoice.due_date)}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Vendor Info */}
                                <div className="rounded-lg border border-slate-200 bg-white p-3">
                                    <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-900">
                                        <div className="rounded bg-slate-100 p-1">
                                            <Building2 className="h-3 w-3 text-slate-600" />
                                        </div>
                                        Vendor & PO
                                    </h4>
                                    <div className="space-y-2">
                                        <div>
                                            <div className="mb-0.5 text-[10px] font-medium text-slate-500">Vendor</div>
                                            <div className="text-xs font-semibold text-slate-900">{currentInvoice.purchase_order?.vendor?.name}</div>
                                        </div>
                                        <Separator />
                                        <div>
                                            <div className="mb-0.5 text-[10px] font-medium text-slate-500">PO Number</div>
                                            <div className="font-mono text-xs font-bold text-blue-600">
                                                {currentInvoice.purchase_order?.po_number}
                                            </div>
                                        </div>
                                        <Separator />
                                        <div>
                                            <div className="mb-0.5 text-[10px] font-medium text-slate-500">PO Amount</div>
                                            <div className="text-xs font-bold text-slate-900">
                                                {formatCurrency(currentInvoice.purchase_order?.po_amount || 0)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Column 2: Project + Files */}
                            <div className="space-y-3">
                                {/* Project Info */}
                                <div className="rounded-lg border border-slate-200 bg-white p-3">
                                    <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-900">
                                        <div className="rounded bg-slate-100 p-1">
                                            <ShoppingCart className="h-3 w-3 text-slate-600" />
                                        </div>
                                        Project
                                    </h4>
                                    <div className="space-y-2">
                                        <div>
                                            <div className="mb-0.5 text-[10px] font-medium text-slate-500">Title</div>
                                            <div className="text-xs leading-relaxed font-semibold text-slate-900">
                                                {currentInvoice.purchase_order?.project?.project_title}
                                            </div>
                                        </div>
                                        {currentInvoice.purchase_order?.project?.cer_number && (
                                            <>
                                                <Separator />
                                                <div>
                                                    <div className="mb-0.5 text-[10px] font-medium text-slate-500">CER Number</div>
                                                    <div className="font-mono text-xs font-bold text-slate-900">
                                                        {currentInvoice.purchase_order?.project?.cer_number}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Files */}
                                <div className="rounded-lg border border-slate-200 bg-white p-3">
                                    <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-900">
                                        <div className="rounded bg-slate-100 p-1">
                                            <FileCheck className="h-3 w-3 text-slate-600" />
                                        </div>
                                        Files
                                    </h4>
                                    {currentInvoice.files && currentInvoice.files.length > 0 ? (
                                        <ScrollArea className="max-h-[300px]">
                                            <div className="space-y-1.5">
                                                {currentInvoice.files.map((file) => (
                                                    <div
                                                        key={file.id}
                                                        className="group flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-2 transition-all hover:border-blue-300 hover:bg-blue-50/50"
                                                    >
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <div className="rounded bg-blue-100 p-1">
                                                                <FileText className="h-3 w-3 text-blue-600" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="truncate text-xs font-semibold text-slate-900">{file.file_name}</div>
                                                                <div className="text-[10px] text-slate-500">
                                                                    {(file.file_size / 1024).toFixed(2)} KB
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 w-7 shrink-0 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                                                        >
                                                            <Download className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    ) : (
                                        <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 text-center">
                                            <FileX2 className="mx-auto mb-1.5 h-6 w-6 text-slate-400" />
                                            <p className="text-[10px] font-medium text-slate-500">No files attached</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Column 3: Notes */}
                            <div>
                                <div className="rounded-lg border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-3">
                                    <Label htmlFor="notes" className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-900">
                                        <div className="rounded bg-amber-100 p-1">
                                            <FileText className="h-3 w-3 text-amber-700" />
                                        </div>
                                        Review Notes
                                    </Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Add review notes, observations, or important flags..."
                                        value={reviewNotes}
                                        onChange={(e) => setReviewNotes(e.target.value)}
                                        rows={20}
                                        className="resize-none border-amber-200 bg-white text-xs shadow-sm focus-visible:ring-amber-400"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </>
            ) : (
                <div className="flex h-[calc(100vh-180px)] items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                            <Eye className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">Select an invoice to review</p>
                        <p className="mt-1 text-xs text-slate-500">Choose from the list on the left</p>
                    </div>
                </div>
            )}
        </Card>
    );
}
