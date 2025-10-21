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
    Eye,
    FileCheck,
    FileText,
    TrendingUp,
    Package,
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
    return (
        <Card className="border-0 shadow-lg overflow-hidden">
            {currentInvoice ? (
                <>
                    {/* Enhanced Header with navigation */}
                    <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-white/20 backdrop-blur-sm p-2">
                                    <FileCheck className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold text-white">Invoice Details</CardTitle>
                                    <p className="text-xs text-blue-100">Review and verify information</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 hover:bg-white/20 text-white"
                                    onClick={() => handleNavigate('prev')}
                                    disabled={currentInvoiceIndex === 0}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="rounded-lg bg-white/20 backdrop-blur-sm px-3 py-1">
                                    <span className="text-sm font-bold text-white">
                                        {currentInvoiceIndex + 1} / {invoices.data.length}
                                    </span>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 hover:bg-white/20 text-white"
                                    onClick={() => handleNavigate('next')}
                                    disabled={currentInvoiceIndex === invoices.data.length - 1}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    {/* Enhanced Content */}
                    <CardContent className="p-5 bg-gradient-to-br from-slate-50 to-white">
                        <div className="grid grid-cols-3 gap-5">
                            {/* Column 1: Invoice + Vendor */}
                            <div className="space-y-4">
                                {/* Enhanced Invoice Header */}
                                <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4 shadow-sm">
                                    <div className="mb-3 flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="rounded-md bg-blue-100 p-1.5">
                                                    <FileText className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div className="text-[10px] font-bold tracking-wider text-blue-600 uppercase">Invoice</div>
                                            </div>
                                            <h3 className="truncate font-mono text-lg font-bold text-slate-900">{currentInvoice.si_number}</h3>
                                        </div>
                                        <StatusBadge status={currentInvoice.invoice_status} />
                                    </div>

                                    <div className="space-y-2.5">
                                        {/* Enhanced Amount Card */}
                                        <div className="rounded-xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-3 shadow-sm">
                                            <div className="mb-1.5 flex items-center gap-2">
                                                <div className="rounded-md bg-emerald-100 p-1">
                                                    <DollarSign className="h-4 w-4 text-emerald-700" />
                                                </div>
                                                <div className="text-[10px] font-bold tracking-wide text-emerald-700 uppercase">Invoice Amount</div>
                                            </div>
                                            <div className="text-2xl font-extrabold text-emerald-700">{formatCurrency(currentInvoice.invoice_amount)}</div>
                                        </div>

                                        {/* Enhanced Date Card */}
                                        <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50/50 to-white p-3">
                                            <div className="mb-1 flex items-center gap-2">
                                                <div className="rounded bg-blue-100 p-1">
                                                    <Calendar className="h-3.5 w-3.5 text-blue-700" />
                                                </div>
                                                <div className="text-[10px] font-semibold tracking-wide text-blue-700 uppercase">Invoice Date</div>
                                            </div>
                                            <div className="text-sm font-bold text-slate-900">{formatDate(currentInvoice.si_date)}</div>
                                        </div>

                                        {/* Enhanced Due Date */}
                                        {currentInvoice.due_date && (
                                            <div className="flex items-center gap-2.5 rounded-lg border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white px-3 py-2.5 shadow-sm">
                                                <div className="rounded-md bg-amber-100 p-1.5">
                                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-[10px] font-semibold text-amber-900 uppercase">Due Date</div>
                                                    <div className="truncate text-sm font-bold text-amber-700">
                                                        {formatDate(currentInvoice.due_date)}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Enhanced Vendor Info */}
                                <div className="rounded-xl border-2 border-slate-200 bg-white p-4 shadow-sm">
                                    <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                                        <div className="rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 p-2">
                                            <Building2 className="h-4 w-4 text-slate-600" />
                                        </div>
                                        Vendor & Purchase Order
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="rounded-lg bg-slate-50 p-3">
                                            <div className="mb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Vendor Name</div>
                                            <div className="text-sm font-bold text-slate-900">{currentInvoice.purchase_order?.vendor?.name}</div>
                                        </div>
                                        <Separator />
                                        <div className="rounded-lg bg-blue-50 p-3">
                                            <div className="mb-1 text-[10px] font-semibold text-blue-600 uppercase tracking-wide">PO Number</div>
                                            <div className="font-mono text-sm font-bold text-blue-700">
                                                {currentInvoice.purchase_order?.po_number}
                                            </div>
                                        </div>
                                        <Separator />
                                        <div className="rounded-lg bg-emerald-50 p-3">
                                            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">
                                                <TrendingUp className="h-3 w-3" />
                                                PO Amount
                                            </div>
                                            <div className="text-sm font-bold text-emerald-700">
                                                {formatCurrency(currentInvoice.purchase_order?.po_amount || 0)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Column 2: Project + Files */}
                            <div className="space-y-4">
                                {/* Enhanced Project Info */}
                                <div className="rounded-xl border-2 border-slate-200 bg-white p-4 shadow-sm">
                                    <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                                        <div className="rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 p-2">
                                            <Package className="h-4 w-4 text-purple-600" />
                                        </div>
                                        Project Information
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="rounded-lg bg-purple-50 p-3">
                                            <div className="mb-1.5 text-[10px] font-semibold text-purple-600 uppercase tracking-wide">Project Title</div>
                                            <div className="text-sm leading-relaxed font-bold text-slate-900">
                                                {currentInvoice.purchase_order?.project?.project_title}
                                            </div>
                                        </div>
                                        {currentInvoice.purchase_order?.project?.cer_number && (
                                            <>
                                                <Separator />
                                                <div className="rounded-lg bg-indigo-50 p-3">
                                                    <div className="mb-1 text-[10px] font-semibold text-indigo-600 uppercase tracking-wide">CER Number</div>
                                                    <div className="font-mono text-sm font-bold text-indigo-700">
                                                        {currentInvoice.purchase_order?.project?.cer_number}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Enhanced Files */}
                                <div className="rounded-xl border-2 border-slate-200 bg-white p-4 shadow-sm">
                                    <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                                        <div className="rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 p-2">
                                            <FileCheck className="h-4 w-4 text-blue-600" />
                                        </div>
                                        Attached Files
                                        {currentInvoice.files && currentInvoice.files.length > 0 && (
                                            <Badge className="ml-auto bg-blue-100 text-blue-700 font-semibold">
                                                {currentInvoice.files.length}
                                            </Badge>
                                        )}
                                    </h4>
                                    <AttachmentViewer files={currentInvoice.files} />
                                </div>
                            </div>

                            {/* Column 3: Enhanced Notes */}
                            <div>
                                <div className="rounded-xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-white to-amber-50 p-4 shadow-sm h-full">
                                    <Label htmlFor="notes" className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-900">
                                        <div className="rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 p-2">
                                            <FileText className="h-4 w-4 text-amber-700" />
                                        </div>
                                        <div>
                                            <div>Review Notes</div>
                                            <p className="text-[10px] font-normal text-amber-700">Add observations or flags</p>
                                        </div>
                                    </Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Enter your review notes here...&#10;&#10;• Observations&#10;• Issues found&#10;• Important flags&#10;• Recommendations"
                                        value={reviewNotes}
                                        onChange={(e) => setReviewNotes(e.target.value)}
                                        className="resize-none border-2 border-amber-200 bg-white text-sm shadow-sm focus-visible:ring-amber-400 placeholder:text-slate-400 h-[calc(100%-60px)] font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </>
            ) : (
                <div className="flex h-[calc(100vh-180px)] items-center justify-center bg-gradient-to-br from-slate-50 to-white">
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 shadow-md">
                            <Eye className="h-10 w-10 text-slate-400" />
                        </div>
                        <p className="text-base font-bold text-slate-700 mb-2">Select an invoice to review</p>
                        <p className="text-sm text-slate-500">Choose from the list on the left to view details</p>
                    </div>
                </div>
            )}
        </Card>
    );
}
