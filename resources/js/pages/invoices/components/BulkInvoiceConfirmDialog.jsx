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

export default function BulkInvoiceConfirmDialog({ open, onOpenChange, bulkAction, actionConfig, reviewNotes, setReviewNotes, onConfirm }) {
    const isReject = bulkAction === 'reject';

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-semibold">{actionConfig.title}</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm leading-relaxed">{actionConfig.description}</AlertDialogDescription>
                </AlertDialogHeader>

                {isReject && (
                    <div className="py-3">
                        <Label htmlFor="reject-notes" className="mb-2 block text-sm font-semibold">
                            Reason for rejection
                        </Label>
                        <Textarea
                            id="reject-notes"
                            placeholder="Please provide a detailed reason for rejection..."
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            rows={3}
                            className="resize-none text-sm"
                        />
                    </div>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel className="font-medium">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className={`font-semibold transition-colors ${
                            isReject ? 'bg-destructive hover:bg-destructive/90' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        Confirm
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
