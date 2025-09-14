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
import {
    ArrowLeft,
    Building2,
    CheckCircle,
    Clock,
    CreditCard,
    Download,
    Edit,
    FileIcon,
    FileText,
    Folder,
    Info,
    Package,
    Receipt,
    Truck,
    User,
    Eye,
    DollarSign,

} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input.js';
import { formatFileSize, getFileIcon } from '@/components/custom/helpers.jsx';
import EditPOForm from '@/pages/purchase-orders/components/EditPOForm.jsx';
import ActivityTimeline from '@/components/custom/ActivityTimeline.jsx';
import AttachmentsCard from '@/components/custom/AttachmentsCard.jsx';

export default function ShowPO({ purchaseOrder, vendors, projects , backUrl}) {
    const [isEditing, setIsEditing] = useState(false);
    const [tab, setTab] = useState('overview');
    const [showCreateReqDialog, setShowCreateReqDialog] = useState(false);
    const { user } = usePage().props.auth;

    const {files,activity_logs,invoices} = purchaseOrder;

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

    // Get status badge color
    const getStatusColor = (status) => {
        const statusColors = {
            draft: 'bg-gray-100 text-gray-800 border-gray-200',
            open: 'bg-blue-100 text-blue-800 border-blue-200',
            closed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200',
        };
        return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    // Calculate completion percentage based on invoices
    const calculateCompletionPercentage = () => {
        if (!purchaseOrder.invoices || purchaseOrder.invoices.length === 0) return 0;
        const totalAmount = parseFloat(purchaseOrder.po_amount) || 0;
        if (totalAmount === 0) return 0;
        const paidAmount = purchaseOrder.invoices.reduce((sum, invoice) => {
            if (invoice.invoice_status === 'paid') {
                return sum + (parseFloat(invoice.net_amount) || 0);
            }
            return sum;
        }, 0);
        return Math.min(100, Math.round((paidAmount / totalAmount) * 100));
    };

    const completionPercentage = calculateCompletionPercentage();
    const vatExAmount = (parseFloat(purchaseOrder.po_amount) || 0) / 1.12;
    const vatAmount = ((parseFloat(purchaseOrder.po_amount) || 0) * 0.12) / 1.12;

    // Handle edit form submission
    const handleEditSubmit = () => {
        // In a real app, this would trigger the edit form submission logic
        // For now, we just close the editor
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="container mx-auto max-w-7xl p-6">
                    <EditPOForm
                        purchaseOrder={purchaseOrder}
                        vendors={vendors}
                        projects={projects}
                        onCancel={() => setIsEditing(false)}
                        onSuccess={() => handleEditSubmit()}
                    />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="container mx-auto max-w-7xl space-y-6 p-6">
                    {/* Compact Header with Key Info */}
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            {/* PO Title & Status */}
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-2xl font-bold text-slate-900">Purchase Order #{purchaseOrder.po_number}</h1>
                                    <Badge className={cn('px-3 py-1', getStatusColor(purchaseOrder.po_status))}>
                                        {purchaseOrder.po_status || 'Draft'}
                                    </Badge>
                                </div>
                                <div className="text-sm text-slate-600">
                                    Created {formatDate(purchaseOrder.created_at)} • PO Date {formatDate(purchaseOrder.po_date)}
                                </div>
                            </div>
                            {/* Action Buttons */}
                            <div className="flex flex-shrink-0 gap-2">
                                <Link href={backUrl}>
                                    <Button variant="outline" size="sm">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back
                                    </Button>
                                </Link>
                                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                            </div>
                        </div>
                        {/* Key Information Grid */}
                        <div className="mt-6 grid grid-cols-1 gap-6 border-t pt-6 md:grid-cols-2 xl:grid-cols-4">
                            {/* Amount */}
                            <div className="text-center">
                                <div className="mb-1 text-3xl font-bold text-green-600">{formatCurrency(purchaseOrder.po_amount)}</div>
                                <div className="text-sm text-slate-500">Total Amount</div>
                                <div className="mt-1 text-xs text-slate-400">VAT Ex: {formatCurrency(vatExAmount)}</div>
                                <div className="text-xs text-slate-400">VAT (12%): {formatCurrency(vatAmount)}</div>
                            </div>
                            {/* Vendor */}
                            <div>
                                <div className="mb-2 flex items-center">
                                    <User className="mr-2 h-4 w-4 text-orange-600" />
                                    <span className="text-sm font-medium text-slate-700">Vendor</span>
                                </div>
                                <div className="truncate font-semibold text-slate-900">{purchaseOrder.vendor?.name || 'No Vendor'}</div>
                                <div className="truncate text-sm text-slate-600">{purchaseOrder.vendor?.category || ''}</div>
                            </div>
                            {/* Project */}
                            <div>
                                <div className="mb-2 flex items-center">
                                    <Folder className="mr-2 h-4 w-4 text-purple-600" />
                                    <span className="text-sm font-medium text-slate-700">Project</span>
                                </div>
                                <div className="text-wrap font-semibold text-slate-900">{purchaseOrder.project?.project_title || 'No Project'}</div>
                                <div className="font-mono text-sm text-slate-600">
                                    {purchaseOrder.project?.cer_number ? `CER: ${purchaseOrder.project.cer_number}` : 'N/A'}
                                </div>
                            </div>
                            {/* Completion */}
                            <div>
                                <div className="mb-2 flex items-center">
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-slate-700">Completion</span>
                                </div>
                                <div className="text-2xl font-bold text-green-600">{completionPercentage}%</div>
                                <div className="text-sm text-slate-600">{purchaseOrder.invoices?.length || 0} invoice(s)</div>
                                <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200">
                                    <div
                                        className="h-1.5 rounded-full bg-green-600 transition-all duration-300"
                                        style={{ width: `${completionPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabbed Content */}
                    <Tabs value={tab} onValueChange={setTab} className="space-y-4">
                        <TabsList className="grid w-full grid-cols-1 md:grid-cols-5">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="financial">Financial</TabsTrigger>
                            <TabsTrigger value="invoices">Invoices ({purchaseOrder.invoices?.length || 0})</TabsTrigger>
                            <TabsTrigger value="attachments">Attachments ({purchaseOrder.files?.length || 0})</TabsTrigger>
                            <TabsTrigger value="timeline">Activity Logs</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Main PO Details */}
                                <Card>
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center text-lg">
                                            <FileText className="mr-2 h-5 w-5 text-blue-600" />
                                            Purchase Order Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {purchaseOrder.description && (
                                            <div className="border-b pb-4">
                                                <div className="mb-2 text-sm font-medium text-slate-700">Description</div>
                                                <div className="rounded bg-slate-50 p-3 text-sm text-slate-700">{purchaseOrder.description}</div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 gap-4 text-sm">
                                            <div>
                                                <div className="text-slate-500">PO Number</div>
                                                <div className="font-medium">{purchaseOrder.po_number || 'N/A'}</div>
                                            </div>
                                            <div>
                                                <div className="text-slate-500">PO Date</div>
                                                <div className="font-medium">{formatDate(purchaseOrder.po_date)}</div>
                                            </div>
                                            <div>
                                                <div className="text-slate-500">Status</div>
                                                <Badge variant={purchaseOrder.po_status === 'closed' ? 'outline' : 'secondary'}>{purchaseOrder.po_status}</Badge>
                                            </div>
                                            {purchaseOrder.expected_delivery_date && (
                                                <div>
                                                    <div className="text-slate-500">Expected Delivery</div>
                                                    <div className="font-medium">{formatDate(purchaseOrder.expected_delivery_date)}</div>
                                                </div>
                                            )}
                                            {purchaseOrder.payment_term && (
                                                <div>
                                                    <div className="text-slate-500">Payment Terms</div>
                                                    <div className="font-medium">{purchaseOrder.payment_term}</div>
                                                </div>
                                            )}
                                        </div>
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
                                        {purchaseOrder.vendor && (
                                            <div>
                                                <div className="mb-3 flex items-center justify-between">
                                                    <h4 className="font-medium text-slate-800">Vendor Information</h4>
                                                    <Link href={`/vendors/${purchaseOrder.vendor.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="mr-1 h-3 w-3" />
                                                            View
                                                        </Button>
                                                    </Link>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Name:</span>
                                                        <span className="font-medium">{purchaseOrder.vendor.name}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Category:</span>
                                                        <span className="font-medium">{purchaseOrder.vendor.category}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Contact:</span>
                                                        <span className="text-right font-medium">
                                                            {purchaseOrder.vendor.email && <div>{purchaseOrder.vendor.email}</div>}
                                                            {purchaseOrder.vendor.phone && <div>{purchaseOrder.vendor.phone}</div>}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Project Details */}
                                        {purchaseOrder.project && (
                                            <div className="border-t pt-4">
                                                <div className="mb-3 flex items-center justify-between">
                                                    <h4 className="font-medium text-slate-800">Project Information</h4>
                                                    <Link href={`/projects/${purchaseOrder.project.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="mr-1 h-3 w-3" />
                                                            View
                                                        </Button>
                                                    </Link>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Title:</span>
                                                        <span className="max-w-[200px] truncate text-right font-medium">{purchaseOrder.project.project_title}</span>
                                                    </div>
                                                    {purchaseOrder.project.cer_number && (
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-500">CER Number:</span>
                                                            <span className="font-mono font-medium">{purchaseOrder.project.cer_number}</span>
                                                        </div>
                                                    )}
                                                    {purchaseOrder.project.smpo_number && (
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-500">SMPO Number:</span>
                                                            <span className="font-mono font-medium">{purchaseOrder.project.smpo_number}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Type:</span>
                                                        <span className="font-medium capitalize">
                                                            {purchaseOrder.project.project_type?.replace('_', ' ') || 'Not specified'}
                                                        </span>
                                                    </div>
                                                    {purchaseOrder.project.project_type === 'philcom_project' && purchaseOrder.project.philcom_category && (
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-500">Philcom Category:</span>
                                                            <span className="font-medium capitalize">
                                                                {purchaseOrder.project.philcom_category.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Total Project Cost:</span>
                                                        <span className="font-medium capitalize">
                                                            {formatCurrency(purchaseOrder.project.total_project_cost) || 'Not specified'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Additional Details */}
                                        {(purchaseOrder.expected_delivery_date || purchaseOrder.payment_term) && (
                                            <div className="border-t pt-4">
                                                <h4 className="mb-3 font-medium text-slate-800">Additional Details</h4>
                                                <div className="space-y-2 text-sm">
                                                    {purchaseOrder.expected_delivery_date && (
                                                        <div className="flex items-center gap-2">
                                                            <Truck className="h-4 w-4 text-orange-600" />
                                                            <span>Expected Delivery: {formatDate(purchaseOrder.expected_delivery_date)}</span>
                                                        </div>
                                                    )}
                                                    {purchaseOrder.payment_term && (
                                                        <div className="flex items-center gap-2">
                                                            <CreditCard className="h-4 w-4 text-purple-600" />
                                                            <span>Payment Terms: {purchaseOrder.payment_term}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Financial Tab */}
                        <TabsContent value="financial" className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Detailed Breakdown */}
                                <Card>
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center text-lg">
                                            <DollarSign className="mr-2 h-5 w-5 text-green-600" />
                                            Financial Breakdown
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-slate-500">Subtotal (VAT Excluded)</span>
                                                <span className="font-medium">{formatCurrency(vatExAmount)}</span>
                                            </div>
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-slate-500">VAT (12%)</span>
                                                <span className="font-medium">{formatCurrency(vatAmount)}</span>
                                            </div>
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-slate-500">Total PO Amount</span>
                                                <span className="font-bold text-green-600">{formatCurrency(purchaseOrder.po_amount)}</span>
                                            </div>
                                        </div>

                                        {/* Payment Status */}
                                        <div className="pt-4 border-t">
                                            <h4 className="mb-3 font-medium text-slate-800">Payment Status</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Paid Amount:</span>
                                                    <span className="font-medium text-green-600">
                                                        {formatCurrency(
                                                            purchaseOrder.invoices?.reduce((sum, invoice) => {
                                                                if (invoice.invoice_status === 'paid') {
                                                                    return sum + (parseFloat(invoice.net_amount) || 0);
                                                                }
                                                                return sum;
                                                            }, 0) || 0
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Remaining Balance:</span>
                                                    <span className="font-medium text-orange-600">
                                                        {formatCurrency(
                                                            parseFloat(purchaseOrder.po_amount) -
                                                            (purchaseOrder.invoices?.reduce((sum, invoice) => {
                                                                if (invoice.invoice_status === 'paid') {
                                                                    return sum + (parseFloat(invoice.net_amount) || 0);
                                                                }
                                                                return sum;
                                                            }, 0) || 0)
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between border-t pt-2">
                                                    <span className="text-slate-500">Completion:</span>
                                                    <span className="font-bold text-green-600">{completionPercentage}%</span>
                                                </div>
                                            </div>
                                            <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200">
                                                <div
                                                    className="h-1.5 rounded-full bg-green-600 transition-all duration-300"
                                                    style={{ width: `${completionPercentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Completion Summary */}
                                <Card>
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center text-lg">
                                            <CheckCircle className="mr-2 h-5 w-5 text-blue-600" />
                                            Completion Status
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-green-600">{completionPercentage}%</div>
                                            <div className="text-sm text-slate-600 mt-1">of PO Completed</div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600">Invoices Received</span>
                                                <span className="font-medium">{purchaseOrder.invoices?.length || 0}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600">Invoices Paid</span>
                                                <span className="font-medium text-green-600">
                                                    {purchaseOrder.invoices?.filter(inv => inv.invoice_status === 'paid').length || 0}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600">Invoices Pending</span>
                                                <span className="font-medium text-yellow-600">
                                                    {purchaseOrder.invoices?.filter(inv => inv.invoice_status !== 'paid' && inv.invoice_status !== 'cancelled').length || 0}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="pt-4">
                                            <Button variant="outline" size="sm" className="w-full" onClick={() => setTab('invoices')}>
                                                View All Invoices
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Invoices Tab */}
                        <TabsContent value="invoices" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Receipt className="mr-2 h-5 w-5 text-blue-600" />
                                        Invoices ({purchaseOrder.invoices?.length || 0})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {purchaseOrder.invoices && purchaseOrder.invoices.length > 0 ? (
                                        <div className="space-y-4">
                                            {purchaseOrder.invoices.map((invoice) => (
                                                <div key={invoice.id} className="rounded-lg border p-4 hover:shadow-md transition-shadow">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex flex-col">
                                                            <div className="font-semibold text-slate-900">SI #{invoice.si_number}</div>
                                                            <div className="text-sm text-slate-600">{formatDate(invoice.si_date)}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <Badge className={cn('px-2 py-1 text-xs', getStatusColor(invoice.invoice_status))}>
                                                                {invoice.invoice_status || 'Pending'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                                        <div>
                                                            <div className="text-slate-500">Amount</div>
                                                            <div className="font-medium">{formatCurrency(invoice.invoice_amount)}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-slate-500">Net Amount</div>
                                                            <div className="font-medium">{formatCurrency(invoice.net_amount)}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex gap-2">
                                                            {invoice.due_date && (
                                                                <div>
                                                                    <div className="text-slate-500">Due</div>
                                                                    <div className="font-medium">{formatDate(invoice.due_date)}</div>
                                                                </div>
                                                            )}
                                                            {invoice.submitted_to && (
                                                                <div>
                                                                    <div className="text-slate-500">Submitted To</div>
                                                                    <div className="font-medium">{invoice.submitted_to}</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Link href={`/invoices/${invoice.id}`} className="text-xs text-blue-600 hover:text-blue-800">
                                                            View Details
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-slate-500">
                                            <Receipt className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                                            <div>No invoices linked to this PO</div>
                                            <p className="text-sm mt-2">Invoices will appear here once they are created and associated.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Attachments Tab */}
                        <TabsContent value="attachments" className="space-y-6">
                            <AttachmentsCard files={files} />
                        </TabsContent>

                        {/* Audit Trail Tab */}
                        <TabsContent value="timeline" className="space-y-6">
                            <ActivityTimeline activity_logs={activity_logs} title={"Purchase Order Timeline"} entityType={"Purchase Order"} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
}
