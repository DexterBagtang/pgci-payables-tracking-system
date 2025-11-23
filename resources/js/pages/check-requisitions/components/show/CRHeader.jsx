import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/custom/StatusBadge';
import BackButton from '@/components/custom/BackButton';
import { Edit, Download, Printer, Copy, SearchCheck } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Check Requisition Header Component
 * Displays CR number, status, and action buttons
 * Principle: Single Responsibility - Only handles header display and actions
 */
export default function CRHeader({
    checkRequisition,
    formatDate,
    formatCurrency,
    mainPdfFile,
    onEdit,
    onReview
}) {
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

    const handleCopyReqNumber = () => {
        navigator.clipboard.writeText(checkRequisition.requisition_number);
        toast.success('Requisition number copied');
    };

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

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                {/* Title & Status */}
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900">
                            Check Requisition #{checkRequisition.requisition_number}
                        </h1>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopyReqNumber}
                            className="h-6 px-2"
                        >
                            <Copy className="h-3 w-3" />
                        </Button>
                        <StatusBadge status={checkRequisition.requisition_status} />
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <span>Date: {formatDate(checkRequisition.request_date)}</span>
                        <span>Payee: {checkRequisition.payee_name}</span>
                        <span className="font-semibold text-green-600">
                            {formatCurrency(checkRequisition.php_amount)}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-shrink-0 flex-wrap gap-2">
                    <BackButton />

                    {checkRequisition.requisition_status === 'pending_approval' && (
                        <Button variant="outline" size="sm" onClick={onReview}>
                            <SearchCheck className="mr-2 h-4 w-4" />
                            Review
                        </Button>
                    )}

                    <Button variant="outline" size="sm" onClick={onEdit}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>

                    {mainPdfFile && (
                        <>
                            <Button variant="outline" size="sm" onClick={handlePrintPdf}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </Button>
                        </>
                    )}

                    <Button variant="outline" size="sm" onClick={handleCopyDetails}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Details
                    </Button>
                </div>
            </div>
        </div>
    );
}
