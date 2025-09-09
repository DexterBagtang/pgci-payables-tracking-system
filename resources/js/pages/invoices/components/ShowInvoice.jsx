import React, { useState } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    CalendarIcon,
    FileText,
    DollarSign,
    Building2,
    AlertCircle,
    ArrowLeft,
    Download,
    Edit,
    Eye,
    MapPin,
    Phone,
    Mail,
    Calendar,
    Clock,
    User,
    FileIcon,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Paperclip,
    Receipt,
    CreditCard,
    Building,
    Folder,
    Info,
    ClipboardCheck,
    Send
} from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Checkbox } from '@/components/ui/checkbox.js';
import { Label } from '@/components/ui/label.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.js';
import { Textarea } from '@/components/ui/textarea.js';
import { toast } from 'sonner';

const ShowInvoice = ({ invoice }) => {

    // Destructure related data from invoice object
    const {
        purchase_order: po,
        files = [],
        invoice_remarks = [],
        created_by: creator,
        check_requisitions = [],
        reviews = [] ,
    } = invoice;

    console.log(reviews);

    const project = po?.project;
    const vendor = po?.vendor;

    const {user} = usePage().props.auth;

    // Helper function to get status color
    const getStatusColor = (status) => {
        const statusColors = {
            'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'paid': 'bg-green-100 text-green-800 border-green-200',
            'overdue': 'bg-red-100 text-red-800 border-red-200',
            'processing': 'bg-blue-100 text-blue-800 border-blue-200',
            'cancelled': 'bg-gray-100 text-gray-800 border-gray-200'
        };
        return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    // Helper function to format currency
    const formatCurrency = (amount) => {
        if (!amount) return '₱0.00';
        return `₱${Number(amount).toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    };

    // Helper function to format date
    const formatDate = (date) => {
        if (!date) return 'Not set';
        return format(new Date(date), "MMM dd, yyyy");
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
    const isAlreadyReviewed = invoice.invoice_status !== 'received';
//     const isAlreadyReviewed = false;


    const { data, setData, post, processing, errors, reset } = useForm({
        physicalFilesReceived: false,
        approvalStatus: '',
        remarks: ''
    });

// Handle review form submission
    const handleReviewSubmit =  (id,e) => {
        e.preventDefault();

        post(`/invoices/${id}/review`,{
            onSuccess: () => {
                toast.success('Reviewed Successfully!');
            },
            onError: (e) => {
                alert(e.message)
            }
        })
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container max-w-7xl mx-auto p-6 space-y-6">
                {/* Compact Header with Key Info */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                        {/* Invoice Title & Status */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl font-bold text-slate-900">
                                    Invoice #{invoice.si_number}
                                </h1>
                                <Badge className={cn("px-3 py-1", getStatusColor(invoice.invoice_status))}>
                                    {invoice.invoice_status || 'Pending'}
                                </Badge>
                                {daysOverdue && (
                                    <Badge className="bg-red-100 text-red-800 border-red-200 px-3 py-1">
                                        {daysOverdue} days overdue
                                    </Badge>
                                )}
                            </div>
                            <div className="text-sm text-slate-600">
                                Created {formatDate(invoice.created_at)} • Due {formatDate(invoice.due_date)}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 flex-shrink-0">
                            <Link href={`/invoices/${invoice.id}/edit`} prefetch>
                                <Button variant="outline" size="sm">
                                    <Edit className="w-4 h-4 mr-2"/>
                                    Edit
                                </Button>
                            </Link>
                            <Link href="/invoices" prefetch>
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2"/>
                                    Back
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Key Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-6 pt-6 border-t">
                        {/* Amount */}
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600 mb-1">
                                {formatCurrency(invoice.invoice_amount)}
                            </div>
                            <div className="text-sm text-slate-500">Invoice Amount</div>
                            {invoice.net_amount !== invoice.invoice_amount && (
                                <div className="text-xs text-slate-400 mt-1">
                                    Net: {formatCurrency(invoice.net_amount)}
                                </div>
                            )}
                        </div>

                        {/* Vendor */}
                        <div>
                            <div className="flex items-center mb-2">
                                <Building2 className="w-4 h-4 mr-2 text-orange-600"/>
                                <span className="text-sm font-medium text-slate-700">Vendor</span>
                            </div>
                            <div className="font-semibold text-slate-900 truncate">
                                {vendor?.name || 'No Vendor'}
                            </div>
                            <div className="text-sm text-slate-600 truncate">
                                {vendor?.category || ''}
                            </div>
                            {vendor && (
                                <Link href={`/vendors/${vendor.id}`}
                                      className="text-xs text-blue-600 hover:text-blue-800">
                                    View Details
                                </Link>
                            )}
                        </div>

                        {/* Project */}
                        <div>
                            <div className="flex items-center mb-2">
                                <Folder className="w-4 h-4 mr-2 text-purple-600"/>
                                <span className="text-sm font-medium text-slate-700">Project</span>
                            </div>
                            <div className="font-semibold text-slate-900 truncate">
                                {project?.project_title || 'No Project'}
                            </div>
                            <div className="text-sm text-slate-600 font-mono">
                                CER: {project?.cer_number || 'N/A'}
                            </div>
                            {project && (
                                <Link href={`/projects/${project.id}`}
                                      className="text-xs text-blue-600 hover:text-blue-800">
                                    View Details
                                </Link>
                            )}
                        </div>

                        {/* Purchase Order */}
                        <div>
                            <div className="flex items-center mb-2">
                                <FileText className="w-4 h-4 mr-2 text-green-600"/>
                                <span className="text-sm font-medium text-slate-700">Purchase Order</span>
                            </div>
                            <div className="font-semibold text-slate-900">
                                {po?.po_number || 'No PO'}
                            </div>
                            <div className="text-sm text-slate-600">
                                {formatCurrency(po?.po_amount)} • {po?.po_status}
                            </div>
                            {po && (
                                <Link href={`/purchase-orders/${po.id}`}
                                      className="text-xs text-blue-600 hover:text-blue-800">
                                    View Details
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabbed Content */}
                <Tabs defaultValue="details" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="files">Files ({files.length})</TabsTrigger>
                        <TabsTrigger value="requisitions">Requisitions ({check_requisitions.length})</TabsTrigger>
                        <TabsTrigger value="remarks">Remarks ({invoice_remarks.length})</TabsTrigger>
                        <TabsTrigger value="review">Review</TabsTrigger>
                        <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    </TabsList>

                    {/* Invoice Details Tab */}
                    <TabsContent value="details" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Invoice Information */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center text-lg">
                                        <Receipt className="w-5 h-5 mr-2 text-blue-600"/>
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
                                        <div className="text-sm font-medium text-slate-700 mb-3">Amount Breakdown</div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Invoice Amount:</span>
                                                <span
                                                    className="font-medium">{formatCurrency(invoice.invoice_amount)}</span>
                                            </div>
                                            {invoice.tax_amount > 0 && (
                                                <div className="flex justify-between">
                                                    <span>Tax Amount:</span>
                                                    <span
                                                        className="font-medium">{formatCurrency(invoice.tax_amount)}</span>
                                                </div>
                                            )}
                                            {invoice.discount_amount > 0 && (
                                                <div className="flex justify-between text-green-600">
                                                    <span>Discount:</span>
                                                    <span
                                                        className="font-medium">-{formatCurrency(invoice.discount_amount)}</span>
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
                                            <div className="text-sm font-medium text-slate-700 mb-2">Notes</div>
                                            <div className="bg-slate-50 p-3 rounded text-sm text-slate-700">
                                                {invoice.notes}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Related Information */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center text-lg">
                                        <Info className="w-5 h-5 mr-2 text-indigo-600"/>
                                        Related Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Vendor Details */}
                                    {vendor && (
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-medium text-slate-800">Vendor Information</h4>
                                                <Link href={`/vendors/${vendor.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="w-3 h-3 mr-1"/>
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
                                                    <span
                                                        className="font-medium">{vendor.payment_terms || 'Not specified'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Contact:</span>
                                                    <span className="font-medium text-right">
                                                        {vendor.email && (
                                                            <div>{vendor.email}</div>
                                                        )}
                                                        {vendor.phone && (
                                                            <div>{vendor.phone}</div>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Project Details */}
                                    {project && (
                                        <div className="border-t pt-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-medium text-slate-800">Project Information</h4>
                                                <Link href={`/projects/${project.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="w-3 h-3 mr-1"/>
                                                        View
                                                    </Button>
                                                </Link>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Title:</span>
                                                    <span className="font-medium text-right max-w-[200px] truncate">
                                                        {project.project_title}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">CER Number:</span>
                                                    <span className="font-medium font-mono">{project.cer_number}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Project Cost:</span>
                                                    <span
                                                        className="font-medium">{formatCurrency(project.total_project_cost)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Status:</span>
                                                    <Badge className="text-xs capitalize">
                                                        {project.project_status?.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* PO Comparison */}
                                    {po && (
                                        <div className="border-t pt-4">
                                            <h4 className="font-medium text-slate-800 mb-3">PO vs Invoice</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">PO Amount:</span>
                                                    <span className="font-medium">{formatCurrency(po.po_amount)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Invoice Amount:</span>
                                                    <span
                                                        className="font-medium">{formatCurrency(invoice.invoice_amount)}</span>
                                                </div>
                                                <div className="flex justify-between border-t pt-2">
                                                    <span className="text-slate-500">Remaining:</span>
                                                    <span className={cn(
                                                        "font-medium",
                                                        (po.po_amount - invoice.invoice_amount) >= 0
                                                            ? "text-green-600"
                                                            : "text-red-600"
                                                    )}>
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
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Paperclip className="w-5 h-5 mr-2 text-indigo-600"/>
                                    Attachments ({files.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {files.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {files.map((file) => (
                                            <div key={file.id}
                                                 className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-start justify-between mb-2">
                                                    <FileIcon className="w-8 h-8 text-slate-400 flex-shrink-0"/>
                                                    <div className="flex gap-1">
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    <Eye className="w-4 h-4"/>
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>{file.file_name}</DialogTitle>
                                                                    <DialogDescription>
                                                                        {file.file_category} • {(file.file_size / 1024 / 1024).toFixed(2)} MB
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <div className="space-y-4">
                                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                                        <div>
                                                                            <div className="text-slate-500">Type</div>
                                                                            <div
                                                                                className="font-medium">{file.file_type}</div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-slate-500">Purpose
                                                                            </div>
                                                                            <div
                                                                                className="font-medium">{file.file_purpose || 'Not specified'}</div>
                                                                        </div>
                                                                    </div>
                                                                    {file.description && (
                                                                        <div>
                                                                            <div
                                                                                className="text-slate-500 text-sm mb-1">Description
                                                                            </div>
                                                                            <div
                                                                                className="bg-slate-50 p-3 rounded text-sm">{file.description}</div>
                                                                        </div>
                                                                    )}
                                                                    <Button
                                                                        onClick={() => window.open(`/storage/${file.file_path}`, '_blank')}
                                                                        className="w-full"
                                                                    >
                                                                        <Download className="w-4 h-4 mr-2"/>
                                                                        Download
                                                                    </Button>
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => window.open(`/storage/${file.file_path}`, '_blank')}
                                                        >
                                                            <Download className="w-4 h-4"/>
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="font-medium text-sm truncate">{file.file_name}</div>
                                                    <div className="text-xs text-slate-500">
                                                        {(file.file_size / 1024 / 1024).toFixed(2)} MB
                                                    </div>
                                                    {file.file_category && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {file.file_category}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-500">
                                        <FileIcon className="w-12 h-12 mx-auto mb-3 text-slate-300"/>
                                        <div>No attachments found</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Check Requisitions Tab */}
                    <TabsContent value="requisitions">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <CreditCard className="w-5 h-5 mr-2 text-blue-600"/>
                                    Check Requisitions ({check_requisitions.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {check_requisitions.length > 0 ? (
                                    <div className="space-y-4">
                                        {check_requisitions.map((cr) => (
                                            <div key={cr.id} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <div
                                                            className="font-semibold text-slate-900">{cr.requisition_number}</div>
                                                        <div
                                                            className="text-sm text-slate-600">{formatDate(cr.request_date)}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-lg font-bold text-green-600">
                                                            {formatCurrency(cr.php_amount)}
                                                        </div>
                                                        <Badge
                                                            className={cn("text-xs", getStatusColor(cr.requisition_status))}>
                                                            {cr.requisition_status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <div>
                                                        <div className="text-slate-500">Payee: {cr.payee_name}</div>
                                                        <div className="text-slate-500">Payment
                                                            Method: {cr.payment_method}</div>
                                                    </div>
                                                    <Link href={`/check-requisitions/${cr.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="w-3 h-3 mr-1"/>
                                                            View
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <CreditCard className="w-12 h-12 mx-auto mb-3 text-slate-300"/>
                                        <div className="text-slate-500 mb-4">No check requisitions created yet</div>
                                        {invoice.invoice_status !== 'paid' && (
                                            <Button>
                                                <CreditCard className="w-4 h-4 mr-2"/>
                                                Create Check Requisition
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Remarks Tab */}
                    <TabsContent value="remarks">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2 text-amber-600"/>
                                    Remarks ({invoice_remarks.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {invoice_remarks.length > 0 ? (
                                    <div className="space-y-4">
                                        {invoice_remarks.map((remark) => (
                                            <div key={remark.id} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            {remark.remark_type}
                                                        </Badge>
                                                        <Badge className={cn(
                                                            "text-xs",
                                                            remark.priority === 'high' && "bg-red-100 text-red-800",
                                                            remark.priority === 'medium' && "bg-yellow-100 text-yellow-800",
                                                            remark.priority === 'low' && "bg-green-100 text-green-800"
                                                        )}>
                                                            {remark.priority}
                                                        </Badge>
                                                        {remark.is_internal && (
                                                            <Badge variant="outline"
                                                                   className="text-xs bg-blue-50 text-blue-700">
                                                                Internal
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {formatDate(remark.created_at)}
                                                    </div>
                                                </div>
                                                <div className="text-slate-700 mb-2">{remark.remark_text}</div>
                                                <div className="text-xs text-slate-500">
                                                    By {remark.created_by?.name || 'System'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-500">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300"/>
                                        <div>No remarks found</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Review Tab */}
                    <TabsContent value="review">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <ClipboardCheck className="w-5 h-5 mr-2 text-blue-600"/>
                                    Accounting Review
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {canReviewInvoice && !isAlreadyReviewed ? (
                                    // 🔹 Show Review Form
                                    <form onSubmit={(e) => handleReviewSubmit(invoice.id, e)} className="space-y-6">
                                        {/* Physical Files Confirmation */}
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="physicalFiles"
                                                    checked={data.physicalFilesReceived}
                                                    onCheckedChange={(checked) => setData("physicalFilesReceived", checked)}
                                                />
                                                <Label htmlFor="physicalFiles" className="text-sm font-medium">
                                                    Physical files have been received and verified
                                                </Label>
                                            </div>
                                            {!data.physicalFilesReceived && (
                                                <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                                                    <AlertTriangle className="w-4 h-4 inline mr-2" />
                                                    Please confirm physical file receipt before proceeding
                                                </div>
                                            )}
                                        </div>

                                        {/* Approval Decision */}
                                        {data.physicalFilesReceived && (
                                            <div className="space-y-3">
                                                <Label className="text-sm font-medium">Approval Decision</Label>
                                                <Select
                                                    value={data.approvalStatus}
                                                    onValueChange={(value) => setData("approvalStatus", value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select approval decision" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="approved">
                                                            <div className="flex items-center">
                                                                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                                                Approve Invoice
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="rejected">
                                                            <div className="flex items-center">
                                                                <XCircle className="w-4 h-4 mr-2 text-red-600" />
                                                                Reject Invoice
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {/* Remarks */}
                                        {data.approvalStatus && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">
                                                    Remarks
                                                    {data.approvalStatus === "rejected" && (
                                                        <span className="text-red-500 ml-1">*</span>
                                                    )}
                                                    {data.approvalStatus === "approved" && (
                                                        <span className="text-slate-500 text-xs ml-2">(Optional)</span>
                                                    )}
                                                </Label>
                                                <Textarea
                                                    value={data.remarks}
                                                    onChange={(e) => setData("remarks", e.target.value)}
                                                    placeholder={
                                                        data.approvalStatus === "rejected"
                                                            ? "Please provide detailed reasons for rejection..."
                                                            : "Add any additional comments or notes..."
                                                    }
                                                    className="min-h-[100px]"
                                                    required={data.approvalStatus === "rejected"}
                                                />
                                            </div>
                                        )}

                                        {/* Submit Button */}
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={
                                                !data.physicalFilesReceived ||
                                                !data.approvalStatus ||
                                                (data.approvalStatus === "rejected" && !data.remarks.trim()) ||
                                                processing
                                            }
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4 mr-2" />
                                                    Submit Review
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                ) : isAlreadyReviewed ? (
                                    // 🔹 Show Review History (all past reviews)
                                    <div className="space-y-6">
                                        {invoice.reviews?.map((review) => (
                                            <div
                                                key={review.id}
                                                className="p-4 border rounded-lg bg-slate-50 space-y-3"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-slate-600">Status:</span>
                                                    <Badge
                                                        className={cn(
                                                            "capitalize",
                                                            review.status === "approved"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                        )}
                                                    >
                                                        {review.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-slate-600">Reviewed By:</span>
                                                    <span className="text-sm font-medium">
                                                      {review.reviewer?.name || "Unknown"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-slate-600">Review Date:</span>
                                                    <span className="text-sm font-medium">
                                                      {format(review.reviewed_at,'PPp')}
                                                    </span>
                                                </div>
                                                {review.comments && (
                                                    <div className="pt-3 border-t">
                                                          <span className="text-sm text-slate-600 block mb-2">
                                                            Remarks:
                                                          </span>
                                                        <div className="bg-white p-3 rounded text-sm">
                                                            {review.comments}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    // 🔹 Show No Permission
                                    <div className="text-center py-8 text-slate-500">
                                        <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                        <div>You don't have permission to review this invoice</div>
                                    </div>
                                )}
                            </CardContent>

                        </Card>
                    </TabsContent>

                    {/* Timeline Tab */}
                    <TabsContent value="timeline">
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center text-slate-800">
                                    <Clock className="w-5 h-5 mr-2 text-slate-600"/>
                                    Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-slate-900">Invoice Created</div>
                                            <div className="text-xs text-slate-500">
                                                {formatDate(invoice.created_at)} by {creator?.name || 'System'}
                                            </div>
                                        </div>
                                    </div>

                                    {invoice.si_received_at && (
                                        <div className="flex items-start space-x-3">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-slate-900">Invoice Received
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {formatDate(invoice.si_received_at)}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {invoice.submitted_at && (
                                        <div className="flex items-start space-x-3">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-slate-900">Submitted for
                                                    Processing
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {formatDate(invoice.submitted_at)}
                                                    {invoice.submitted_to && ` to ${invoice.submitted_to}`}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {check_requisitions.length > 0 && (
                                        <div className="flex items-start space-x-3">
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-slate-900">Check Requisition
                                                    Created
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {check_requisitions.length} requisition(s) generated
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-slate-300 rounded-full mt-2"></div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-slate-900">Last Updated</div>
                                            <div className="text-xs text-slate-500">
                                                {formatDate(invoice.updated_at)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default ShowInvoice;
