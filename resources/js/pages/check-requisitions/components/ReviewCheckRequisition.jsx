import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
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
    AlertTitle,
} from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    ArrowLeft,
    FileText,
    CheckCircle,
    XCircle,
    Upload,
    AlertCircle,
    Clock,
    User,
    Calendar,
    DollarSign,
    FileCheck,
    MessageSquare,
    History,
    Eye,
    Download,
} from 'lucide-react';
import { toast } from 'sonner';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import StatusBadge from '@/components/custom/StatusBadge.jsx';
import BackButton from '@/components/custom/BackButton.jsx';

export default function ReviewCheckRequisition({
                                                   checkRequisition,
                                                   invoices,
                                                   files,
                                                   activityLogs
                                               }) {
    const [approvalDialog, setApprovalDialog] = useState(false);
    const [rejectionDialog, setRejectionDialog] = useState(false);
    const [uploadDialog, setUploadDialog] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const approvalForm = useForm({
        notes: '',
        approval_type: 'digital', // 'digital' or 'physical'
    });

    const rejectionForm = useForm({
        rejection_reason: '',
        notes: '',
    });

    const uploadForm = useForm({
        signed_document: null,
        notes: '',
    });

    const mainPdfFile = files?.find(f => f.file_purpose === 'check_requisition');
    const signedDocs = files?.filter(f => f.file_purpose === 'signed_check_requisition') || [];

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


    const handleApprove = () => {
        approvalForm.post(`/check-requisitions/${checkRequisition.id}/approve`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Check requisition approved successfully!');
                setApprovalDialog(false);
                approvalForm.reset();
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] || 'Approval failed');
            },
        });
    };

    const handleReject = () => {
        if (!rejectionForm.data.rejection_reason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        rejectionForm.post(`/check-requisitions/${checkRequisition.id}/reject`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Check requisition rejected');
                setRejectionDialog(false);
                rejectionForm.reset();
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] || 'Rejection failed');
            },
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                toast.error('File size must be less than 10MB');
                return;
            }
            setSelectedFile(file);
            uploadForm.setData('signed_document', file);
        }
    };

    const handleUploadSignedDoc = () => {
        if (!selectedFile) {
            toast.error('Please select a file to upload');
            return;
        }

        uploadForm.post(`/check-requisitions/${checkRequisition.id}/upload-signed`, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                toast.success('Signed document uploaded successfully!');
                setUploadDialog(false);
                uploadForm.reset();
                setSelectedFile(null);
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] || 'Upload failed');
            },
        });
    };

    const handleViewFile = (filePath) => {
        window.open(`/storage/${filePath}`, '_blank');
    };

    const handleDownloadFile = (file) => {
        const link = document.createElement('a');
        link.href = `/storage/${file.file_path}`;
        link.download = file.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const calculateTotalInvoiceAmount = () => {
        if (!invoices || invoices.length === 0) return 0;
        return invoices.reduce((sum, inv) => sum + parseFloat(inv.net_amount || 0), 0);
    };

    const isAmountMatching = () => {
        const totalInvoice = calculateTotalInvoiceAmount();
        return Math.abs(totalInvoice - parseFloat(checkRequisition.php_amount)) < 0.01;
    };

    const canApprove = checkRequisition.requisition_status === 'pending_approval';
    const isApproved = checkRequisition.requisition_status === 'approved';
    const isRejected = checkRequisition.requisition_status === 'rejected';

    return (
        <div className="py-6">
            <Head title={`Review - ${checkRequisition.requisition_number}`} />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <div>
                            <h1 className="text-xl font-semibold text-slate-800">
                                Review Check Requisition
                            </h1>
                            <p className="text-xs text-slate-500">
                                {checkRequisition.requisition_number}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {canApprove && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setUploadDialog(true)}
                                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Signed
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setRejectionDialog(true)}
                                    className="border-red-300 text-red-700 hover:bg-red-50"
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => setApprovalDialog(true)}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve
                                </Button>
                            </>
                        )}
                        {mainPdfFile && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewFile(mainPdfFile.file_path)}
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                View PDF
                            </Button>
                        )}
                    </div>
                </div>

                {/* Status Alert */}
                {isApproved && (
                    <Alert className="mb-6 border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Approved</AlertTitle>
                        <AlertDescription className="text-green-700">
                            This check requisition was approved on {formatDateTime(checkRequisition.approved_at)}
                        </AlertDescription>
                    </Alert>
                )}

                {isRejected && (
                    <Alert className="mb-6 border-red-200 bg-red-50">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertTitle className="text-red-800">Rejected</AlertTitle>
                        <AlertDescription className="text-red-700">
                            This check requisition was rejected. Check activity logs for details.
                        </AlertDescription>
                    </Alert>
                )}

                {!isAmountMatching() && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Amount mismatch: Check requisition ({formatCurrency(checkRequisition.php_amount)}) vs Total invoices ({formatCurrency(calculateTotalInvoiceAmount())})
                        </AlertDescription>
                    </Alert>
                )}

                <Tabs defaultValue="details" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="details">
                            <FileText className="mr-2 h-4 w-4" />
                            Details
                        </TabsTrigger>
                        <TabsTrigger value="invoices">
                            <FileCheck className="mr-2 h-4 w-4" />
                            Invoices ({invoices?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="documents">
                            <Upload className="mr-2 h-4 w-4" />
                            Documents ({files?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="activity">
                            <History className="mr-2 h-4 w-4" />
                            Activity Logs ({activityLogs?.length || 0})
                        </TabsTrigger>
                    </TabsList>

                    {/* Details Tab */}
                    <TabsContent value="details" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Summary Cards */}
                            <Card className="border-blue-200 bg-blue-50">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-blue-600 font-medium">Status</p>
                                            <div className="mt-2">
                                                <StatusBadge status={checkRequisition.requisition_status} />
                                            </div>
                                        </div>
                                        <Clock className="h-10 w-10 text-blue-300" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-green-200 bg-green-50">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-green-600 font-medium">Amount</p>
                                            <p className="text-lg font-bold text-green-900 mt-1">
                                                {formatCurrency(checkRequisition.php_amount)}
                                            </p>
                                        </div>
                                        <DollarSign className="h-10 w-10 text-green-300" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-purple-200 bg-purple-50">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-purple-600 font-medium">Payee</p>
                                            <p className="text-sm font-semibold text-purple-900 mt-1 truncate">
                                                {checkRequisition.payee_name}
                                            </p>
                                        </div>
                                        <User className="h-10 w-10 text-purple-300" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Requisition Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
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
                                            <p className="text-base font-semibold mt-1">{formatCurrency(checkRequisition.php_amount)}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs text-muted-foreground">Amount in Words</label>
                                            <p className="text-sm mt-1 italic bg-slate-50 p-2 rounded">{checkRequisition.amount_in_words}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted-foreground">Request Date</label>
                                            <p className="text-sm mt-1">{formatDate(checkRequisition.request_date)}</p>
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
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Invoices Tab */}
                    <TabsContent value="invoices">
                        <Card>
                            <CardHeader>
                                <CardTitle>Associated Invoices</CardTitle>
                                <CardDescription>
                                    {invoices?.length || 0} invoice(s) attached to this requisition
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {invoices && invoices.length > 0 ? (
                                    <div className="border rounded-lg overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/50">
                                                    <TableHead>SI Number</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead className="text-right">Invoice Amount</TableHead>
                                                    <TableHead className="text-right">Tax</TableHead>
                                                    <TableHead className="text-right">Discount</TableHead>
                                                    <TableHead className="text-right">Net Amount</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {invoices.map((invoice) => (
                                                    <TableRow key={invoice.id} className="hover:bg-slate-50">
                                                        <TableCell className="font-mono text-sm">
                                                            {invoice.si_number}
                                                        </TableCell>
                                                        <TableCell className="text-sm">
                                                            {formatDate(invoice.si_date)}
                                                        </TableCell>
                                                        <TableCell className="text-sm text-right">
                                                            {formatCurrency(invoice.invoice_amount)}
                                                        </TableCell>
                                                        <TableCell className="text-sm text-right text-red-600">
                                                            {formatCurrency(invoice.tax_amount || 0)}
                                                        </TableCell>
                                                        <TableCell className="text-sm text-right text-green-600">
                                                            {formatCurrency(invoice.discount_amount || 0)}
                                                        </TableCell>
                                                        <TableCell className="text-sm text-right font-medium">
                                                            {formatCurrency(invoice.net_amount)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <StatusBadge status={invoice.invoice_status} size="sm" />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow className="bg-muted/30 font-semibold">
                                                    <TableCell colSpan={5} className="text-right">
                                                        Total:
                                                    </TableCell>
                                                    <TableCell className="text-right text-blue-600">
                                                        {formatCurrency(calculateTotalInvoiceAmount())}
                                                    </TableCell>
                                                    <TableCell>
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
                                ) : (
                                    <div className="text-center py-10 text-slate-500">
                                        <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                                        <p>No invoices attached</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents">
                        <Card>
                            <CardHeader>
                                <CardTitle>Documents</CardTitle>
                                <CardDescription>
                                    All files related to this check requisition
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {files && files.length > 0 ? (
                                    <div className="space-y-3">
                                        {files.map((file) => (
                                            <div
                                                key={file.id}
                                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="p-2 bg-blue-100 rounded">
                                                        <FileText className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{file.file_name}</p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                            <span>{(file.file_size / 1024).toFixed(2)} KB</span>
                                                            <span>•</span>
                                                            <span className="capitalize">{file.file_purpose?.replace('_', ' ')}</span>
                                                            <span>•</span>
                                                            <span>{formatDateTime(file.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleViewFile(file.file_path)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDownloadFile(file)}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-slate-500">
                                        <Upload className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                                        <p>No documents uploaded</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Activity Logs Tab */}
                    <TabsContent value="activity">
                        <Card>
                            <CardHeader>
                                <CardTitle>Activity Logs</CardTitle>
                                <CardDescription>
                                    Complete history of actions on this requisition
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {activityLogs && activityLogs.length > 0 ? (
                                    <div className="space-y-4">
                                        {activityLogs.map((log) => (
                                            <div
                                                key={log.id}
                                                className="flex gap-4 p-4 border rounded-lg"
                                            >
                                                <div className="flex-shrink-0">
                                                    <div className="p-2 bg-slate-100 rounded-full">
                                                        <History className="h-4 w-4 text-slate-600" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-slate-900">
                                                                {log.action}
                                                            </p>
                                                            {log.notes && (
                                                                <p className="text-sm text-slate-600 mt-1">
                                                                    {log.notes}
                                                                </p>
                                                            )}
                                                            {log.changes && (
                                                                <div className="mt-2 p-2 bg-slate-50 rounded text-xs font-mono">
                                                                    {log.changes}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Badge variant="outline" className="text-xs">
                                                            {log.user?.name || 'System'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        {formatDateTime(log.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-slate-500">
                                        <MessageSquare className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                                        <p>No activity logs yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Approval Dialog */}
            <Dialog open={approvalDialog} onOpenChange={setApprovalDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="h-5 w-5" />
                            Approve Check Requisition
                        </DialogTitle>
                        <DialogDescription>
                            Confirm approval of {checkRequisition.requisition_number} for {formatCurrency(checkRequisition.php_amount)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Approval Notes (Optional)</Label>
                            <Textarea
                                value={approvalForm.data.notes}
                                onChange={(e) => approvalForm.setData('notes', e.target.value)}
                                placeholder="Add any approval notes or comments..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setApprovalDialog(false)}
                            disabled={approvalForm.processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleApprove}
                            disabled={approvalForm.processing}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {approvalForm.processing ? 'Approving...' : 'Confirm Approval'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rejection Dialog */}
            <Dialog open={rejectionDialog} onOpenChange={setRejectionDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-700">
                            <XCircle className="h-5 w-5" />
                            Reject Check Requisition
                        </DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting {checkRequisition.requisition_number}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Rejection Reason <span className="text-red-500">*</span></Label>
                            <Textarea
                                value={rejectionForm.data.rejection_reason}
                                onChange={(e) => rejectionForm.setData('rejection_reason', e.target.value)}
                                placeholder="Explain why this requisition is being rejected..."
                                rows={3}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Additional Notes (Optional)</Label>
                            <Textarea
                                value={rejectionForm.data.notes}
                                onChange={(e) => rejectionForm.setData('notes', e.target.value)}
                                placeholder="Any additional information..."
                                rows={2}
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setRejectionDialog(false)}
                            disabled={rejectionForm.processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReject}
                            disabled={rejectionForm.processing}
                            variant="destructive"
                        >
                            {rejectionForm.processing ? 'Rejecting...' : 'Confirm Rejection'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Upload Signed Document Dialog */}
            <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-blue-700">
                            <Upload className="h-5 w-5" />
                            Upload Signed Document
                        </DialogTitle>
                        <DialogDescription>
                            Upload the physically signed check requisition document. This will approve the requisition.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Signed Document <span className="text-red-500">*</span></Label>
                            <Input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                className="mt-1"
                            />
                            {selectedFile && (
                                <div className="mt-2 p-2 bg-blue-50 rounded text-sm flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    <span className="flex-1 truncate">{selectedFile.name}</span>
                                    <span className="text-xs text-blue-600">
                                        {(selectedFile.size / 1024).toFixed(2)} KB
                                    </span>
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                                Accepted formats: PDF, JPG, PNG (Max 10MB)
                            </p>
                        </div>
                        <div>
                            <Label>Notes</Label>
                            <Textarea
                                value={uploadForm.data.notes}
                                onChange={(e) => uploadForm.setData('notes', e.target.value)}
                                placeholder="Add notes about the signed document (e.g., who signed, date signed, etc.)..."
                                rows={3}
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setUploadDialog(false);
                                setSelectedFile(null);
                                uploadForm.reset();
                            }}
                            disabled={uploadForm.processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUploadSignedDoc}
                            disabled={uploadForm.processing || !selectedFile}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {uploadForm.processing ? 'Uploading...' : 'Upload & Approve'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
