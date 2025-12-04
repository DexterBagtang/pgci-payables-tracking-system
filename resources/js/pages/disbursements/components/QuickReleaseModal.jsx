import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';
import { DatePicker } from '@/components/custom/DatePicker';
import { formatCurrency } from '@/components/custom/helpers';

export default function QuickReleaseModal({ disbursement, open, onClose, onSuccess }) {
    const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [releaseNotes, setReleaseNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [showUndo, setShowUndo] = useState(false);
    const [undoTimeout, setUndoTimeout] = useState(null);

    const handleRelease = async () => {
        setLoading(true);

        try {
            // Get CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

            const response = await fetch(`/api/disbursements/${disbursement.id}/quick-release`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    date_check_released_to_vendor: releaseDate,
                    release_notes: releaseNotes,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Show undo option for 30 seconds
                setShowUndo(true);
                const timeout = setTimeout(() => {
                    setShowUndo(false);
                    onClose();
                    if (onSuccess) onSuccess();
                    router.reload({ only: ['disbursements', 'statistics'] });
                }, 30000);
                setUndoTimeout(timeout);
            } else {
                alert(data.message || 'Failed to release disbursement');
            }
        } catch (error) {
            console.error('Release error:', error);
            alert('Failed to release disbursement');
        } finally {
            setLoading(false);
        }
    };

    const handleUndo = async () => {
        if (undoTimeout) clearTimeout(undoTimeout);
        setLoading(true);

        try {
            // Get CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

            const response = await fetch(`/api/disbursements/${disbursement.id}/undo-release`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
            });

            const data = await response.json();

            if (data.success) {
                setShowUndo(false);
                onClose();
                router.reload({ only: ['disbursements', 'statistics'] });
            } else {
                alert(data.message || 'Failed to undo release');
            }
        } catch (error) {
            console.error('Undo error:', error);
            alert('Failed to undo release');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseAfterRelease = () => {
        // Clear the undo timeout
        if (undoTimeout) clearTimeout(undoTimeout);

        // Close the modal
        setShowUndo(false);
        onClose();

        // Trigger success callback and reload
        if (onSuccess) onSuccess();
        router.reload({ only: ['disbursements', 'statistics'] });
    };

    const formatDateForInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    if (showUndo) {
        return (
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            Disbursement Released Successfully
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Alert>
                            <AlertDescription>
                                The disbursement has been released. This action has:
                                <ul className="mt-2 ml-4 list-disc">
                                    <li>Marked {disbursement.check_requisition_count || 0} check requisition(s) as PAID</li>
                                    <li>Stopped aging calculation for associated invoices</li>
                                    <li>Updated invoice statuses to PAID</li>
                                </ul>
                            </AlertDescription>
                        </Alert>

                        <div className="flex items-center justify-center gap-2 rounded-lg bg-yellow-50 p-4 border border-yellow-200">
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            <span className="text-sm font-medium">
                                You have 30 seconds to undo this action
                            </span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseAfterRelease}>
                            Close
                        </Button>
                        <Button variant="destructive" onClick={handleUndo} disabled={loading}>
                            {loading ? 'Undoing...' : 'Undo Release'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Quick Release Check</DialogTitle>
                    <DialogDescription>
                        Release {disbursement.check_voucher_number} to vendor
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Impact Summary */}
                    <Alert>
                        <AlertDescription>
                            <p className="font-semibold mb-2">This action will:</p>
                            <ul className="ml-4 list-disc text-sm space-y-1">
                                <li>Mark {disbursement.check_requisition_count || 0} check requisition(s) as PAID</li>
                                <li>Stop aging calculation for invoices</li>
                                <li>Update invoice statuses to PAID</li>
                                <li>Total amount: {formatCurrency(disbursement.total_amount || 0)}</li>
                            </ul>
                        </AlertDescription>
                    </Alert>

                    {/* Release Date */}
                    <div className="space-y-2">
                        <Label htmlFor="release_date">Release Date</Label>
                        <DatePicker
                            value={releaseDate}
                            onChange={(date) => setReleaseDate(formatDateForInput(date))}
                            placeholder="Select release date"
                        />
                    </div>

                    {/* Release Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="release_notes">Release Notes (Optional)</Label>
                        <Textarea
                            id="release_notes"
                            value={releaseNotes}
                            onChange={(e) => setReleaseNotes(e.target.value)}
                            placeholder="Add any notes about this release..."
                            rows={3}
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-500">
                            {releaseNotes.length}/500 characters
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleRelease} disabled={loading}>
                        {loading ? 'Releasing...' : 'Confirm Release'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
