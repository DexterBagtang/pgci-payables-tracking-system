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
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
    ChevronDown,
    ChevronUp,
    AlertTriangle,
    CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import StatusBadge from '@/components/custom/StatusBadge.jsx';
import BackButton from '@/components/custom/BackButton.jsx';
import ActivityTimeline from '@/components/custom/ActivityTimeline.jsx';

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

    const [invoicesExpanded, setInvoicesExpanded] = useState(false);
    const [detailsExpanded, setDetailsExpanded] = useState(false);
    const [documentsExpanded, setDocumentsExpanded] = useState(false);
    const [activityExpanded, setActivityExpanded] = useState(false);

    const canApprove = checkRequisition.requisition_status === 'pending_approval';
    const isApproved = checkRequisition.requisition_status === 'approved';
    const isRejected = checkRequisition.requisition_status === 'rejected';

    // Validation checks
    const allInvoicesReady = invoices?.every(inv => inv.invoice_status === 'pending_disbursement') || false;
    const hasInvoices = invoices && invoices.length > 0;
    const hasPurpose = checkRequisition.purpose && checkRequisition.purpose.trim().length > 0;
    const hasRequestedBy = checkRequisition.requested_by && checkRequisition.requested_by.trim().length > 0;

    const validationChecks = [
        {
            label: 'Amount matches invoices',
            passed: isAmountMatching(),
            critical: true,
        },
        {
            label: 'All invoices ready for disbursement',
            passed: allInvoicesReady,
            critical: true,
        },
        {
            label: 'Has associated invoices',
            passed: hasInvoices,
            critical: true,
        },
        {
            label: 'Purpose documented',
            passed: hasPurpose,
            critical: false,
        },
        {
            label: 'Requester identified',
            passed: hasRequestedBy,
            critical: false,
        },
    ];

    const criticalChecksPassed = validationChecks.filter(check => check.critical).every(check => check.passed);
    const allChecksPassed = validationChecks.every(check => check.passed);

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title={`Review - ${checkRequisition.requisition_number}`} />

            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-[1800px] mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <BackButton />
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-lg font-semibold text-slate-800">
                                        Review Check Requisition
                                    </h1>
                                    <StatusBadge status={checkRequisition.requisition_status} />
                                </div>
                                <p className="text-sm text-slate-600 mt-0.5">
                                    {checkRequisition.requisition_number} • {checkRequisition.payee_name} • {formatCurrency(checkRequisition.php_amount)}
                                </p>
                            </div>
                        </div>

                        {mainPdfFile && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadFile(mainPdfFile)}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Alerts */}
            <div className="max-w-[1800px] mx-auto px-6 py-4">
                {isApproved && (
                    <Alert className="border-green-200 bg-green-50 mb-4">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Approved</AlertTitle>
                        <AlertDescription className="text-green-700">
                            This check requisition was approved on {formatDateTime(checkRequisition.approved_at)}
                        </AlertDescription>
                    </Alert>
                )}

                {isRejected && (
                    <Alert className="border-red-200 bg-red-50 mb-4">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertTitle className="text-red-800">Rejected</AlertTitle>
                        <AlertDescription className="text-red-700">
                            This check requisition was rejected. Check activity logs for details.
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            {/* Split Screen Layout */}
            <div className="max-w-[1800px] mx-auto px-6 pb-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left Panel - PDF Viewer */}
                    <div>
                        <Card className="h-[calc(100vh-180px)] flex flex-col">
                            <CardHeader className="py-2 px-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm">Document Preview</CardTitle>
                                    {mainPdfFile && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleViewFile(mainPdfFile.file_path)}
                                            className="h-7 text-xs"
                                        >
                                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                                            Open in New Tab
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 p-0 overflow-hidden">
                                {mainPdfFile ? (
                                    <iframe
                                        src={`/storage/${mainPdfFile.file_path}#toolbar=0`}
                                        className="w-full h-full border-0"
                                        title="Check Requisition PDF"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                        <FileText className="h-12 w-12 mb-2" />
                                        <p className="text-sm">No PDF document available</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Panel - Review Information */}
                    <div className="flex flex-col h-[calc(100vh-180px)]">
                        {/* Validation Checklist - Compact */}
                        <Card className={!isAmountMatching() || !allInvoicesReady ? 'border-amber-200 mb-3' : 'border-slate-200 mb-3'}>
                            <CardHeader className="py-2 px-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        {allChecksPassed ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        ) : criticalChecksPassed ? (
                                            <AlertCircle className="h-4 w-4 text-amber-600" />
                                        ) : (
                                            <AlertTriangle className="h-4 w-4 text-red-600" />
                                        )}
                                        Validation
                                    </CardTitle>
                                    <Badge variant={allChecksPassed ? 'default' : criticalChecksPassed ? 'secondary' : 'destructive'} className="text-xs h-5">
                                        {validationChecks.filter(c => c.passed).length}/{validationChecks.length}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-1.5 pt-0 pb-2 px-3">
                                {validationChecks.map((check, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center justify-between p-2 rounded ${
                                            check.passed
                                                ? 'bg-green-50 border border-green-200'
                                                : check.critical
                                                    ? 'bg-red-50 border border-red-200'
                                                    : 'bg-amber-50 border border-amber-200'
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            {check.passed ? (
                                                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                                            ) : (
                                                <XCircle className="h-3.5 w-3.5 text-red-600" />
                                            )}
                                            <span className={`text-xs font-medium ${
                                                check.passed ? 'text-green-800' : 'text-red-800'
                                            }`}>
                                                {check.label}
                                            </span>
                                        </div>
                                        {check.critical && !check.passed && (
                                            <Badge variant="destructive" className="text-xs h-4 px-1.5">Critical</Badge>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Compact Summary */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            <Card className="border-slate-200">
                                <CardContent className="p-2">
                                    <p className="text-xs text-slate-600 font-medium">Amount</p>
                                    <p className="text-base font-bold text-slate-900">
                                        {formatCurrency(checkRequisition.php_amount)}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="border-slate-200">
                                <CardContent className="p-2">
                                    <p className="text-xs text-slate-600 font-medium">Invoices</p>
                                    <p className="text-base font-bold text-slate-900">
                                        {invoices?.length || 0}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="border-slate-200">
                                <CardContent className="p-2">
                                    <p className="text-xs text-slate-600 font-medium">Date</p>
                                    <p className="text-xs font-semibold text-slate-900">
                                        {formatDate(checkRequisition.request_date)}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Scrollable Details Section */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1"
                             style={{ scrollbarWidth: 'thin' }}>

                            {/* Invoices Summary - Collapsible */}
                            <Collapsible open={invoicesExpanded} onOpenChange={setInvoicesExpanded}>
                                <Card className="border-slate-200">
                                    <CollapsibleTrigger className="w-full">
                                        <CardHeader className="py-2 px-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <FileCheck className="h-3.5 w-3.5 text-slate-600" />
                                                    <CardTitle className="text-sm">
                                                        Invoices ({invoices?.length || 0})
                                                    </CardTitle>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs text-slate-600">Total:</span>
                                                        <span className={`text-xs font-bold ${
                                                            isAmountMatching() ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                            {formatCurrency(calculateTotalInvoiceAmount())}
                                                        </span>
                                                        {isAmountMatching() ? (
                                                            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                                                        ) : (
                                                            <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                                                        )}
                                                    </div>
                                                    {invoicesExpanded ? (
                                                        <ChevronUp className="h-3.5 w-3.5 text-slate-600" />
                                                    ) : (
                                                        <ChevronDown className="h-3.5 w-3.5 text-slate-600" />
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="pt-0 px-3 pb-3">
                                            {invoices && invoices.length > 0 ? (
                                                <div className="border rounded overflow-hidden">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow className="bg-muted/50">
                                                                <TableHead className="text-xs py-2">SI Number</TableHead>
                                                                <TableHead className="text-xs py-2">Date</TableHead>
                                                                <TableHead className="text-xs text-right py-2">Net Amount</TableHead>
                                                                <TableHead className="text-xs py-2">Status</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {invoices.map((invoice) => (
                                                                <TableRow key={invoice.id}>
                                                                    <TableCell className="font-mono text-xs py-1.5">
                                                                        {invoice.si_number}
                                                                    </TableCell>
                                                                    <TableCell className="text-xs py-1.5">
                                                                        {formatDate(invoice.si_date)}
                                                                    </TableCell>
                                                                    <TableCell className="text-xs text-right font-medium py-1.5">
                                                                        {formatCurrency(invoice.net_amount)}
                                                                    </TableCell>
                                                                    <TableCell className="py-1.5">
                                                                        <StatusBadge status={invoice.invoice_status} size="sm" />
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 text-slate-400">
                                                    <FileText className="mx-auto h-8 w-8 mb-1.5" />
                                                    <p className="text-xs">No invoices attached</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>

                            {/* Details - Collapsible */}
                            <Collapsible open={detailsExpanded} onOpenChange={setDetailsExpanded}>
                                <Card className="border-slate-200">
                                    <CollapsibleTrigger className="w-full">
                                        <CardHeader className="py-2 px-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-3.5 w-3.5 text-slate-600" />
                                                    <CardTitle className="text-sm">Full Details</CardTitle>
                                                </div>
                                                {detailsExpanded ? (
                                                    <ChevronUp className="h-3.5 w-3.5 text-slate-600" />
                                                ) : (
                                                    <ChevronDown className="h-3.5 w-3.5 text-slate-600" />
                                                )}
                                            </div>
                                        </CardHeader>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="pt-0 px-3 pb-3 space-y-2">
                                            <div>
                                                <label className="text-xs text-muted-foreground font-medium">Purpose</label>
                                                <p className="text-xs mt-1 bg-slate-50 p-2 rounded whitespace-pre-wrap">
                                                    {checkRequisition.purpose}
                                                </p>
                                            </div>
                                            <Separator />
                                            <div className="grid grid-cols-3 gap-2">
                                                <div>
                                                    <label className="text-xs text-muted-foreground font-medium">PO Number</label>
                                                    <p className="text-xs font-mono mt-1">{checkRequisition.po_number || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-muted-foreground font-medium">CER Number</label>
                                                    <p className="text-xs font-mono mt-1">{checkRequisition.cer_number || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-muted-foreground font-medium">SI Number</label>
                                                    <p className="text-xs font-mono mt-1">{checkRequisition.si_number || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <Separator />
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="bg-blue-50 p-2 rounded border border-blue-200">
                                                    <label className="text-xs text-blue-600 font-medium">Requested By</label>
                                                    <p className="text-xs font-medium mt-1">{checkRequisition.requested_by}</p>
                                                </div>
                                                <div className="bg-purple-50 p-2 rounded border border-purple-200">
                                                    <label className="text-xs text-purple-600 font-medium">Reviewed By</label>
                                                    <p className="text-xs font-medium mt-1">{checkRequisition.reviewed_by || 'Pending'}</p>
                                                </div>
                                                <div className="bg-green-50 p-2 rounded border border-green-200">
                                                    <label className="text-xs text-green-600 font-medium">Approved By</label>
                                                    <p className="text-xs font-medium mt-1">{checkRequisition.approved_by || 'Pending'}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>

                            {/* Documents - Collapsible */}
                            <Collapsible open={documentsExpanded} onOpenChange={setDocumentsExpanded}>
                                <Card className="border-slate-200">
                                    <CollapsibleTrigger className="w-full">
                                        <CardHeader className="py-2 px-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Upload className="h-3.5 w-3.5 text-slate-600" />
                                                    <CardTitle className="text-sm">Documents ({files?.length || 0})</CardTitle>
                                                </div>
                                                {documentsExpanded ? (
                                                    <ChevronUp className="h-3.5 w-3.5 text-slate-600" />
                                                ) : (
                                                    <ChevronDown className="h-3.5 w-3.5 text-slate-600" />
                                                )}
                                            </div>
                                        </CardHeader>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="pt-0 px-3 pb-3">
                                            {files && files.length > 0 ? (
                                                <div className="space-y-1.5">
                                                    {files.map((file) => (
                                                        <div
                                                            key={file.id}
                                                            className="flex items-center justify-between p-2 border rounded hover:bg-slate-50"
                                                        >
                                                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                                <FileText className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-medium truncate">{file.file_name}</p>
                                                                    <p className="text-xs text-muted-foreground">{(file.file_size / 1024).toFixed(2)} KB</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleViewFile(file.file_path)}
                                                                    className="h-6 w-6 p-0"
                                                                >
                                                                    <Eye className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDownloadFile(file)}
                                                                    className="h-6 w-6 p-0"
                                                                >
                                                                    <Download className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 text-slate-400">
                                                    <Upload className="mx-auto h-8 w-8 mb-1.5" />
                                                    <p className="text-xs">No additional documents</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>

                            {/* Activity Logs - Collapsible */}
                            <Collapsible open={activityExpanded} onOpenChange={setActivityExpanded}>
                                <Card className="border-slate-200">
                                    <CollapsibleTrigger className="w-full">
                                        <CardHeader className="py-2 px-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <History className="h-3.5 w-3.5 text-slate-600" />
                                                    <CardTitle className="text-sm">Activity Logs ({activityLogs?.length || 0})</CardTitle>
                                                </div>
                                                {activityExpanded ? (
                                                    <ChevronUp className="h-3.5 w-3.5 text-slate-600" />
                                                ) : (
                                                    <ChevronDown className="h-3.5 w-3.5 text-slate-600" />
                                                )}
                                            </div>
                                        </CardHeader>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="pt-0 px-3 pb-3">
                                            <ActivityTimeline activity_logs={activityLogs} />
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>
                        </div>

                        {/* Fixed Action Panel */}
                        {canApprove && (
                            <Card className="border-slate-300 bg-white shadow-lg mt-3">
                                <CardContent className="p-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-slate-900">Ready to review?</p>
                                            <p className="text-xs text-slate-600 truncate">
                                                {criticalChecksPassed
                                                    ? 'All critical validations passed'
                                                    : 'Critical checks failed'}
                                            </p>
                                        </div>
                                        <div className="flex gap-1.5 flex-shrink-0">
                                            <Button
                                                variant="outline"
                                                onClick={() => setUploadDialog(true)}
                                                size="sm"
                                                className="border-blue-300 text-blue-700 hover:bg-blue-50 h-8 text-xs"
                                            >
                                                <Upload className="mr-1.5 h-3.5 w-3.5" />
                                                Upload
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => setRejectionDialog(true)}
                                                size="sm"
                                                className="border-red-300 text-red-700 hover:bg-red-50 h-8 text-xs"
                                            >
                                                <XCircle className="mr-1.5 h-3.5 w-3.5" />
                                                Reject
                                            </Button>
                                            <Button
                                                onClick={() => setApprovalDialog(true)}
                                                disabled={!criticalChecksPassed}
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700 disabled:bg-slate-300 h-8 text-xs"
                                            >
                                                <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                                                Approve
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
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
