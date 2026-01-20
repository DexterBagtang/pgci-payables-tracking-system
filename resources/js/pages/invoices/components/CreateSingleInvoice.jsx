import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import PurchaseOrderSelection from '@/pages/invoices/components/create/PurchaseOrderSelection.jsx';
import { Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { Eye, FileStack } from 'lucide-react';
import { lazy, Suspense, useCallback, useMemo, useState } from 'react';
import DialogLoadingFallback from '@/components/custom/DialogLoadingFallback';

// Lazy loaded component
const SingleMode = lazy(() => import('@/pages/invoices/components/create/SingleMode.jsx'));

// Dialogs
import ConfirmationDialog from '@/pages/invoices/components/create/dialogs/ConfirmationDialog.jsx';

// UI Components
import InvoiceSummaryCard from '@/pages/invoices/components/create/components/InvoiceSummaryCard.jsx';
import ErrorSummary from '@/pages/invoices/components/create/components/ErrorSummary.jsx';

// Custom Hooks
import { useInvoiceValidation } from '@/pages/invoices/components/create/hooks/useInvoiceValidation.js';

// Utils
import { calculateVAT, calculatePOPercentage } from '@/pages/invoices/components/create/utils/invoiceCalculations.js';
import { submitToOptions, paymentTermsOptions } from '@/pages/invoices/components/shared/constants.js';
import { handleFileChange as handleFileChangeUtil, removeFile as removeFileUtil } from '@/pages/invoices/components/shared/InvoiceFileHandler.js';
import { submitInvoices } from '@/pages/invoices/components/shared/InvoiceSubmission.js';

const CreateSingleInvoice = ({ purchaseOrders = [] }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Single invoice data
    const [singleData, setSingleData] = useState({
        purchase_order_id: '',
        si_number: '',
        si_date: '',
        si_received_at: '',
        invoice_amount: '',
        currency: 'PHP',
        due_date: '',
        notes: '',
        submitted_at: '',
        submitted_to: '',
        files: [],
        terms_of_payment: '',
        other_payment_terms: '',
    });

    const {
        errors,
        errorCount,
        validate,
        setErrors,
    } = useInvoiceValidation();

    // Memoized purchase order options
    const poOptions = useMemo(
        () =>
            purchaseOrders.map((po) => ({
                value: po.id.toString(),
                label: `${po.po_number} - ${po.vendor?.name || 'No Vendor'} - ${po.project?.project_title || 'No Project'}`,
                po_number: po.po_number,
                vendor_name: po.vendor?.name || 'No Vendor',
                project_title: po.project?.project_title || 'No Project',
                po_amount: po.po_amount,
                po_status: po.po_status,
                cer_number: po.project?.cer_number,
                currency: po.currency || 'PHP',
            })),
        [purchaseOrders],
    );

    const selectedPO = useMemo(() => {
        return poOptions.find((po) => po.value === singleData.purchase_order_id?.toString());
    }, [poOptions, singleData.purchase_order_id]);

    // Handle date selection
    const handleDateSelect = useCallback(
        (field, date) => {
            const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
            setSingleData((prev) => ({ ...prev, [field]: formattedDate }));
        },
        [],
    );

    // Handle file selection
    const handleFileChange = useCallback(
        (e) => {
            handleFileChangeUtil(e, setSelectedFiles, (validFiles) => {
                setSingleData((prev) => ({ ...prev, files: validFiles }));
            });
        },
        [],
    );

    // Remove selected file
    const removeFile = useCallback(
        (index) => {
            removeFileUtil(index, selectedFiles, setSelectedFiles, (updatedFiles) => {
                setSingleData((prev) => ({ ...prev, files: updatedFiles }));
            });
        },
        [selectedFiles],
    );

    const handlePreview = (e) => {
        e.preventDefault();

        const isValid = validate(false, [], {}, singleData);

        if (isValid) {
            setShowConfirmation(true);
        }
    };

    const handleSubmitConfirmed = () => {
        setShowConfirmation(false);

        submitInvoices({
            isBulkMode: false,
            bulkInvoices: [],
            bulkConfig: {},
            singleData,
            setProcessing,
            setUploadProgress,
            onSuccess: () => {
                // Reset form
                setSingleData({
                    purchase_order_id: '',
                    si_number: '',
                    si_date: '',
                    si_received_at: '',
                    invoice_amount: '',
                    currency: 'PHP',
                    due_date: '',
                    notes: '',
                    submitted_at: '',
                    submitted_to: '',
                    files: [],
                    terms_of_payment: '',
                    other_payment_terms: '',
                });
                setSelectedFiles([]);
                setErrors({});
            },
            setErrors,
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto max-w-full space-y-4 p-4">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-slate-900">Add Invoice</h1>
                        <p className="text-sm text-slate-600">
                            Add a new supplier invoice to the system
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            asChild
                            size="sm"
                        >
                            <Link href="/invoices/bulk/create">
                                <FileStack className="mr-2 h-4 w-4" />
                                Bulk Mode
                            </Link>
                        </Button>
                    </div>
                </div>

                <form onSubmit={handlePreview}>
                    <div className={cn('grid gap-4 grid-cols-1 lg:grid-cols-4')}>
                        {/* Main Form */}
                        <div className={cn('space-y-4 lg:col-span-3')}>
                            {/* Purchase Order Selection */}
                            <PurchaseOrderSelection
                                selectedPO={selectedPO}
                                poOptions={poOptions}
                                isBulkMode={false}
                                setSingleData={setSingleData}
                                errors={errors}
                            />

                            {/* Single Invoice Mode */}
                            <Suspense fallback={<DialogLoadingFallback message="Loading invoice form..." />}>
                                <SingleMode
                                    singleData={singleData}
                                    setSingleData={setSingleData}
                                    errors={errors}
                                    submitToOptions={submitToOptions}
                                    handleDateSelect={handleDateSelect}
                                    selectedPO={selectedPO}
                                    calculateVAT={calculateVAT}
                                    calculatePOPercentage={calculatePOPercentage}
                                    paymentTermsOptions={paymentTermsOptions}
                                    handleFileChange={handleFileChange}
                                    selectedFiles={selectedFiles}
                                    removeFile={removeFile}
                                />
                            </Suspense>
                        </div>

                        {/* Right Column - Summary */}
                        <div className="space-y-4">
                            {/* Summary */}
                            <InvoiceSummaryCard singleData={singleData} selectedPO={selectedPO} />

                            {/* Action Card */}
                            <Card className="shadow-sm">
                                <CardContent className="pt-6">
                                    <div className="space-y-3">
                                        <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700" disabled={processing}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            Preview & Submit
                                        </Button>

                                        <ErrorSummary errorCount={errorCount} errors={errors} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>

                {/* Confirmation Dialog */}
                <ConfirmationDialog
                    open={showConfirmation}
                    onOpenChange={setShowConfirmation}
                    isBulkMode={false}
                    bulkInvoices={[]}
                    bulkSummary={null}
                    singleData={singleData}
                    selectedPO={selectedPO}
                    calculateVAT={calculateVAT}
                    calculatePOPercentage={calculatePOPercentage}
                    processing={processing}
                    onConfirm={handleSubmitConfirmed}
                />

                {/* Loading Overlay with Progress */}
                {processing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
                            <div className="flex flex-col items-center gap-6">
                                {uploadProgress < 100 ? (
                                    <>
                                        <div className="relative h-16 w-16">
                                            <svg className="h-16 w-16 -rotate-90 transform">
                                                <circle
                                                    cx="32"
                                                    cy="32"
                                                    r="28"
                                                    stroke="#e5e7eb"
                                                    strokeWidth="8"
                                                    fill="none"
                                                />
                                                <circle
                                                    cx="32"
                                                    cy="32"
                                                    r="28"
                                                    stroke="#2563eb"
                                                    strokeWidth="8"
                                                    fill="none"
                                                    strokeDasharray={`${(uploadProgress / 100) * 176} 176`}
                                                    className="transition-all duration-300"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-sm font-bold text-blue-600">{uploadProgress}%</span>
                                            </div>
                                        </div>
                                        <div className="w-full text-center">
                                            <h3 className="text-lg font-semibold text-gray-900">Uploading Files...</h3>
                                            <p className="text-sm text-gray-600">Uploading invoice...</p>
                                            {/* Progress bar */}
                                            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                                                    style={{ width: `${uploadProgress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-green-600"></div>
                                        <div className="text-center">
                                            <h3 className="text-lg font-semibold text-gray-900">Processing...</h3>
                                            <p className="text-sm text-gray-600">
                                                Creating invoice in database...
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateSingleInvoice;
