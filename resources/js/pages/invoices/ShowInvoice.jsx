import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
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
    Folder
} from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const ShowInvoice = ({ invoice }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    // Destructure related data from invoice object
    const {
        purchase_order: po,
        files = [],
        invoice_remarks = [],
        created_by: creator,
        check_requisitions = []
    } = invoice;

    const project = po?.project;
    const vendor = po?.vendor;

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
        return `₱${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container max-w-7xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-slate-900">
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
                        <p className="text-slate-600">
                            Created {formatDate(invoice.created_at)} • Updated {formatDate(invoice.updated_at)}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/invoices/${invoice.id}/edit`} prefetch>
                            <Button variant="outline" className="w-fit">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                        </Link>
                        <Link href="/invoices" prefetch>
                            <Button variant="outline" className="w-fit">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Invoices
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="xl:col-span-2 space-y-6">
                        {/* Invoice Details */}
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center text-slate-800">
                                    <Receipt className="w-5 h-5 mr-2 text-blue-600" />
                                    Invoice Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">SI Number</div>
                                            <div className="text-lg font-semibold text-slate-900">
                                                {invoice.si_number || 'Not set'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">Invoice Date</div>
                                            <div className="flex items-center text-slate-900">
                                                <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                                                {formatDate(invoice.si_date)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">Due Date</div>
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                                                <span className={cn(
                                                    daysOverdue ? "text-red-600 font-medium" : "text-slate-900"
                                                )}>
                                                    {formatDate(invoice.due_date)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">Invoice Amount</div>
                                            <div className="text-2xl font-bold text-green-600">
                                                {formatCurrency(invoice.invoice_amount)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">Tax Amount</div>
                                            <div className="text-slate-900">
                                                {formatCurrency(invoice.tax_amount)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">Net Amount</div>
                                            <div className="text-lg font-semibold text-slate-900">
                                                {formatCurrency(invoice.net_amount)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">Received Date</div>
                                            <div className="flex items-center text-slate-900">
                                                <Clock className="w-4 h-4 mr-2 text-slate-500" />
                                                {formatDate(invoice.si_received_at)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">Payment Type</div>
                                            <div className="text-slate-900">
                                                {invoice.payment_type || 'Not specified'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">Created By</div>
                                            <div className="flex items-center text-slate-900">
                                                <User className="w-4 h-4 mr-2 text-slate-500" />
                                                {creator?.name || 'System'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Processing Information */}
                                {(invoice.submitted_at || invoice.submitted_to) && (
                                    <div className="border-t pt-6">
                                        <h4 className="text-sm font-medium text-slate-700 mb-3">Processing Information</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-sm font-medium text-slate-500">Submitted To</div>
                                                <div className="text-slate-900">
                                                    {invoice.submitted_to || 'Not specified'}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-500">Submission Date</div>
                                                <div className="flex items-center text-slate-900">
                                                    <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                                                    {formatDate(invoice.submitted_at)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                {invoice.notes && (
                                    <div className="border-t pt-6">
                                        <h4 className="text-sm font-medium text-slate-700 mb-2">Notes</h4>
                                        <div className="bg-slate-50 p-4 rounded-lg">
                                            <p className="text-slate-700 whitespace-pre-wrap">
                                                {invoice.notes}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Purchase Order Details */}
                        {po && (
                            <Card className="shadow-sm border-slate-200">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center text-slate-800">
                                        <FileText className="w-5 h-5 mr-2 text-green-600" />
                                        Purchase Order Details
                                        <Link href={`/purchase-orders/${po.id}`} className="ml-auto">
                                            <Button variant="ghost" size="sm">
                                                <Eye className="w-4 h-4 mr-1" />
                                                View PO
                                            </Button>
                                        </Link>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="space-y-3">
                                            <div>
                                                <div className="text-sm font-medium text-slate-500">PO Number</div>
                                                <div className="text-lg font-semibold text-slate-900">
                                                    {po.po_number}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-500">PO Date</div>
                                                <div className="text-slate-900">{formatDate(po.po_date)}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-500">Expected Delivery</div>
                                                <div className="text-slate-900">{formatDate(po.expected_delivery_date)}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <div className="text-sm font-medium text-slate-500">PO Amount</div>
                                                <div className="text-xl font-bold text-blue-600">
                                                    {formatCurrency(po.po_amount)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-500">Payment Terms</div>
                                                <div className="text-slate-900">{po.payment_term || 'Not specified'}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-500">Status</div>
                                                <Badge className={cn(
                                                    "capitalize",
                                                    po.po_status === 'payable' && "bg-green-100 text-green-800",
                                                    po.po_status === 'closed' && "bg-gray-100 text-gray-800",
                                                    po.po_status === 'pending' && "bg-yellow-100 text-yellow-800"
                                                )}>
                                                    {po.po_status}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <div className="text-sm font-medium text-slate-500">Created By</div>
                                                <div className="text-slate-900">{po.created_by?.name || 'System'}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-500">Finalized By</div>
                                                <div className="text-slate-900">{po.finalized_by?.name || 'Not finalized'}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-500">Finalized Date</div>
                                                <div className="text-slate-900">{formatDate(po.finalized_at)}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {po.description && (
                                        <div className="mt-6 pt-6 border-t">
                                            <div className="text-sm font-medium text-slate-500 mb-2">Description</div>
                                            <div className="bg-slate-50 p-4 rounded-lg">
                                                <p className="text-slate-700 whitespace-pre-wrap">
                                                    {po.description}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Project Details */}
                        {project && (
                            <Card className="shadow-sm border-slate-200">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center text-slate-800">
                                        <Folder className="w-5 h-5 mr-2 text-purple-600" />
                                        Project Information
                                        <Link href={`/projects/${project.id}`} className="ml-auto">
                                            <Button variant="ghost" size="sm">
                                                <Eye className="w-4 h-4 mr-1" />
                                                View Project
                                            </Button>
                                        </Link>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <div>
                                                <div className="text-sm font-medium text-slate-500">Project Title</div>
                                                <div className="text-lg font-semibold text-slate-900">
                                                    {project.project_title}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-500">CER Number</div>
                                                <div className="text-slate-900 font-mono">
                                                    {project.cer_number}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-500">Project Type</div>
                                                <div className="text-slate-900">{project.project_type}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-500">SMPO Number</div>
                                                <div className="text-slate-900 font-mono">
                                                    {project.smpo_number || 'Not assigned'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <div className="text-sm font-medium text-slate-500">Total Project Cost</div>
                                                <div className="text-xl font-bold text-purple-600">
                                                    {formatCurrency(project.total_project_cost)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-500">Contract Cost</div>
                                                <div className="text-lg font-semibold text-slate-900">
                                                    {formatCurrency(project.total_contract_cost)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-500">Status</div>
                                                <Badge className={cn(
                                                    "capitalize",
                                                    project.project_status === 'active' && "bg-green-100 text-green-800",
                                                    project.project_status === 'completed' && "bg-blue-100 text-blue-800",
                                                    project.project_status === 'on_hold' && "bg-yellow-100 text-yellow-800"
                                                )}>
                                                    {project.project_status?.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-500">Philcom Category</div>
                                                <div className="text-slate-900">
                                                    {project.philcom_category || 'Not specified'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {project.description && (
                                        <div className="mt-6 pt-6 border-t">
                                            <div className="text-sm font-medium text-slate-500 mb-2">Description</div>
                                            <div className="bg-slate-50 p-4 rounded-lg">
                                                <p className="text-slate-700 whitespace-pre-wrap">
                                                    {project.description}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Vendor Information */}
                        {vendor && (
                            <Card className="shadow-sm border-slate-200">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center text-slate-800">
                                        <Building2 className="w-5 h-5 mr-2 text-orange-600" />
                                        Vendor Information
                                        <Link href={`/vendors/${vendor.id}`} className="ml-auto">
                                            <Button variant="ghost" size="sm">
                                                <Eye className="w-4 h-4 mr-1" />
                                                View Vendor
                                            </Button>
                                        </Link>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <div>
                                                <div className="text-sm font-medium text-slate-500">Vendor Name</div>
                                                <div className="text-lg font-semibold text-slate-900">
                                                    {vendor.name}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-500">Category</div>
                                                <div className="text-slate-900">{vendor.category}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-500">Vendor Type</div>
                                                <div className="text-slate-900 capitalize">{vendor.vendor_type}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-500">Status</div>
                                                <Badge className={cn(
                                                    vendor.is_active
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                )}>
                                                    {vendor.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <div className="text-sm font-medium text-slate-500">Contact Email</div>
                                                <div className="flex items-center text-slate-900">
                                                    <Mail className="w-4 h-4 mr-2 text-slate-500" />
                                                    {vendor.email || 'Not provided'}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-500">Phone</div>
                                                <div className="flex items-center text-slate-900">
                                                    <Phone className="w-4 h-4 mr-2 text-slate-500" />
                                                    {vendor.phone || 'Not provided'}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-500">Payment Terms</div>
                                                <div className="text-slate-900">
                                                    {vendor.payment_terms || 'Not specified'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {vendor.address && (
                                        <div className="mt-6 pt-6 border-t">
                                            <div className="text-sm font-medium text-slate-500 mb-2">Address</div>
                                            <div className="flex items-start">
                                                <MapPin className="w-4 h-4 mr-2 text-slate-500 mt-0.5" />
                                                <p className="text-slate-700">{vendor.address}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Files and Actions */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-slate-800">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Link href={`/invoices/${invoice.id}/edit`} className="block">
                                    <Button className="w-full" variant="outline">
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Invoice
                                    </Button>
                                </Link>
                                {po && (
                                    <Link href={`/purchase-orders/${po.id}`} className="block">
                                        <Button className="w-full" variant="outline">
                                            <FileText className="w-4 h-4 mr-2" />
                                            View Purchase Order
                                        </Button>
                                    </Link>
                                )}
                                {check_requisitions.length === 0 && invoice.invoice_status !== 'paid' && (
                                    <Button className="w-full" variant="default">
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Create Check Requisition
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Amount Summary */}
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center text-slate-800">
                                    <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                                    Amount Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center p-4 bg-slate-50 rounded border">
                                    <div className="text-sm text-slate-600 mb-1">Invoice Amount</div>
                                    <div className="text-3xl font-bold text-slate-900">
                                        {formatCurrency(invoice.invoice_amount)}
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Subtotal:</span>
                                        <span className="font-medium">
                                            {formatCurrency(invoice.invoice_amount - (invoice.tax_amount || 0))}
                                        </span>
                                    </div>
                                    {invoice.tax_amount > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Tax:</span>
                                            <span className="font-medium">
                                                {formatCurrency(invoice.tax_amount)}
                                            </span>
                                        </div>
                                    )}
                                    {invoice.discount_amount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount:</span>
                                            <span className="font-medium">
                                                -{formatCurrency(invoice.discount_amount)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-t pt-2 font-semibold">
                                        <span>Net Amount:</span>
                                        <span>{formatCurrency(invoice.net_amount)}</span>
                                    </div>
                                </div>

                                {po && (
                                    <div className="pt-4 border-t">
                                        <div className="text-xs text-slate-500 mb-2">vs PO Amount</div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Remaining:</span>
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
                                )}
                            </CardContent>
                        </Card>

                        {/* Check Requisitions */}
                        {check_requisitions.length > 0 && (
                            <Card className="shadow-sm border-slate-200">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center text-slate-800">
                                        <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                                        Check Requisitions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {check_requisitions.map((cr) => (
                                            <div key={cr.id} className="p-3 border rounded-lg">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <div className="font-medium text-slate-900">
                                                            {cr.requisition_number}
                                                        </div>
                                                        <div className="text-sm text-slate-600">
                                                            {formatDate(cr.request_date)}
                                                        </div>
                                                    </div>
                                                    <Badge className={cn(
                                                        "text-xs",
                                                        getStatusColor(cr.requisition_status)
                                                    )}>
                                                        {cr.requisition_status}
                                                    </Badge>
                                                </div>
                                                <div className="text-lg font-semibold text-green-600">
                                                    {formatCurrency(cr.php_amount)}
                                                </div>
                                                <Link href={`/check-requisitions/${cr.id}`}>
                                                    <Button variant="ghost" size="sm" className="mt-2">
                                                        <Eye className="w-3 h-3 mr-1" />
                                                        View Details
                                                    </Button>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Files and Attachments */}
                        {files.length > 0 && (
                            <Card className="shadow-sm border-slate-200">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center text-slate-800">
                                        <Paperclip className="w-5 h-5 mr-2 text-indigo-600" />
                                        Attachments ({files.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {files.map((file) => (
                                            <div
                                                key={file.id}
                                                className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                                            >
                                                <div className="flex items-center flex-1 min-w-0">
                                                    <FileIcon className="w-4 h-4 mr-3 text-slate-500 flex-shrink-0" />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-sm font-medium text-slate-900 truncate">
                                                            {file.file_name}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {(file.file_size / 1024 / 1024).toFixed(2)} MB •
                                                            {file.file_category && ` ${file.file_category} •`}
                                                            {file.file_purpose && ` ${file.file_purpose}`}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setSelectedFile(file)}
                                                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-2xl">
                                                            <DialogHeader>
                                                                <DialogTitle className="flex items-center">
                                                                    <FileIcon className="w-5 h-5 mr-2" />
                                                                    {file.file_name}
                                                                </DialogTitle>
                                                                <DialogDescription>
                                                                    File details and preview
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="space-y-4">
                                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                                    <div>
                                                                        <div className="text-slate-500">File Type</div>
                                                                        <div className="font-medium">{file.file_type}</div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-slate-500">Size</div>
                                                                        <div className="font-medium">
                                                                            {(file.file_size / 1024 / 1024).toFixed(2)} MB
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-slate-500">Category</div>
                                                                        <div className="font-medium">
                                                                            {file.file_category || 'Not specified'}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-slate-500">Purpose</div>
                                                                        <div className="font-medium">
                                                                            {file.file_purpose || 'Not specified'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {file.description && (
                                                                    <div>
                                                                        <div className="text-slate-500 text-sm mb-1">Description</div>
                                                                        <div className="bg-slate-50 p-3 rounded text-sm">
                                                                            {file.description}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-end space-x-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={() => window.open(`/storage/${file.file_path}`, '_blank')}
                                                                    >
                                                                        <Download className="w-4 h-4 mr-2" />
                                                                        Download
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => window.open(`/storage/${file.file_path}`, '_blank')}
                                                        className="text-green-600 hover:text-green-800 hover:bg-green-50"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Remarks/Comments */}
                        {invoice_remarks.length > 0 && (
                            <Card className="shadow-sm border-slate-200">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center text-slate-800">
                                        <AlertCircle className="w-5 h-5 mr-2 text-amber-600" />
                                        Remarks ({invoice_remarks.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
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
                                                            {remark.priority} priority
                                                        </Badge>
                                                        {remark.is_internal && (
                                                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                                                Internal
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {formatDate(remark.created_at)}
                                                    </div>
                                                </div>
                                                <div className="text-sm text-slate-700 mb-2">
                                                    {remark.remark_text}
                                                </div>
                                                <div className="text-xs text-slate-500 flex items-center">
                                                    <User className="w-3 h-3 mr-1" />
                                                    {remark.created_by?.name || 'System'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Status Timeline */}
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center text-slate-800">
                                    <Clock className="w-5 h-5 mr-2 text-slate-600" />
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
                                                <div className="text-sm font-medium text-slate-900">Invoice Received</div>
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
                                                <div className="text-sm font-medium text-slate-900">Submitted for Processing</div>
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
                                                <div className="text-sm font-medium text-slate-900">Check Requisition Created</div>
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShowInvoice;
