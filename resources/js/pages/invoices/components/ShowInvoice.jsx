import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox.js';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea.js';
import { cn } from '@/lib/utils';
import { Link, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { numberToWords } from 'number-to-words';

import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft, ArrowRight,
    Building2,
    CheckCircle,
    ClipboardCheck,
    Clock,
    CreditCard,
    Download,
    Edit,
    Eye,
    FileIcon,
    FileText,
    Folder, History,
    Info, MessageSquare,
    Paperclip,
    Receipt,
    Send,
    XCircle
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input.js';
import ActivityTimeline from '@/components/custom/ActivityTimeline.jsx';
import AttachmentsCard from '@/components/custom/AttachmentsCard.jsx';
import Remarks from '@/components/custom/Remarks.jsx';
import remarks from '@/routes/remarks/index.js';
import InvoiceReview from '@/pages/invoices/components/InvoiceReview.jsx';

const ShowInvoice = ({ invoice }) => {
    // Destructure related data from invoice object
    const {
        purchase_order: po,
        files = [],
        created_by: creator,
        check_requisitions = [],
        activity_logs,
        remarks = [],
    } = invoice;





    const project = po?.project;
    const vendor = po?.vendor;
    const po_files = po?.files;

    const attachments = [...po_files,...files];
    console.log(attachments);

    const { user } = usePage().props.auth;

    const [tab, setTab] = useState('details');
    const [showCreateReqDialog, setShowCreateReqDialog] = useState(false);

    // Helper function to get status color
    const getStatusColor = (status) => {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            paid: 'bg-green-100 text-green-800 border-green-200',
            overdue: 'bg-red-100 text-red-800 border-red-200',
            processing: 'bg-blue-100 text-blue-800 border-blue-200',
            cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
        };
        return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    // Helper function to format currency
    const formatCurrency = (amount) => {
        if (!amount) return '₱0.00';
        return `₱${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    };

    // Helper function to format date
    const formatDate = (date) => {
        if (!date) return 'Not set';
        return format(new Date(date), 'MMM dd, yyyy');
    };

    // Helper function to calculate days overdue
    const getDaysOverdue = () => {
        if (!invoice.due_date || invoice.invoice_status === 'paid') return null;
        const today = new Date();
        const dueDate = new Date(invoice.due_date);
        const diffTime = today - dueDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : null;
    };

    const daysOverdue = getDaysOverdue();

    // Check if user has accounting role or permission to review
    // const canReviewInvoice = user?.role?.includes('accounting') || user?.permissions?.includes('review_invoice');
    const canReviewInvoice = true;

    // Check if invoice is already reviewed
    const isAlreadyReviewed = invoice.invoice_status === 'approved';

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="container mx-auto max-w-7xl space-y-6 p-6">
                    {/* Compact Header with Key Info */}
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            {/* Invoice Title & Status */}
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-2xl font-bold text-slate-900">Invoice #{invoice.si_number}</h1>
                                    <Badge className={cn('px-3 py-1', getStatusColor(invoice.invoice_status))}>
                                        {invoice.invoice_status || 'Pending'}
                                    </Badge>
                                    {daysOverdue && (
                                        <Badge className="border-red-200 bg-red-100 px-3 py-1 text-red-800">{daysOverdue} days overdue</Badge>
                                    )}
                                </div>
                                <div className="text-sm text-slate-600">
                                    Created {formatDate(invoice.created_at)} • Due {formatDate(invoice.due_date)}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-shrink-0 gap-2">
                                <Link href={`/invoices/${invoice.id}/edit`} prefetch>
                                    <Button variant="outline" size="sm">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Button>
                                </Link>
                                <Link href="/invoices" prefetch>
                                    <Button variant="outline" size="sm">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Key Information Grid */}
                        <div className="mt-6 grid grid-cols-1 gap-6 border-t pt-6 md:grid-cols-2 xl:grid-cols-4">
                            {/* Amount */}
                            <div className="text-center">
                                <div className="mb-1 text-3xl font-bold text-green-600">{formatCurrency(invoice.invoice_amount)}</div>
                                <div className="text-sm text-slate-500">Invoice Amount</div>
                                {invoice.net_amount !== invoice.invoice_amount && (
                                    <div className="mt-1 text-xs text-slate-400">Net: {formatCurrency(invoice.net_amount)}</div>
                                )}
                            </div>

                            {/* Vendor */}
                            <div>
                                <div className="mb-2 flex items-center">
                                    <Building2 className="mr-2 h-4 w-4 text-orange-600" />
                                    <span className="text-sm font-medium text-slate-700">Vendor</span>
                                </div>
                                <div className="truncate font-semibold text-slate-900">{vendor?.name || 'No Vendor'}</div>
                                <div className="truncate text-sm text-slate-600">{vendor?.category || ''}</div>
                                {vendor && (
                                    <Link href={`/vendors/${vendor.id}`} className="text-xs text-blue-600 hover:text-blue-800">
                                        View Details
                                    </Link>
                                )}
                            </div>

                            {/* Project */}
                            <div>
                                <div className="mb-2 flex items-center">
                                    <Folder className="mr-2 h-4 w-4 text-purple-600" />
                                    <span className="text-sm font-medium text-slate-700">Project</span>
                                </div>
                                <div className="truncate font-semibold text-slate-900">{project?.project_title || 'No Project'}</div>
                                <div className="font-mono text-sm text-slate-600">CER: {project?.cer_number || 'N/A'}</div>
                                {project && (
                                    <Link href={`/projects/${project.id}`} className="text-xs text-blue-600 hover:text-blue-800">
                                        View Details
                                    </Link>
                                )}
                            </div>

                            {/* Purchase Order */}
                            <div>
                                <div className="mb-2 flex items-center">
                                    <FileText className="mr-2 h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-slate-700">Purchase Order</span>
                                </div>
                                <div className="font-semibold text-slate-900">{po?.po_number || 'No PO'}</div>
                                <div className="text-sm text-slate-600">
                                    {formatCurrency(po?.po_amount)} • {po?.po_status}
                                </div>
                                {po && (
                                    <Link href={`/purchase-orders/${po.id}`} className="text-xs text-blue-600 hover:text-blue-800">
                                        View Details
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabbed Content */}
                    <Tabs value={tab} onValueChange={setTab} className="space-y-4">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="files">Files ({attachments.length})</TabsTrigger>
                            <TabsTrigger value="requisitions">Requisitions ({check_requisitions.length})</TabsTrigger>
                            <TabsTrigger value="remarks">Remarks ({remarks.length})</TabsTrigger>
                            <TabsTrigger value="review">Review</TabsTrigger>
                            <TabsTrigger value="timeline">Activity Logs</TabsTrigger>
                        </TabsList>

                        {/* Invoice Details Tab */}
                        <TabsContent value="details" className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Invoice Information */}
                                <Card>
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center text-lg">
                                            <Receipt className="mr-2 h-5 w-5 text-blue-600" />
                                            Invoice Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <div className="text-slate-500">SI Number</div>
                                                <div className="font-medium">{invoice.si_number || 'Not set'}</div>
                                            </div>
                                            <div>
                                                <div className="text-slate-500">SI Date</div>
                                                <div className="font-medium">{formatDate(invoice.si_date)}</div>
                                            </div>
                                            <div>
                                                <div className="text-slate-500">Received Date</div>
                                                <div className="font-medium">{formatDate(invoice.si_received_at)}</div>
                                            </div>
                                            <div>
                                                <div className="text-slate-500">Payment Type</div>
                                                <div className="font-medium">{invoice.payment_type || 'Not specified'}</div>
                                            </div>
                                            <div>
                                                <div className="text-slate-500">Submitted To</div>
                                                <div className="font-medium">{invoice.submitted_to || 'Not submitted'}</div>
                                            </div>
                                            <div>
                                                <div className="text-slate-500">Submitted Date</div>
                                                <div className="font-medium">{formatDate(invoice.submitted_at)}</div>
                                            </div>
                                        </div>

                                        {/* Amount Breakdown */}
                                        <div className="border-t pt-4">
                                            <div className="mb-3 text-sm font-medium text-slate-700">Amount Breakdown</div>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span>Invoice Amount:</span>
                                                    <span className="font-medium">{formatCurrency(invoice.invoice_amount)}</span>
                                                </div>
                                                {invoice.tax_amount > 0 && (
                                                    <div className="flex justify-between">
                                                        <span>Tax Amount:</span>
                                                        <span className="font-medium">{formatCurrency(invoice.tax_amount)}</span>
                                                    </div>
                                                )}
                                                {invoice.discount_amount > 0 && (
                                                    <div className="flex justify-between text-green-600">
                                                        <span>Discount:</span>
                                                        <span className="font-medium">-{formatCurrency(invoice.discount_amount)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between border-t pt-2 font-semibold">
                                                    <span>Net Amount:</span>
                                                    <span>{formatCurrency(invoice.net_amount)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {invoice.notes && (
                                            <div className="border-t pt-4">
                                                <div className="mb-2 text-sm font-medium text-slate-700">Notes</div>
                                                <div className="rounded bg-slate-50 p-3 text-sm text-slate-700">{invoice.notes}</div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Related Information */}
                                <Card>
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center text-lg">
                                            <Info className="mr-2 h-5 w-5 text-indigo-600" />
                                            Related Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Vendor Details */}
                                        {vendor && (
                                            <div>
                                                <div className="mb-3 flex items-center justify-between">
                                                    <h4 className="font-medium text-slate-800">Vendor Information</h4>
                                                    <Link href={`/vendors/${vendor.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="mr-1 h-3 w-3" />
                                                            View
                                                        </Button>
                                                    </Link>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Name:</span>
                                                        <span className="font-medium">{vendor.name}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Category:</span>
                                                        <span className="font-medium">{vendor.category}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Payment Terms:</span>
                                                        <span className="font-medium">{vendor.payment_terms || 'Not specified'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Contact:</span>
                                                        <span className="text-right font-medium">
                                                        {vendor.email && <div>{vendor.email}</div>}
                                                            {vendor.phone && <div>{vendor.phone}</div>}
                                                    </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Project Details */}
                                        {project && (
                                            <div className="border-t pt-4">
                                                <div className="mb-3 flex items-center justify-between">
                                                    <h4 className="font-medium text-slate-800">Project Information</h4>
                                                    <Link href={`/projects/${project.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="mr-1 h-3 w-3" />
                                                            View
                                                        </Button>
                                                    </Link>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Title:</span>
                                                        <span className="max-w-[200px] truncate text-right font-medium">{project.project_title}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">CER Number:</span>
                                                        <span className="font-mono font-medium">{project.cer_number}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Project Cost:</span>
                                                        <span className="font-medium">{formatCurrency(project.total_project_cost)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Status:</span>
                                                        <Badge className="text-xs capitalize">{project.project_status?.replace('_', ' ')}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* PO Comparison */}
                                        {po && (
                                            <div className="border-t pt-4">
                                                <h4 className="mb-3 font-medium text-slate-800">PO vs Invoice</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">PO Amount:</span>
                                                        <span className="font-medium">{formatCurrency(po.po_amount)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Invoice Amount:</span>
                                                        <span className="font-medium">{formatCurrency(invoice.invoice_amount)}</span>
                                                    </div>
                                                    <div className="flex justify-between border-t pt-2">
                                                        <span className="text-slate-500">Remaining:</span>
                                                        <span
                                                            className={cn(
                                                                'font-medium',
                                                                po.po_amount - invoice.invoice_amount >= 0 ? 'text-green-600' : 'text-red-600',
                                                            )}
                                                        >
                                                        {formatCurrency(po.po_amount - invoice.invoice_amount)}
                                                    </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Files Tab */}
                        <TabsContent value="files">
                            <AttachmentsCard files={attachments} />
                        </TabsContent>

                        {/* Check Requisitions Tab */}
                        <TabsContent value="requisitions">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between">
                                        <CardTitle className="flex items-center">
                                            <CreditCard className="mr-2 h-5 w-5 text-blue-600" />
                                            Check Requisitions ({check_requisitions.length})
                                        </CardTitle>
                                        {(invoice.invoice_status === 'approved' && check_requisitions.length > 0) && (
                                            <div>
                                                <Button onClick={() => setShowCreateReqDialog(true)}>
                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                    Create Check Requisition
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {check_requisitions.length > 0 ? (
                                        <div className="space-y-4">
                                            {check_requisitions.map((cr) => (
                                                <div key={cr.id} className="rounded-lg border p-4">
                                                    <div className="mb-3 flex items-start justify-between">
                                                        <div>
                                                            <div className="font-semibold text-slate-900">{cr.requisition_number}</div>
                                                            <div className="text-sm text-slate-600">{formatDate(cr.request_date)}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold text-green-600">{formatCurrency(cr.php_amount)}</div>
                                                            <Badge className={cn('text-xs', getStatusColor(cr.requisition_status))}>
                                                                {cr.requisition_status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <div>
                                                            <div className="text-slate-500">Payee: {cr.payee_name}</div>
                                                            <div className="text-slate-500">Purpose: {cr.purpose}</div>
                                                        </div>
                                                        <Link href={`/check-requisitions/${cr.id}`}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="mr-1 h-3 w-3" />
                                                                View
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center">
                                            <CreditCard className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                                            <div className="mb-4 text-slate-500">No check requisitions created yet</div>
                                            {invoice.invoice_status === 'approved' ? (
                                                <Button onClick={() => setShowCreateReqDialog(true)}>
                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                    Create Check Requisition
                                                </Button>
                                            ) : (
                                                <div className="text-center text-slate-500">
                                                    <div className="text-sm">Invoice must be approved before creating check requisitions</div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Remarks Tab */}
                        <TabsContent value="remarks">
                            <Remarks remarks={remarks} remarkableType={"Invoice"} remarkableId={invoice.id} />
                        </TabsContent>

                        {/* Review Tab */}
                        <TabsContent value="review">
                            <InvoiceReview
                                invoice={invoice}
                                canReviewInvoice={canReviewInvoice}
                                isAlreadyReviewed={isAlreadyReviewed}
                                activityLogs={activity_logs}
                                onTabChange={setTab}
                            />
                        </TabsContent>

                        {/* Timeline Tab */}
                        <TabsContent value="timeline">
                            <ActivityTimeline activity_logs={activity_logs} title={"Invoice Timeline"} entityType={"Invoice"} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Create Check Requisition Dialog */}
            <CreateCheckRequisitionDialog
                invoice={invoice}
                isOpen={showCreateReqDialog}
                onClose={() => setShowCreateReqDialog(false)}
                onSuccess={() => {
                    // Optionally refresh the page or update state
                    // window.location.reload();
                }}
            />
        </>
    );
};

const CreateCheckRequisitionDialog = ({ invoice, isOpen, onClose, onSuccess }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        invoice_id: invoice.id,
        php_amount: invoice.net_amount || invoice.invoice_amount,
        payee_name: invoice.purchase_order?.vendor?.name || '',
        purpose: `Payment for Invoice ${invoice.si_number}`,
        po_number: invoice.purchase_order?.po_number || '',
        cer_number: invoice.purchase_order?.project?.cer_number || '',
        si_number: invoice.si_number,
        requested_by: '', // will be filled by current user on backend
        account_charge: '',
        service_line_dist: '',
        amount_in_words: numberToWords.toWords(invoice.invoice_amount) + ' pesos only',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        post('/check-requisitions', {
            onSuccess: () => {
                toast.success('Check Requisition created successfully!');
                reset();
                onClose();
                if (onSuccess) onSuccess();
            },
            onError: () => {
                toast.error('Failed to create check requisition');
            }
        });
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₱0.00';
        return `₱${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Check Requisition</DialogTitle>
                    <DialogDescription>
                        Create a check requisition for Invoice #{invoice.si_number}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Amount and Payee */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="php_amount">Amount *</Label>
                            <Input
                                id="php_amount"
                                type="number"
                                step="0.01"
                                value={data.php_amount}
                                onChange={(e) => {
                                    setData('php_amount', e.target.value)
                                    setData('amount_in_words', e.target.value ? numberToWords.toWords(e.target.value) + ' pesos only' : '')
                                }}
                                className="w-full rounded-md border border-slate-300 px-3 py-2"
                                required
                            />
                            <div className="text-xs text-slate-500">
                                Invoice Amount: {formatCurrency(invoice.invoice_amount)}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="payee_name">Payee Name *</Label>
                            <Input
                                id="payee_name"
                                type="text"
                                value={data.payee_name}
                                onChange={(e) => setData('payee_name', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2"
                                required
                            />
                        </div>
                    </div>

                    {/* Purpose and Payment For */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="purpose">Purpose *</Label>
                            <Textarea
                                id="purpose"
                                type="text"
                                value={data.purpose}
                                onChange={(e) => setData('purpose', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2"
                                required
                            />
                        </div>
                    </div>

                    {/* Reference Numbers */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="po_number">PO Number</Label>
                            <Input
                                id="po_number"
                                type="text"
                                value={data.po_number}
                                onChange={(e) => setData('po_number', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2"
                                readOnly
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cer_number">CER Number</Label>
                            <Input
                                id="cer_number"
                                type="text"
                                value={data.cer_number}
                                onChange={(e) => setData('cer_number', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2"
                                readOnly
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="si_number">SI Number</Label>
                            <Input
                                id="si_number"
                                type="text"
                                value={data.si_number}
                                onChange={(e) => setData('si_number', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2"
                                readOnly
                            />
                        </div>
                    </div>

                    {/* Account Details */}
                    <div className="grid grid-cols-1  gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="account_charge">Account Charge</Label>
                            <Input
                                id="account_charge"
                                type="text"
                                value={data.account_charge}
                                onChange={(e) => setData('account_charge', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* Service Line Distribution and Amount in Words */}
                    <div className="space-y-2">
                        <Label htmlFor="service_line_dist">Service Line Distribution</Label>
                        <Input
                            id="service_line_dist"
                            type="text"
                            value={data.service_line_dist}
                            onChange={(e) => setData('service_line_dist', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount_in_words">Amount in Words</Label>
                        <Textarea
                            id="amount_in_words"
                            type="text"
                            value={data.amount_in_words}
                            onChange={(e) => setData('amount_in_words', e.target.value)}
                            placeholder="e.g., One Thousand Five Hundred Pesos Only"
                            className="w-full rounded-md border border-slate-300 px-3 py-2 capitalize"
                        />
                    </div>


                    {/* Form Actions */}
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Create Requisition
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};


export default ShowInvoice;

