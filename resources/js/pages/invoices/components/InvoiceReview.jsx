import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox.js';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label.js';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea.js';
import { useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle,
    ClipboardCheck,
    Clock,
    Edit3,
    History,
    MessageSquare,
    Plus,
    Send,
    User,
    XCircle
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const InvoiceReview = ({
                           invoice,
                           canReviewInvoice,
                           isAlreadyReviewed,
                           activityLogs,
                           onTabChange
                       }) => {
    const [showReviewDialog, setShowReviewDialog] = useState(false);

    // Filter review logs
    const reviewLogs = activityLogs ? activityLogs.filter(log => ['approved', 'rejected','bulk_reject'].includes(log.action)) : [];
    const latestReview = reviewLogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

    if (!canReviewInvoice) {
        return <NoPermissionCard />;
    }

    if (isAlreadyReviewed) {
        return (
            <div className="space-y-4">
                <ApprovedStatusCard latestReview={latestReview} onTabChange={onTabChange} />
                {reviewLogs.length > 1 && <ReviewHistoryCard reviewLogs={reviewLogs} />}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <ReviewActionCard
                invoice={invoice}
                reviewLogs={reviewLogs}
                onOpenDialog={() => setShowReviewDialog(true)}
            />

            <ReviewDialog
                invoice={invoice}
                isOpen={showReviewDialog}
                onClose={() => setShowReviewDialog(false)}
            />

            {reviewLogs.length > 0 && <ReviewHistoryCard reviewLogs={reviewLogs} />}
        </div>
    );
};

const ReviewActionCard = ({ invoice, reviewLogs, onOpenDialog }) => {
    return (
        <Card>
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                        <ClipboardCheck className="mr-3 h-5 w-5 text-blue-600" />
                        <span>Review Invoice</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                        Pending Review
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ClipboardCheck className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">Ready for Review</h3>
                            <p className="text-sm text-gray-600 mb-3">
                                This invoice is awaiting accounting review and approval. Please verify all documents and amounts before proceeding.
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>Invoice: #{invoice.si_number}</span>
                                <span>Amount: {invoice.currency === 'USD' ? '$' : '₱'}{Number(invoice.invoice_amount).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <Button onClick={onOpenDialog} className="w-full">
                            <Edit3 className="mr-2 h-4 w-4" />
                            Submit Review
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const ReviewDialog = ({ invoice, isOpen, onClose }) => {
    const { data, setData, post, processing, reset } = useForm({
        physicalFilesReceived: false,
        approvalStatus: '',
        remarks: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        post(`/invoices/${invoice.id}/review`, {
            onSuccess: () => {
                toast.success('Review submitted successfully!');
                reset();
                onClose();
            },
            onError: (e) => {
                toast.error(e.message || 'Failed to submit review');
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <ClipboardCheck className="mr-2 h-5 w-5 text-blue-600" />
                        Review Invoice #{invoice.si_number}
                    </DialogTitle>
                    <DialogDescription>
                        Please verify all documents and provide your review decision
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Physical Files Verification */}
                    <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                            <Checkbox
                                id="physicalFiles"
                                checked={data.physicalFilesReceived}
                                onCheckedChange={(checked) => setData('physicalFilesReceived', checked)}
                                className="mt-0.5"
                            />
                            <div className="flex-1">
                                <Label htmlFor="physicalFiles" className="text-sm font-medium cursor-pointer">
                                    Physical documents verified
                                </Label>
                                <p className="text-xs text-gray-600 mt-1">
                                    Confirm all physical files have been received and verified
                                </p>
                            </div>
                        </div>

                        {!data.physicalFilesReceived && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                                <div className="flex items-center">
                                    <AlertTriangle className="mr-2 h-4 w-4 flex-shrink-0" />
                                    <span>Document verification required</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Review Decision */}
                    {data.physicalFilesReceived && (
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">Review Decision</Label>
                            <RadioGroup
                                value={data.approvalStatus}
                                onValueChange={(value) => setData('approvalStatus', value)}
                                className="space-y-2"
                            >
                                <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-green-50 transition-colors">
                                    <RadioGroupItem value="approved" id="approved" />
                                    <div className="flex items-center space-x-2 flex-1">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <Label htmlFor="approved" className="text-sm font-medium text-green-900 cursor-pointer">
                                                Approve Invoice
                                            </Label>
                                            <p className="text-xs text-green-600">Invoice meets all requirements</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-red-50 transition-colors">
                                    <RadioGroupItem value="rejected" id="rejected" />
                                    <div className="flex items-center space-x-2 flex-1">
                                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                            <XCircle className="h-4 w-4 text-red-600" />
                                        </div>
                                        <div>
                                            <Label htmlFor="rejected" className="text-sm font-medium text-red-900 cursor-pointer">
                                                Reject Invoice
                                            </Label>
                                            <p className="text-xs text-red-600">Invoice requires corrections</p>
                                        </div>
                                    </div>
                                </div>
                            </RadioGroup>
                        </div>
                    )}

                    {/* Comments */}
                    {data.approvalStatus && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center">
                                Comments
                                {data.approvalStatus === 'rejected' && <span className="ml-1 text-red-500">*</span>}
                                {data.approvalStatus === 'approved' && (
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Optional</span>
                                )}
                            </Label>
                            <Textarea
                                value={data.remarks}
                                onChange={(e) => setData('remarks', e.target.value)}
                                placeholder={
                                    data.approvalStatus === 'rejected'
                                        ? 'Please specify issues that need to be addressed...'
                                        : 'Any additional notes or observations (optional)...'
                                }
                                className="min-h-[80px] resize-none"
                                required={data.approvalStatus === 'rejected'}
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className={
                                data.approvalStatus === 'approved'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : data.approvalStatus === 'rejected'
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : ''
                            }
                            disabled={
                                !data.physicalFilesReceived ||
                                !data.approvalStatus ||
                                (data.approvalStatus === 'rejected' && !data.remarks.trim()) ||
                                processing
                            }
                        >
                            {processing ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    {data.approvalStatus === 'approved' ? 'Approve' :
                                        data.approvalStatus === 'rejected' ? 'Reject' : 'Submit'}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const ApprovedStatusCard = ({ latestReview, onTabChange }) => {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-green-900">Invoice Approved</h3>
                            <Badge className="bg-green-100 text-green-800 text-xs">
                                Approved
                            </Badge>
                        </div>
                        <p className="text-sm text-green-700 mb-3">
                            This invoice has been reviewed and approved. You can now proceed to create check requisitions.
                        </p>

                        {latestReview && (
                            <div className="text-xs text-gray-600 mb-4 space-y-1">
                                <div>Reviewed by {latestReview.user.name} on {new Date(latestReview.created_at).toLocaleDateString()}</div>
                                {latestReview.notes && (
                                    <div className="bg-green-50 rounded p-2 mt-2">
                                        <span className="font-medium">Comments:</span> {latestReview.notes}
                                    </div>
                                )}
                            </div>
                        )}

                        <Button
                            onClick={() => onTabChange('requisitions')}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Create Check Requisition
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const ReviewHistoryCard = ({ reviewLogs }) => {
    const [showAll, setShowAll] = useState(false);
    const displayLogs = showAll ? reviewLogs : reviewLogs.slice(0, 2);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm">
                    <History className="mr-2 h-4 w-4 text-gray-600" />
                    Review History
                    <Badge variant="outline" className="ml-2 text-xs">
                        {reviewLogs.length}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {displayLogs
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .map((log, index) => (
                        <div key={log.id} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-b-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                log.action === 'approved' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                                {log.action === 'approved' ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                    <XCircle className="h-4 w-4 text-red-600" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                        log.action === 'approved'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                                    </span>
                                    {index === 0 && <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">Latest</span>}
                                </div>
                                <div className="text-sm text-gray-900 mb-1">
                                    {log.user.name} <span className="text-gray-500">({log.user.role})</span>
                                </div>
                                <div className="text-xs text-gray-500 mb-2">
                                    {new Date(log.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                                {log.notes && (
                                    <div className="bg-gray-50 rounded p-2 text-xs text-gray-700">
                                        {log.notes}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                }

                {reviewLogs.length > 2 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAll(!showAll)}
                        className="w-full text-xs"
                    >
                        {showAll ? 'Show Less' : `Show ${reviewLogs.length - 2} More`}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

const NoPermissionCard = () => {
    return (
        <Card>
            <CardContent className="py-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ClipboardCheck className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
                <p className="text-gray-600 text-sm max-w-sm mx-auto">
                    You don't have the necessary permissions to review this invoice.
                    Contact your administrator if you believe this is an error.
                </p>
            </CardContent>
        </Card>
    );
};

export default InvoiceReview;
