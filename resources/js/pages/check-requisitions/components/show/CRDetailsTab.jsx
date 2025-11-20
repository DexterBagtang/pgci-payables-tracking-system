import { Separator } from '@/components/ui/separator';

/**
 * Check Requisition Details Tab
 * Displays payment info, accounting details, references, purpose, and signatories
 * Principle: Single Responsibility - Only handles details tab content
 */
export default function CRDetailsTab({
    checkRequisition,
    purchaseOrder,
    formatDate,
    formatCurrency
}) {
    return (
        <div className="space-y-6">
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
                        <p className="text-base font-semibold mt-1 text-blue-600">
                            {formatCurrency(checkRequisition.php_amount)}
                        </p>
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs text-muted-foreground">Amount in Words</label>
                        <p className="text-sm mt-1 italic bg-slate-50 p-2 rounded">
                            {checkRequisition.amount_in_words}
                        </p>
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
                        <p className="text-sm mt-1 font-mono bg-slate-50 p-2 rounded">
                            {checkRequisition.account_charge || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground">Service Line Distribution</label>
                        <p className="text-sm mt-1 bg-slate-50 p-2 rounded">
                            {checkRequisition.service_line_dist || 'N/A'}
                        </p>
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
                        <p className="text-sm font-mono mt-1 bg-slate-50 p-2 rounded">
                            {checkRequisition.po_number || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground">CER Number</label>
                        <p className="text-sm font-mono mt-1 bg-slate-50 p-2 rounded">
                            {checkRequisition.cer_number || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground">SI Number</label>
                        <p className="text-sm font-mono mt-1 bg-slate-50 p-2 rounded">
                            {checkRequisition.si_number || 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Purpose */}
            <div>
                <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">
                    Purpose
                </h3>
                <p className="text-sm whitespace-pre-wrap bg-slate-50 p-3 rounded">
                    {checkRequisition.purpose}
                </p>
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
        </div>
    );
}
