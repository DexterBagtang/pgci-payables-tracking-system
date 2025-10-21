import React, { useState } from 'react';
import { Head, Link, router, useRemember } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
    Alert,
    AlertDescription,
} from '@/components/ui/alert';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    ArrowLeft,
    FileText,
    Calendar,
    DollarSign,
    AlertCircle,
    Download,
    Printer,
    Edit,
    Eye,
    Building2,
    CheckCircle,
    Clock,
    XCircle,
    Copy,
    Share2,
    FileSpreadsheet,
    Mail,
    History,
    TrendingUp,
    Filter,
    Search,
    Calculator, View, SearchCheck
} from 'lucide-react';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import BackButton from '@/components/custom/BackButton.jsx';
import StatusBadge from '@/components/custom/StatusBadge.jsx';
import AttachmentViewer from '@/pages/invoices/components/AttachmentViewer.jsx';

export default function ShowCheckRequisition({ checkRequisition, invoices, files, purchaseOrder }) {
    const [searchInvoice, setSearchInvoice] = useState('');
    const [invoiceFilter, setInvoiceFilter] = useState('all');
    const [showCalculator, setShowCalculator] = useState(false);
    const [tab, setTab] = useRemember('details','check-details-tab')

    const mainPdfFile = files?.find(f => f.file_purpose === 'check_requisition');

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDateTime = (datetime) => {
        if (!datetime) return 'N/A';
        return new Date(datetime).toLocaleString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handlePrintPdf = () => {
        if (mainPdfFile) {
            window.open(`/storage/${mainPdfFile.file_path}`, '_blank');
        }
    };

    const handleDownloadPdf = () => {
        if (mainPdfFile) {
            const link = document.createElement('a');
            link.href = `/storage/${mainPdfFile.file_path}`;
            link.download = mainPdfFile.file_name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleEdit = () => {
        router.visit(`/check-requisitions/${checkRequisition.id}/edit`);
};

const handleReview = () => {
    router.visit(`/check-requisitions/${checkRequisition.id}/review`);
};


const calculateTotalInvoiceAmount = () => {
    if (!invoices || invoices.length === 0) return 0;
    return invoices.reduce((sum, inv) => sum + parseFloat(inv.net_amount || 0), 0);
};

const isAmountMatching = () => {
    const totalInvoice = calculateTotalInvoiceAmount();
    return Math.abs(totalInvoice - parseFloat(checkRequisition.php_amount)) < 0.01;
};

// Copy to clipboard functionality
const handleCopyDetails = () => {
    const details = `
CHECK REQUISITION DETAILS
========================
Requisition No: ${checkRequisition.requisition_number}
Date: ${formatDate(checkRequisition.request_date)}
Status: ${checkRequisition.requisition_status}

PAYMENT INFORMATION
Payee: ${checkRequisition.payee_name}
Amount: ${formatCurrency(checkRequisition.php_amount)}
Amount in Words: ${checkRequisition.amount_in_words}

REFERENCE DOCUMENTS
PO Number: ${checkRequisition.po_number || 'N/A'}
CER Number: ${checkRequisition.cer_number || 'N/A'}
SI Number: ${checkRequisition.si_number || 'N/A'}

PURPOSE
${checkRequisition.purpose}

SIGNATORIES
Requested By: ${checkRequisition.requested_by}
Reviewed By: ${checkRequisition.reviewed_by || 'Pending'}
Approved By: ${checkRequisition.approved_by || 'Pending'}
        `.trim();

    navigator.clipboard.writeText(details);
    toast.success('Details copied to clipboard');
};

// Copy requisition number
const handleCopyReqNumber = () => {
    navigator.clipboard.writeText(checkRequisition.requisition_number);
    toast.success('Requisition number copied');
};

// Share via email
const handleShareEmail = () => {
    const subject = encodeURIComponent(`Check Requisition - ${checkRequisition.requisition_number}`);
    const body = encodeURIComponent(`Please review check requisition ${checkRequisition.requisition_number} for ${checkRequisition.payee_name} amounting to ${formatCurrency(checkRequisition.php_amount)}.`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
};

// Export invoices to CSV
const handleExportInvoices = () => {
    if (!invoices || invoices.length === 0) {
        toast.error('No invoices to export');
        return;
    }

    const csvContent = [
        ['SI Number', 'Date', 'Invoice Amount', 'Tax', 'Discount', 'Net Amount', 'Status'],
        ...invoices.map(inv => [
            inv.si_number,
            formatDate(inv.si_date),
            inv.invoice_amount,
            inv.tax_amount || 0,
            inv.discount_amount || 0,
            inv.net_amount,
            inv.invoice_status
        ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-${checkRequisition.requisition_number}.csv`;
    a.click();
    toast.success('Invoices exported successfully');
};

// Print view
const handlePrint = () => {
    window.print();
};

// Filter invoices
const filteredInvoices = invoices?.filter(inv => {
    const matchesSearch = inv.si_number.toLowerCase().includes(searchInvoice.toLowerCase());
    const matchesFilter = invoiceFilter === 'all' || inv.invoice_status === invoiceFilter;
    return matchesSearch && matchesFilter;
}) || [];

// Invoice statistics
const invoiceStats = {
    total: invoices?.length || 0,
    totalAmount: calculateTotalInvoiceAmount(),
    avgAmount: invoices?.length > 0 ? calculateTotalInvoiceAmount() / invoices.length : 0,
    totalTax: invoices?.reduce((sum, inv) => sum + parseFloat(inv.tax_amount || 0), 0) || 0,
    totalDiscount: invoices?.reduce((sum, inv) => sum + parseFloat(inv.discount_amount || 0), 0) || 0,
};

// Calculate variance
const amountVariance = calculateTotalInvoiceAmount() - parseFloat(checkRequisition.php_amount);
const variancePercentage = (amountVariance / parseFloat(checkRequisition.php_amount)) * 100;

return (
    <div className="py-6 print:py-2">
        <Head title={`Check Requisition - ${checkRequisition.requisition_number}`} />

        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 print:hidden">
                <BackButton />

                <div className="flex gap-2">
                    {checkRequisition.requisition_status !== 'approved' && (
                        <Button variant="outline" size="sm" onClick={handleEdit}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    )}

                    <Button variant="outline" size="sm" onClick={handleReview}>
                        <SearchCheck className="mr-2 h-4 w-4" />
                        Review
                    </Button>
                </div>
            </div>

            {/* Amount Mismatch Warning */}
            {!isAmountMatching() && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <div className="flex justify-between items-center">
                                <span>
                                    Amount mismatch: Check requisition ({formatCurrency(checkRequisition.php_amount)}) vs Total invoices ({formatCurrency(calculateTotalInvoiceAmount())})
                                </span>
                            <Badge variant="outline" className="ml-2 bg-white">
                                Variance: {formatCurrency(Math.abs(amountVariance))} ({Math.abs(variancePercentage).toFixed(2)}%)
                            </Badge>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6 print:hidden">
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-blue-600 font-medium">Requisition Amount</p>
                                <p className="text-lg font-bold text-blue-900">{formatCurrency(checkRequisition.php_amount)}</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-blue-300" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-green-600 font-medium">Total Invoices</p>
                                <p className="text-lg font-bold text-green-900">{formatCurrency(invoiceStats.totalAmount)}</p>
                            </div>
                            <FileText className="h-8 w-8 text-green-300" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-purple-600 font-medium">Tax Amount</p>
                                <p className="text-lg font-bold text-purple-900">{formatCurrency(invoiceStats.totalTax)}</p>
                            </div>
                            <Calculator className="h-8 w-8 text-purple-300" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-orange-600 font-medium">Discount</p>
                                <p className="text-lg font-bold text-orange-900">{formatCurrency(invoiceStats.totalDiscount)}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-orange-300" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <CardTitle className="text-xl font-bold mb-1">
                                        Check Requisition
                                    </CardTitle>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <button
                                            onClick={handleCopyReqNumber}
                                            className="font-mono font-medium hover:text-blue-600 transition-colors flex items-center gap-1"
                                            title="Click to copy"
                                        >
                                            {checkRequisition.requisition_number}
                                            <Copy className="h-3 w-3" />
                                        </button>
                                        <span>•</span>
                                        <span>{formatDate(checkRequisition.created_at)}</span>
                                    </div>
                                </div>
                                <StatusBadge status={checkRequisition.requisition_status} />
                            </div>
                        </CardHeader>

                        <CardContent>
                            <Tabs value={tab} onValueChange={setTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-4 mb-6">
                                    <TabsTrigger value="details">Details</TabsTrigger>
                                    <TabsTrigger value="invoices">Invoices ({invoices?.length || 0})</TabsTrigger>
                                    <TabsTrigger value="documents">Documents ({files?.length || 0})</TabsTrigger>
                                    <TabsTrigger value="audit">Audit Trail</TabsTrigger>
                                </TabsList>

                                {/* Details Tab */}
                                <TabsContent value="details" className="space-y-6">
                                    {/* Payment Information */}
                                    <div>
                                        <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">
                                            Payment Information
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-muted-foreground">Payee</label>
                                                <p className="text-base font-semibold mt-1">{checkRequisition.payee_name}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-muted-foreground">Amount</label>
                                                <p className="text-base font-semibold mt-1 text-blue-600">{formatCurrency(checkRequisition.php_amount)}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-xs text-muted-foreground">Amount in Words</label>
                                                <p className="text-sm mt-1 italic bg-slate-50 p-2 rounded">{checkRequisition.amount_in_words}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-muted-foreground">Request Date</label>
                                                <p className="text-sm mt-1">{formatDate(checkRequisition.request_date)}</p>
                                            </div>
                                            {purchaseOrder && (
                                                <div>
                                                    <label className="text-xs text-muted-foreground">PO Amount</label>
                                                    <p className="text-sm mt-1">{formatCurrency(purchaseOrder.po_amount)}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Accounting Details */}
                                    <div>
                                        <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">
                                            Accounting Details
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-muted-foreground">Account Charge</label>
                                                <p className="text-sm mt-1 font-mono bg-slate-50 p-2 rounded">{checkRequisition.account_charge || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-muted-foreground">Service Line Distribution</label>
                                                <p className="text-sm mt-1 bg-slate-50 p-2 rounded">{checkRequisition.service_line_dist || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Reference Numbers */}
                                    <div>
                                        <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">
                                            Reference Documents
                                        </h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-xs text-muted-foreground">PO Number</label>
                                                <p className="text-sm font-mono mt-1 bg-slate-50 p-2 rounded">{checkRequisition.po_number || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-muted-foreground">CER Number</label>
                                                <p className="text-sm font-mono mt-1 bg-slate-50 p-2 rounded">{checkRequisition.cer_number || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-muted-foreground">SI Number</label>
                                                <p className="text-sm font-mono mt-1 bg-slate-50 p-2 rounded">{checkRequisition.si_number || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Purpose */}
                                    <div>
                                        <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">
                                            Purpose
                                        </h3>
                                        <p className="text-sm whitespace-pre-wrap bg-slate-50 p-3 rounded">{checkRequisition.purpose}</p>
                                    </div>

                                    <Separator />

                                    {/* Signatories */}
                                    <div>
                                        <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">
                                            Signatories
                                        </h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                                <label className="text-xs text-blue-600 font-medium">Requested By</label>
                                                <p className="text-sm font-medium mt-1">{checkRequisition.requested_by}</p>
                                            </div>
                                            <div className="bg-purple-50 p-3 rounded border border-purple-200">
                                                <label className="text-xs text-purple-600 font-medium">Reviewed By</label>
                                                <p className="text-sm font-medium mt-1">{checkRequisition.reviewed_by || 'Pending'}</p>
                                            </div>
                                            <div className="bg-green-50 p-3 rounded border border-green-200">
                                                <label className="text-xs text-green-600 font-medium">Approved By</label>
                                                <p className="text-sm font-medium mt-1">{checkRequisition.approved_by || 'Pending'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Invoices Tab */}
                                <TabsContent value="invoices" className="space-y-6">
                                    {invoices && invoices.length > 0 ? (
                                        <>
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                                                    Associated Invoices ({filteredInvoices.length}/{invoices.length})
                                                </h3>
                                                <div className="flex gap-2 print:hidden">
                                                    <div className="relative">
                                                        <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-slate-400" />
                                                        <Input
                                                            type="search"
                                                            placeholder="Search SI..."
                                                            value={searchInvoice}
                                                            onChange={(e) => setSearchInvoice(e.target.value)}
                                                            className="pl-8 h-8 w-40 text-xs"
                                                        />
                                                    </div>
                                                    <Select value={invoiceFilter} onValueChange={setInvoiceFilter}>
                                                        <SelectTrigger className="h-8 w-32 text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">All Status</SelectItem>
                                                            <SelectItem value="approved">Approved</SelectItem>
                                                            <SelectItem value="pending">Pending</SelectItem>
                                                            <SelectItem value="paid">Paid</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            {/* Invoice Summary Stats */}
                                            <div className="grid grid-cols-3 gap-2 mb-3 print:hidden">
                                                <div className="bg-slate-50 p-2 rounded text-center">
                                                    <p className="text-xs text-slate-600">Avg Amount</p>
                                                    <p className="text-sm font-semibold">{formatCurrency(invoiceStats.avgAmount)}</p>
                                                </div>
                                                <div className="bg-slate-50 p-2 rounded text-center">
                                                    <p className="text-xs text-slate-600">Total Tax</p>
                                                    <p className="text-sm font-semibold">{formatCurrency(invoiceStats.totalTax)}</p>
                                                </div>
                                                <div className="bg-slate-50 p-2 rounded text-center">
                                                    <p className="text-xs text-slate-600">Total Discount</p>
                                                    <p className="text-sm font-semibold">{formatCurrency(invoiceStats.totalDiscount)}</p>
                                                </div>
                                            </div>

                                            <div className="border rounded-lg overflow-hidden">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-muted/50">
                                                            <TableHead className="h-9">SI Number</TableHead>
                                                            <TableHead className="h-9">Date</TableHead>
                                                            <TableHead className="h-9 text-right">Invoice Amt</TableHead>
                                                            <TableHead className="h-9 text-right">Tax</TableHead>
                                                            <TableHead className="h-9 text-right">Discount</TableHead>
                                                            <TableHead className="h-9 text-right">Net Amount</TableHead>
                                                            <TableHead className="h-9">Status</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {filteredInvoices.map((invoice) => (
                                                            <TableRow key={invoice.id} className="hover:bg-slate-50">
                                                                <TableCell className="font-mono text-sm py-2">
                                                                    {invoice.si_number}
                                                                </TableCell>
                                                                <TableCell className="text-sm py-2">
                                                                    {formatDate(invoice.si_date)}
                                                                </TableCell>
                                                                <TableCell className="text-sm text-right py-2">
                                                                    {formatCurrency(invoice.invoice_amount)}
                                                                </TableCell>
                                                                <TableCell className="text-sm text-right py-2 text-red-600">
                                                                    {formatCurrency(invoice.tax_amount || 0)}
                                                                </TableCell>
                                                                <TableCell className="text-sm text-right py-2 text-green-600">
                                                                    {formatCurrency(invoice.discount_amount || 0)}
                                                                </TableCell>
                                                                <TableCell className="text-sm text-right font-medium py-2">
                                                                    {formatCurrency(invoice.net_amount)}
                                                                </TableCell>
                                                                <TableCell className="py-2">
                                                                    <StatusBadge status={invoice.invoice_status} size="sm" />
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                        <TableRow className="bg-muted/30 font-semibold">
                                                            <TableCell colSpan={5} className="text-right py-2">
                                                                Total:
                                                            </TableCell>
                                                            <TableCell className="text-right py-2 text-blue-600">
                                                                {formatCurrency(calculateTotalInvoiceAmount())}
                                                            </TableCell>
                                                            <TableCell className="py-2">
                                                                {isAmountMatching() ? (
                                                                    <Badge variant="outline" className="text-xs bg-green-50 border-green-300">
                                                                        <CheckCircle className="mr-1 h-3 w-3" />
                                                                        Matched
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="outline" className="text-xs bg-red-50 border-red-300">
                                                                        <AlertCircle className="mr-1 h-3 w-3" />
                                                                        Mismatch
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                            <p>No invoices associated with this check requisition</p>
                                        </div>
                                    )}
                                </TabsContent>

                                {/* Documents Tab */}
                                <TabsContent value="documents" className="space-y-6">
                                    {/* Generated Document */}
                                    {mainPdfFile && (
                                        <div>
                                            <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">
                                                Generated Document
                                            </h3>
                                            <AttachmentViewer files={[mainPdfFile]} />
                                        </div>
                                    )}

                                    {/* Supporting Documents */}
                                    {files && files.filter(f => f.file_purpose !== 'check_requisition').length > 0 ? (
                                        <div>
                                            <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">
                                                Supporting Documents ({files.filter(f => f.file_purpose !== 'check_requisition').length})
                                            </h3>
                                            <AttachmentViewer files={files.filter(f => f.file_purpose !== 'check_requisition')} />
                                        </div>
                                    ) : null}

                                    {(!files || files.length === 0 || (files.length === 1 && mainPdfFile)) && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                            <p>No supporting documents attached to this check requisition</p>
                                        </div>
                                    )}
                                </TabsContent>

                                {/* Audit Trail Tab */}
                                <TabsContent value="audit" className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">
                                            Timestamps
                                        </h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-start gap-3 pb-3 border-b">
                                                <Clock className="h-4 w-4 text-slate-400 mt-0.5" />
                                                <div className="flex-1">
                                                    <label className="text-xs text-muted-foreground">Created</label>
                                                    <p className="text-sm mt-1">{formatDateTime(checkRequisition.created_at)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 pb-3 border-b">
                                                <Edit className="h-4 w-4 text-slate-400 mt-0.5" />
                                                <div className="flex-1">
                                                    <label className="text-xs text-muted-foreground">Last Updated</label>
                                                    <p className="text-sm mt-1">{formatDateTime(checkRequisition.updated_at)}</p>
                                                </div>
                                            </div>
                                            {checkRequisition.approved_at && (
                                                <div className="flex items-start gap-3 pb-3 border-b">
                                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                                    <div className="flex-1">
                                                        <label className="text-xs text-muted-foreground">Approved</label>
                                                        <p className="text-sm mt-1">{formatDateTime(checkRequisition.approved_at)}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {checkRequisition.processed_at && (
                                                <div className="flex items-start gap-3">
                                                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                                                    <div className="flex-1">
                                                        <label className="text-xs text-muted-foreground">Processed</label>
                                                        <p className="text-sm mt-1">{formatDateTime(checkRequisition.processed_at)}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Processing Metrics */}
                                    {checkRequisition.processed_at && (
                                        <div>
                                            <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">
                                                Processing Metrics
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-slate-50 p-3 rounded">
                                                    <label className="text-xs text-muted-foreground">Approval Time</label>
                                                    <p className="text-sm font-semibold mt-1">
                                                        {checkRequisition.approved_at ?
                                                            `${Math.round((new Date(checkRequisition.approved_at) - new Date(checkRequisition.created_at)) / (1000 * 60 * 60 * 24))} days`
                                                            : 'N/A'}
                                                    </p>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded">
                                                    <label className="text-xs text-muted-foreground">Processing Time</label>
                                                    <p className="text-sm font-semibold mt-1">
                                                        {Math.round((new Date(checkRequisition.processed_at) - new Date(checkRequisition.created_at)) / (1000 * 60 * 60 * 24))} days
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6 print:hidden">
                    {/* Quick Actions */}
                    <div className="space-y-6 print:hidden">
                        {mainPdfFile ? (
                            <Card className="flex flex-col h-full">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">
                                        Document Preview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col gap-4">
                                    {/* PDF Viewer */}
                                    <div className="flex-1 rounded-lg bg-slate-100 min-h-80">
                                        <iframe
                                            src={`/storage/${mainPdfFile.file_path}#toolbar=0`}
                                            className="w-full min-h-80 border-0"
                                            title="Check Requisition PDF"
                                            style={{ border: 'none' }}
                                        />
                                    </div>

                                    {/* File Info */}
                                    <div className="border-t pt-3">
                                        <p className="text-xs text-muted-foreground mb-2">
                                            {mainPdfFile.file_name}
                                        </p>
                                        <p className="text-xs text-slate-500 mb-3">
                                            PDF • {(mainPdfFile.file_size / 1024).toFixed(2)} KB
                                        </p>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleDownloadPdf}
                                                className="flex-1"
                                                size="sm"
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </Button>
                                            <Button
                                                onClick={handlePrintPdf}
                                                variant="outline"
                                                size="sm"
                                            >
                                                <Printer className="mr-2 h-4 w-4" />
                                                Open
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="pt-6 text-center">
                                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                                    <p className="text-sm text-muted-foreground">No PDF available</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Amount Breakdown */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">
                                Amount Breakdown
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-xs text-muted-foreground">Gross Amount</span>
                                <span className="text-sm font-semibold">{formatCurrency(invoiceStats.totalAmount + invoiceStats.totalDiscount)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-xs text-muted-foreground">Discount</span>
                                <span className="text-sm font-semibold text-green-600">- {formatCurrency(invoiceStats.totalDiscount)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-xs text-muted-foreground">Subtotal</span>
                                <span className="text-sm font-semibold">{formatCurrency(invoiceStats.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-xs text-muted-foreground">Tax (Included)</span>
                                <span className="text-sm font-semibold text-red-600">{formatCurrency(invoiceStats.totalTax)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 bg-blue-50 p-3 rounded -mx-2">
                                <span className="text-sm font-semibold text-blue-900">Net Payable</span>
                                <span className="text-lg font-bold text-blue-900">{formatCurrency(checkRequisition.php_amount)}</span>
                            </div>
                            {!isAmountMatching() && (
                                <div className="flex justify-between items-center pt-2 bg-red-50 p-3 rounded -mx-2">
                                    <span className="text-xs font-semibold text-red-900">Variance</span>
                                    <span className="text-sm font-bold text-red-900">
                                            {formatCurrency(Math.abs(amountVariance))}
                                        </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    </div>
);
}
