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
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { DatePicker } from '@/components/custom/DatePicker';
import { formatCurrency } from '@/components/custom/helpers';

export default function BulkReleaseModal({ selectedDisbursements, open, onClose, onSuccess }) {
    const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [releaseNotes, setReleaseNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const totalAmount = selectedDisbursements.reduce((sum, d) => sum + (d.total_amount || 0), 0);
    const totalCRs = selectedDisbursements.reduce((sum, d) => sum + (d.check_requisition_count || 0), 0);

    const handleBulkRelease = async () => {
        setLoading(true);

        try {
            // Get CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

            const response = await fetch('/api/disbursements/bulk-release', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    disbursement_ids: selectedDisbursements.map(d => d.id),
                    date_check_released_to_vendor: releaseDate,
                    release_notes: releaseNotes,
                }),
            });

            const data = await response.json();

            if (data.success) {
                onClose();
                if (onSuccess) onSuccess();
                router.reload({ only: ['disbursements', 'statistics'] });

                // Show success notification
                alert(`Successfully released ${data.released_count} disbursement(s)`);
            } else {
                alert(data.message || 'Failed to release disbursements');
            }
        } catch (error) {
            console.error('Bulk release error:', error);
            alert('Failed to release disbursements');
        } finally {
            setLoading(false);
        }
    };

    const formatDateForInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Bulk Release Checks</DialogTitle>
                    <DialogDescription>
                        Release {selectedDisbursements.length} disbursement(s) to vendors
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Summary Card */}
                    <div className="rounded-lg border bg-blue-50 p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Release Summary</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">Disbursements</p>
                                <p className="text-lg font-bold text-blue-900">{selectedDisbursements.length}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Check Requisitions</p>
                                <p className="text-lg font-bold text-blue-900">{totalCRs}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Total Amount</p>
                                <p className="text-lg font-bold text-blue-900">{formatCurrency(totalAmount)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Disbursements List */}
                    <div className="max-h-60 overflow-y-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-gray-50">
                                <tr>
                                    <th className="p-2 text-left">Check Voucher</th>
                                    <th className="p-2 text-right">Amount</th>
                                    <th className="p-2 text-center">CRs</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedDisbursements.map((disbursement) => (
                                    <tr key={disbursement.id} className="border-t hover:bg-gray-50">
                                        <td className="p-2 font-medium">{disbursement.check_voucher_number}</td>
                                        <td className="p-2 text-right">{formatCurrency(disbursement.total_amount || 0)}</td>
                                        <td className="p-2 text-center">{disbursement.check_requisition_count || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Impact Warning */}
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            <p className="font-semibold mb-2">This action will:</p>
                            <ul className="ml-4 list-disc text-sm space-y-1">
                                <li>Mark all associated check requisitions as PAID</li>
                                <li>Stop aging calculation for all associated invoices</li>
                                <li>Update all invoice statuses to PAID</li>
                                <li>This action can be undone individually within 30 seconds</li>
                            </ul>
                        </AlertDescription>
                    </Alert>

                    {/* Release Date */}
                    <div className="space-y-2">
                        <Label htmlFor="bulk_release_date">Release Date</Label>
                        <DatePicker
                            value={releaseDate}
                            onChange={(date) => setReleaseDate(formatDateForInput(date))}
                            placeholder="Select release date"
                        />
                    </div>

                    {/* Release Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="bulk_release_notes">Release Notes (Optional)</Label>
                        <Textarea
                            id="bulk_release_notes"
                            value={releaseNotes}
                            onChange={(e) => setReleaseNotes(e.target.value)}
                            placeholder="Add any notes about this bulk release..."
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
                    <Button onClick={handleBulkRelease} disabled={loading}>
                        {loading ? 'Releasing...' : `Release ${selectedDisbursements.length} Disbursement(s)`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
