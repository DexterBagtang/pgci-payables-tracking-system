import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import {
    Calendar,
    FileText,
    AlertCircle,
    Clock,
    DollarSign,
    CheckCircle,
    Send,
    User,
    Eye,
} from 'lucide-react';
import StatusBadge from '@/components/custom/StatusBadge.jsx';

const InvoiceDetailsTab = ({ invoice, formatCurrency, formatDate, currency }) => {
    const { purchase_order: po } = invoice;
    const invoiceCurrency = currency || invoice.currency || 'PHP';

    // Calculate days until due
    const calculateDaysUntilDue = () => {
        if (!invoice.due_date) return null;
        const today = new Date();
        const dueDate = new Date(invoice.due_date);
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysUntilDue = calculateDaysUntilDue();

    // Calculate aging since SI received
    const calculateAging = () => {
        if (!invoice.si_received_at) return null;
        const today = new Date();
        const receivedDate = new Date(invoice.si_received_at);
        const diffTime = today - receivedDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const agingDays = calculateAging();

    // Calculate processing time
    const calculateProcessingTime = () => {
        if (!invoice.si_received_at || !invoice.reviewed_at) return null;
        const receivedDate = new Date(invoice.si_received_at);
        const reviewedDate = new Date(invoice.reviewed_at);
        const diffTime = reviewedDate - receivedDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const processingDays = calculateProcessingTime();

    // Calculate PO coverage
    const invoicePercentOfPO = po?.po_amount ? ((invoice.invoice_amount / po.po_amount) * 100).toFixed(1) : null;
    const remainingPOBalance = po?.po_amount ? (po.po_amount - invoice.invoice_amount) : null;

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Financial Details */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-sm font-semibold text-slate-700">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Financial Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-2">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-sm text-slate-600">Invoice Amount</span>
                            <span className="font-semibold text-slate-900">{formatCurrency(invoice.invoice_amount, invoiceCurrency)}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-sm text-slate-600">Tax Amount</span>
                            <span className="font-medium text-slate-700">{formatCurrency(invoice.tax_amount, invoiceCurrency)}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-sm text-slate-600">Discount</span>
                            <span className="font-medium text-slate-700">{formatCurrency(invoice.discount_amount, invoiceCurrency)}</span>
                        </div>
                        <div className="flex justify-between bg-slate-50 p-2 rounded">
                            <span className="text-sm font-semibold text-slate-700">Net Amount</span>
                            <span className="font-bold text-slate-900">{formatCurrency(invoice.net_amount, invoiceCurrency)}</span>
                        </div>
                    </div>

                    {invoicePercentOfPO !== null && (
                        <div className="mt-4 space-y-2 border-t pt-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-600">PO Coverage</span>
                                <Badge variant="secondary" className="font-semibold">{invoicePercentOfPO}%</Badge>
                            </div>
                            <div className="text-xs text-slate-500">
                                <div className="flex justify-between">
                                    <span>PO Amount:</span>
                                    <span>{formatCurrency(po?.po_amount, invoiceCurrency)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Remaining:</span>
                                    <span>{formatCurrency(remainingPOBalance, invoiceCurrency)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Payment & Timeline */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-sm font-semibold text-slate-700">
                        <Clock className="mr-2 h-4 w-4" />
                        Payment & Timeline
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-2">
                        <div>
                            <div className="mb-1 text-xs text-slate-500">Payment Type</div>
                            <div className="text-sm font-medium capitalize text-slate-900">
                                {invoice.payment_type?.replace('_', ' ') || 'Not specified'}
                            </div>
                        </div>

                        {invoice.terms_of_payment && (
                            <div>
                                <div className="mb-1 text-xs text-slate-500">Terms</div>
                                <div className="text-sm font-medium text-slate-900">{invoice.terms_of_payment}</div>
                            </div>
                        )}

                        {invoice.other_payment_terms && (
                            <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                                {invoice.other_payment_terms}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 border-t pt-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-xs text-slate-500">Due Date</div>
                                <div className="text-sm font-semibold text-slate-900">{formatDate(invoice.due_date)}</div>
                            </div>
                            {daysUntilDue !== null && (
                                <Badge 
                                    variant={daysUntilDue < 0 ? 'destructive' : daysUntilDue <= 7 ? 'warning' : 'default'}
                                    className="text-xs"
                                >
                                    {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)}d overdue` : `${daysUntilDue}d left`}
                                </Badge>
                            )}
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-xs text-slate-500">SI Date</span>
                            <span className="text-sm font-medium text-slate-700">{formatDate(invoice.si_date)}</span>
                        </div>

                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-xs text-slate-500">SI Received</div>
                                <div className="text-sm font-medium text-slate-700">{formatDate(invoice.si_received_at)}</div>
                            </div>
                            {agingDays !== null && (
                                <Badge 
                                    variant={agingDays > 30 ? 'destructive' : agingDays > 15 ? 'warning' : 'secondary'}
                                    className="text-xs"
                                >
                                    {agingDays}d old
                                </Badge>
                            )}
                        </div>

                        {invoice.files_received_at && (
                            <div className="flex justify-between text-sm">
                                <span className="text-xs text-slate-500">Files Received</span>
                                <span className="text-sm font-medium text-slate-700">{formatDate(invoice.files_received_at)}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Processing & Status */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-sm font-semibold text-slate-700">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Processing & Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-2">
                        <div>
                            <div className="mb-1 text-xs text-slate-500">Current Status</div>
                            <StatusBadge status={invoice.invoice_status} showIcon size="sm" />
                        </div>

                        <div>
                            <div className="mb-1 text-xs text-slate-500">SI Number</div>
                            <div className="font-mono text-sm font-semibold text-slate-900">{invoice.si_number || 'Not set'}</div>
                        </div>
                    </div>

                    {invoice.submitted_at && (
                        <div className="border-t pt-3 space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Send className="h-3 w-3 text-blue-600" />
                                <span className="text-xs font-semibold text-blue-700">Submitted</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-xs text-slate-500">Date</span>
                                <span className="text-sm font-medium text-slate-700">{formatDate(invoice.submitted_at)}</span>
                            </div>
                            {invoice.submitted_to && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-xs text-slate-500">To</span>
                                    <span className="text-sm font-medium text-slate-700">{invoice.submitted_to}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {invoice.reviewed_at && (
                        <div className="border-t pt-3 space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <span className="text-xs font-semibold text-green-700">Reviewed</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-xs text-slate-500">Date</span>
                                <span className="text-sm font-medium text-slate-700">{formatDate(invoice.reviewed_at)}</span>
                            </div>
                            {processingDays !== null && (
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-500">Processing Time</span>
                                    <Badge 
                                        variant={processingDays <= 3 ? 'default' : processingDays <= 7 ? 'secondary' : 'destructive'}
                                        className="text-xs"
                                    >
                                        {processingDays}d
                                    </Badge>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="border-t pt-3 space-y-2 text-xs text-slate-500">
                        <div className="flex justify-between">
                            <span>Created</span>
                            <span>{formatDate(invoice.created_at)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Updated</span>
                            <span>{formatDate(invoice.updated_at)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notes - Full Width */}
            {invoice.notes && (
                <Card className="lg:col-span-3">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center text-sm font-semibold text-slate-700">
                            <AlertCircle className="mr-2 h-4 w-4" />
                            Notes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded">
                            {invoice.notes}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Related Document - Full Width */}
            {po && (
                <Card className="lg:col-span-3 bg-slate-50">
                    <CardContent className="py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-slate-600" />
                                <div>
                                    <div className="text-xs text-slate-500">Related Purchase Order</div>
                                    <div className="font-semibold text-slate-900">{po.po_number}</div>
                                </div>
                            </div>
                            <Link href={`/purchase-orders/${po.id}`}>
                                <Button variant="outline" size="sm">
                                    <Eye className="mr-1 h-3 w-3" />
                                    View
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default InvoiceDetailsTab;
