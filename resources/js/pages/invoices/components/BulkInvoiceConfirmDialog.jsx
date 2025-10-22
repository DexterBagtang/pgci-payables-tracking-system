import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle, FileCheck, AlertTriangle } from 'lucide-react';

export default function BulkInvoiceConfirmDialog({ open, onOpenChange, bulkAction, actionConfig, reviewNotes, setReviewNotes, onConfirm }) {
    const isReject = bulkAction === 'reject';
    const isApprove = bulkAction === 'approve';
    const isMarkReceived = bulkAction === 'mark-received';

    const getActionIcon = () => {
        if (isReject) return <XCircle className="h-12 w-12 text-red-600" />;
        if (isApprove) return <CheckCircle2 className="h-12 w-12 text-emerald-600" />;
        if (isMarkReceived) return <FileCheck className="h-12 w-12 text-blue-600" />;
        return <AlertTriangle className="h-12 w-12 text-amber-600" />;
    };

    const getActionColor = () => {
        if (isReject) return 'red';
        if (isApprove) return 'emerald';
        if (isMarkReceived) return 'blue';
        return 'amber';
    };

    const actionColor = getActionColor();

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-lg">
                <AlertDialogHeader>
                    {/* Enhanced Icon Display */}
                    <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-${actionColor}-100 to-${actionColor}-200 shadow-lg`}>
                        {getActionIcon()}
                    </div>

                    <AlertDialogTitle className="text-center text-2xl font-bold text-slate-900">
                        {actionConfig.title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center text-base leading-relaxed text-slate-600 pt-2">
                        {actionConfig.description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {/* Enhanced Note Input for Reject Action */}
                {isReject && (
                    <div className="py-4">
                        <div className="rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-white p-4">
                            <Label htmlFor="reject-notes" className="mb-3 flex items-center gap-2 text-sm font-bold text-red-900">
                                <div className="rounded-md bg-red-100 p-1.5">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                </div>
                                <div>
                                    <div>Reason for Rejection</div>
                                    <p className="text-xs font-normal text-red-700">Please provide detailed explanation</p>
                                </div>
                            </Label>
                            <Textarea
                                id="reject-notes"
                                placeholder="Enter the reason for rejecting these invoices...&#10;&#10;• Missing documentation&#10;• Incorrect amounts&#10;• Policy violations&#10;• Other issues"
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                rows={5}
                                className="resize-none border-2 border-red-200 bg-white text-sm shadow-sm focus-visible:ring-red-400 placeholder:text-slate-400 font-mono"
                            />
                        </div>
                    </div>
                )}

                {/* Enhanced Note Input for Approve Action */}
                {isApprove && (
                    <div className="py-4">
                        <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4">
                            <Label htmlFor="approve-notes" className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-900">
                                <div className="rounded-md bg-emerald-100 p-1.5">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                </div>
                                <div>
                                    <div>Approval Notes (Optional)</div>
                                    <p className="text-xs font-normal text-emerald-700">Add any additional comments</p>
                                </div>
                            </Label>
                            <Textarea
                                id="approve-notes"
                                placeholder="Add approval notes (optional)...&#10;&#10;• Verified all documentation&#10;• Amounts match PO&#10;• Ready for payment"
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                rows={5}
                                className="resize-none border-2 border-emerald-200 bg-white text-sm shadow-sm focus-visible:ring-emerald-400 placeholder:text-slate-400 font-mono"
                            />
                        </div>
                    </div>
                )}

                {/* Enhanced Note Input for Mark Received Action */}
                {isMarkReceived && (
                    <div className="py-4">
                        <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4">
                            <Label htmlFor="received-notes" className="mb-3 flex items-center gap-2 text-sm font-bold text-blue-900">
                                <div className="rounded-md bg-blue-100 p-1.5">
                                    <FileCheck className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <div>Receipt Notes (Optional)</div>
                                    <p className="text-xs font-normal text-blue-700">Document file receipt details</p>
                                </div>
                            </Label>
                            <Textarea
                                id="received-notes"
                                placeholder="Add receipt notes (optional)...&#10;&#10;• Files received date&#10;• Condition of documents&#10;• Special observations"
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                rows={5}
                                className="resize-none border-2 border-blue-200 bg-white text-sm shadow-sm focus-visible:ring-blue-400 placeholder:text-slate-400 font-mono"
                            />
                        </div>
                    </div>
                )}

                {/* Enhanced Footer */}
                <AlertDialogFooter className="gap-2 sm:gap-2">
                    <AlertDialogCancel className="font-semibold border-2 hover:bg-slate-100 transition-all">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className={`font-bold shadow-md transition-all ${
                            isReject
                                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                                : isApprove
                                ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
                                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                        }`}
                    >
                        {isReject && <XCircle className="mr-2 h-4 w-4" />}
                        {isApprove && <CheckCircle2 className="mr-2 h-4 w-4" />}
                        {isMarkReceived && <FileCheck className="mr-2 h-4 w-4" />}
                        Confirm {isReject ? 'Rejection' : isApprove ? 'Approval' : 'Action'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
