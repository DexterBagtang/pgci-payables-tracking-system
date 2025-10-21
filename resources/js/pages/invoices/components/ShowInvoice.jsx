import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Link, usePage, useRemember } from '@inertiajs/react';
import { format } from 'date-fns';

import {
    Building2,
    CreditCard,
    Edit,
    Eye,
    FileText,
    Folder,
} from 'lucide-react';
import { useCallback, useMemo } from 'react';
import ActivityTimeline from '@/components/custom/ActivityTimeline.jsx';
import AttachmentViewer from '@/pages/invoices/components/AttachmentViewer.jsx';
import Remarks from '@/components/custom/Remarks.jsx';
import InvoiceReview from '@/pages/invoices/components/InvoiceReview.jsx';
import BackButton from '@/components/custom/BackButton.jsx';
import StatusBadge, { OverdueBadge } from '@/components/custom/StatusBadge.jsx';
import InvoiceDetailsTab from '@/pages/invoices/components/InvoiceDetailsTab.jsx';

const ShowInvoice = ({ invoice }) => {
    const {
        purchase_order: po,
        files = [],
        check_requisitions = [],
        activity_logs,
        remarks = [],
    } = invoice;

    const project = po?.project;
    const vendor = po?.vendor;
    const po_files = po?.files;
    const attachments = [...po_files, ...files];
    const { user } = usePage().props.auth;

    const [tab, setTab] = useRemember('details', 'invoice-detail-tab');

    // Memoized helper functions
    const formatCurrency = useCallback((amount) => {
        if (!amount) return '₱0.00';
        return `₱${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }, []);

    const formatDate = useCallback((date) => {
        if (!date) return 'Not set';
        return format(new Date(date), 'MMM dd, yyyy');
    }, []);

    const getDaysOverdue = useCallback(() => {
        if (!invoice.due_date || invoice.invoice_status === 'paid') return null;
        const today = new Date();
        const dueDate = new Date(invoice.due_date);
        const diffTime = today - dueDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : null;
    }, [invoice.due_date, invoice.invoice_status]);

    const daysOverdue = useMemo(() => getDaysOverdue(), [getDaysOverdue]);
    const canReviewInvoice = true;
    const isAlreadyReviewed = invoice.invoice_status === 'approved';

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="container mx-auto max-w-7xl space-y-6 p-6">
                    {/* Compact Header */}
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-2xl font-bold text-slate-900">Invoice #{invoice.si_number}</h1>
                                    <StatusBadge status={invoice.invoice_status} showIcon size="lg" />
                                    {daysOverdue && <OverdueBadge daysOverdue={daysOverdue} size="default" />}
                                </div>
                                <div className="text-sm text-slate-600">
                                    Created {formatDate(invoice.created_at)} • Due {formatDate(invoice.due_date)}
                                </div>
                            </div>

                            <div className="flex flex-shrink-0 gap-2">
                                <Link href={`/invoices/${invoice.id}/edit`} prefetch>
                                    <Button variant="outline" size="sm">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Button>
                                </Link>
                                <BackButton />
                            </div>
                        </div>

                        {/* Key Information Grid */}
                        <div className="mt-6 grid grid-cols-1 gap-6 border-t pt-6 md:grid-cols-2 xl:grid-cols-4">
                            <div className="text-center">
                                <div className="mb-1 text-3xl font-bold text-green-600">{formatCurrency(invoice.invoice_amount)}</div>
                                <div className="text-sm text-slate-500">Invoice Amount</div>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center">
                                    <Building2 className="mr-2 h-4 w-4 text-orange-600" />
                                    <span className="text-sm font-medium text-slate-700">Vendor</span>
                                </div>
                                <div className="truncate font-semibold text-slate-900">{vendor?.name || 'No Vendor'}</div>
                                <div className="truncate text-sm text-slate-600">{vendor?.category || ''}</div>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center">
                                    <Folder className="mr-2 h-4 w-4 text-purple-600" />
                                    <span className="text-sm font-medium text-slate-700">Project</span>
                                </div>
                                <div className="text-wrap font-semibold text-slate-900">{project?.project_title || 'No Project'}</div>
                                <div className="font-mono text-sm text-slate-600">CER: {project?.cer_number || 'N/A'}</div>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center">
                                    <FileText className="mr-2 h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-slate-700">Purchase Order</span>
                                </div>
                                <div className="font-semibold text-slate-900">{po?.po_number || 'No PO'}</div>
                                <div className="text-sm text-slate-600">
                                    {formatCurrency(po?.po_amount)} • <StatusBadge status={po?.po_status} size="xs" />
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

                        {/* Details Tab */}
                        <TabsContent value="details">
                            <InvoiceDetailsTab invoice={invoice} formatCurrency={formatCurrency} formatDate={formatDate} />
                        </TabsContent>

                        {/* Files Tab */}
                        <TabsContent value="files">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <FileText className="mr-2 h-5 w-5 text-blue-600" />
                                        Attached Files ({attachments.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <AttachmentViewer files={attachments} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Requisitions Tab */}
                        <TabsContent value="requisitions">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between">
                                        <CardTitle className="flex items-center">
                                            <CreditCard className="mr-2 h-5 w-5 text-blue-600" />
                                            Check Requisitions ({check_requisitions.length})
                                        </CardTitle>
                                        {invoice.invoice_status === 'approved' && (
                                            <Link href="/check-requisition/create" data={{ invoice_id: invoice.id }}>
                                                <Button>
                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                    Create Check Requisition
                                                </Button>
                                            </Link>
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
                                                            <StatusBadge status={cr.requisition_status} size="sm" showIcon />
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
                                                <Link href="/check-requisition/create" data={{ invoice_id: invoice.id }}>
                                                    <Button>
                                                        <CreditCard className="mr-2 h-4 w-4" />
                                                        Create Check Requisition
                                                    </Button>
                                                </Link>
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
                            <Remarks remarks={remarks} remarkableType={'Invoice'} remarkableId={invoice.id} />
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
                            <ActivityTimeline activity_logs={activity_logs} title={'Invoice Timeline'} entityType={'Invoice'} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
};

export default ShowInvoice;
