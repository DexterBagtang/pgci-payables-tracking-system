import { useCallback, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog.js';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useForm, router } from '@inertiajs/react';
import { AlertCircle, Lock, Upload, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ClosePurchaseOrderDialog({ open, onOpenChange, purchaseOrder }) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        closure_remarks: '',
        files: [],
        force_close: false,
    });

    const handleClose = useCallback(() => {
        reset();
        setSelectedFiles([]);
        setShowConfirmation(false);
        onOpenChange(false);
    }, [onOpenChange, reset]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
        setData('files', files);
    };

    const removeFile = (index) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        setData('files', newFiles);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route('purchase-orders.close', purchaseOrder.id), {
            preserveScroll: true,
            onSuccess: () => {
                handleClose();
            },
            onError: (errors) => {
                // If backend returns warnings and requires confirmation
                if (errors.requires_confirmation) {
                    setShowConfirmation(true);
                }
            },
        });
    };

    const handleForceClose = () => {
        // Create FormData to properly handle file uploads with force_close flag
        const formData = new FormData();
        formData.append('closure_remarks', data.closure_remarks);
        formData.append('force_close', '1');

        // Append files if any
        if (data.files && data.files.length > 0) {
            data.files.forEach((file, index) => {
                formData.append(`files[${index}]`, file);
            });
        }

        // Use router.post for explicit data control
        router.post(route('purchase-orders.close', purchaseOrder.id), formData, {
            preserveScroll: true,
            onSuccess: () => {
                handleClose();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-2xl max-h-[90vh] flex flex-col gap-0 p-0">
                <DialogHeader className="shrink-0 px-6 pt-6 pb-4 border-b bg-gradient-to-r from-red-50 to-orange-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="text-xl font-semibold text-gray-900">
                                Close Purchase Order
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-600 mt-0.5 flex items-center gap-2">
                                <span>Manually close/override this purchase order</span>
                                {purchaseOrder?.po_number && (
                                    <>
                                        <span className="text-gray-400">•</span>
                                        <span className="font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded text-xs">
                                            {purchaseOrder.po_number}
                                        </span>
                                    </>
                                )}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-6 flex-1 bg-gray-50/50">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
                        {/* Warning Alert */}
                        {!showConfirmation ? (
                            <Alert className="border-amber-200 bg-amber-50">
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                                <AlertTitle className="text-amber-900">Manual Override</AlertTitle>
                                <AlertDescription className="text-amber-800">
                                    This action allows you to close a purchase order even if it's not 100% complete.
                                    The system will display actual financial data (invoiced, paid, outstanding amounts) - no data will be manipulated.
                                    Use this when you need to force-close a PO that cannot be completed normally.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <Alert variant="destructive" className="border-red-200 bg-red-50">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Confirmation Required</AlertTitle>
                                <AlertDescription>
                                    <div className="space-y-2 mt-2">
                                        <p className="font-medium">The following issues were detected:</p>
                                        <ul className="list-disc list-inside space-y-1 text-sm">
                                            {errors.warnings?.map((warning, index) => (
                                                <li key={index}>{warning}</li>
                                            ))}
                                        </ul>
                                        <p className="mt-3 font-medium text-red-900">
                                            Do you want to proceed with closing this PO anyway?
                                        </p>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Closure Remarks */}
                        <div className="space-y-2">
                            <Label htmlFor="closure_remarks" className="text-sm font-medium">
                                Closure Remarks <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="closure_remarks"
                                placeholder="Explain why this purchase order is being closed (e.g., partial completion settlement, vendor cancellation, project requirements changed)..."
                                value={data.closure_remarks}
                                onChange={(e) => setData('closure_remarks', e.target.value)}
                                rows={5}
                                className={errors.closure_remarks ? 'border-red-500' : ''}
                                maxLength={1000}
                            />
                            <div className="flex justify-between items-center">
                                {errors.closure_remarks && (
                                    <p className="text-sm text-red-500">{errors.closure_remarks}</p>
                                )}
                                <p className="text-xs text-gray-500 ml-auto">
                                    {data.closure_remarks.length}/1000 characters
                                </p>
                            </div>
                        </div>

                        {/* File Upload */}
                        <div className="space-y-2">
                            <Label htmlFor="files" className="text-sm font-medium">
                                Supporting Documents (Optional)
                            </Label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                <Input
                                    id="files"
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                />
                                <Label
                                    htmlFor="files"
                                    className="cursor-pointer flex flex-col items-center gap-2"
                                >
                                    <Upload className="w-8 h-8 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                        Click to upload supporting documents
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        PDF, JPG, PNG, DOC (Max 10MB per file)
                                    </span>
                                </Label>
                            </div>
                            {errors.files && (
                                <p className="text-sm text-red-500">{errors.files}</p>
                            )}
                        </div>

                        {/* Selected Files */}
                        {selectedFiles.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Selected Files</Label>
                                <div className="space-y-2">
                                    {selectedFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <Upload className="w-4 h-4 text-gray-500 shrink-0" />
                                                <span className="text-sm text-gray-700 truncate">
                                                    {file.name}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                </span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFile(index)}
                                                className="shrink-0"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </form>

                <DialogFooter className="shrink-0 px-6 py-4 border-t bg-gray-50/50">
                    {!showConfirmation ? (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                onClick={handleSubmit}
                                disabled={processing || !data.closure_remarks.trim()}
                            >
                                {processing ? 'Closing...' : 'Close Purchase Order'}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowConfirmation(false)}
                                disabled={processing}
                            >
                                Go Back
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleForceClose}
                                disabled={processing}
                            >
                                {processing ? 'Force Closing...' : 'Yes, Force Close Anyway'}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
