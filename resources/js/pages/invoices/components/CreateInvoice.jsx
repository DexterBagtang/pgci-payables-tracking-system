import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import BulkConfiguration from '@/pages/invoices/components/create/BulkConfiguration.jsx';
import PurchaseOrderSelection from '@/pages/invoices/components/create/PurchaseOrderSelection.jsx';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Eye, FileStack } from 'lucide-react';
import { lazy, Suspense, useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import DialogLoadingFallback from '@/components/custom/DialogLoadingFallback';

// Lazy loaded components
const BulkMode = lazy(() => import('@/pages/invoices/components/create/BulkMode.jsx'));
const SingleMode = lazy(() => import('@/pages/invoices/components/create/SingleMode.jsx'));

// Dialogs
import ConfirmationDialog from '@/pages/invoices/components/create/dialogs/ConfirmationDialog.jsx';
import UnifiedFileDialog from '@/pages/invoices/components/create/dialogs/UnifiedFileDialog.jsx';

// UI Components
import InvoiceSummaryCard from '@/pages/invoices/components/create/components/InvoiceSummaryCard.jsx';
import BulkSummarySection from '@/pages/invoices/components/create/components/BulkSummarySection.jsx';
import ErrorSummary from '@/pages/invoices/components/create/components/ErrorSummary.jsx';
import EmptyInvoiceState from '@/pages/invoices/components/create/components/EmptyInvoiceState.jsx';

// Custom Hooks
import { useInvoiceFileMatching } from '@/pages/invoices/components/create/hooks/useInvoiceFileMatching.js';
import { useInvoiceValidation } from '@/pages/invoices/components/create/hooks/useInvoiceValidation.js';
import { useBulkInvoiceConfig } from '@/pages/invoices/components/create/hooks/useBulkInvoiceConfig.js';

// Utils
import { calculateVAT, calculatePOPercentage } from '@/pages/invoices/components/create/utils/invoiceCalculations.js';

const CreateInvoice = ({ purchaseOrders = [] }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isBulkMode, setBulkMode] = useState(false);
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

    // Use custom hooks
    const {
        bulkInvoices,
        setBulkInvoices,
        bulkConfigured,
        bulkConfig,
        setBulkConfig,
        createEmptyInvoice,
        generateBulkInvoices,
        updateBulkInvoice,
        deleteBulkInvoice,
        duplicateBulkInvoice,
        resetBulkMode,
        resetBulkConfig,
    } = useBulkInvoiceConfig();

    const {
        errors,
        errorCount,
        validate,
        setErrors,
    } = useInvoiceValidation();

    const {
        bulkFiles,
        setBulkFiles,
        fileMatching,
        showUnifiedDialog,
        setShowUnifiedDialog,
        unifiedDialogData,
        handleBulkFilesUpload,
        handleRemoveMatchedFile,
        handleReassignFile,
        handleUnifiedShareWithAll,
        handleUnifiedAssignToOne,
        handleUnifiedManualAssignment,
        handleUnifiedLeaveUnmatched,
    } = useInvoiceFileMatching(bulkInvoices, updateBulkInvoice);

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
        const poId = isBulkMode ? bulkConfig.sharedValues.purchase_order_id : singleData.purchase_order_id;
        return poOptions.find((po) => po.value === poId?.toString());
    }, [poOptions, bulkConfig.sharedValues.purchase_order_id, singleData.purchase_order_id, isBulkMode]);

    const submitToOptions = ['Kimberly Usona', 'Joseph David Maderazo'];

    // Terms of Payment options
    const paymentTermsOptions = [
        { value: 'downpayment', label: 'Downpayment' },
        { value: 'progress_billing', label: 'Progress Billing' },
        { value: 'final_payment', label: 'Final Payment' },
        { value: 'others', label: 'Others' },
    ];

    // Shared field options for bulk mode
    const sharedFieldOptions = [
        { key: 'purchase_order_id', label: 'Purchase Order', required: true },
        { key: 'currency', label: 'Currency', required: true },
        { key: 'invoice_amount', label: 'Invoice Amount' },
        { key: 'si_date', label: 'SI Date' },
        { key: 'si_received_at', label: 'SI Received Date' },
        { key: 'terms_of_payment', label: 'Payment Terms' },
        { key: 'due_date', label: 'Due Date' },
        { key: 'submitted_to', label: 'Submit To', required: true },
        { key: 'submitted_at', label: 'Submission Date', required: true },
        { key: 'notes', label: 'Notes' },
    ];

    // Handle date selection for bulk config
    const handleBulkConfigDateSelect = useCallback((field, date) => {
        const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
        setBulkConfig((prev) => ({
            ...prev,
            sharedValues: {
                ...prev.sharedValues,
                [field]: formattedDate,
            },
        }));
    }, [setBulkConfig]);

    // Handle date selection
    const handleDateSelect = useCallback(
        (field, date) => {
            const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
            if (!isBulkMode) {
                setSingleData((prev) => ({ ...prev, [field]: formattedDate }));
            }
        },
        [isBulkMode],
    );

    // Handle bulk date selection
    const handleBulkDateSelect = useCallback((index, field, date) => {
        const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
        updateBulkInvoice(index, field, formattedDate);
    }, [updateBulkInvoice]);

    // Handle file selection
    const handleFileChange = useCallback(
        (e) => {
            const files = Array.from(e.target.files);
            const validFiles = files.filter((file) => {
                const maxSize = 20 * 1024 * 1024; // 20MB
                return file.size <= maxSize;
            });

            if (validFiles.length !== files.length) {
                alert('Some files were too large (max 20MB per file) and were not selected.');
            }

            setSelectedFiles(validFiles);
            e.target.value = '';

            if (isBulkMode) {
                setBulkConfig((prev) => ({
                    ...prev,
                    sharedValues: { ...prev.sharedValues, files: validFiles },
                }));
            } else {
                setSingleData((prev) => ({ ...prev, files: validFiles }));
            }
        },
        [isBulkMode, setBulkConfig],
    );

    // Remove selected file
    const removeFile = useCallback(
        (index) => {
            const updatedFiles = selectedFiles.filter((_, i) => i !== index);
            setSelectedFiles(updatedFiles);

            if (isBulkMode) {
                setBulkConfig((prev) => ({
                    ...prev,
                    sharedValues: { ...prev.sharedValues, files: updatedFiles },
                }));
            } else {
                setSingleData((prev) => ({ ...prev, files: updatedFiles }));
            }
        },
        [selectedFiles, isBulkMode, setBulkConfig],
    );

    // Add function for handling individual invoice file changes (for BulkMode)
    const handleBulkInvoiceFileChange = useCallback((invoiceIndex, e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter((file) => {
            const maxSize = 20 * 1024 * 1024; // 20MB
            return file.size <= maxSize;
        });

        if (validFiles.length !== files.length) {
            alert('Some files were too large (max 20MB per file) and were not selected.');
        }

        updateBulkInvoice(invoiceIndex, 'files', validFiles);
        e.target.value = '';
    }, [updateBulkInvoice]);

    // Add function to remove individual invoice files
    const removeBulkInvoiceFile = useCallback(
        (invoiceIndex, fileIndex) => {
            const invoice = bulkInvoices[invoiceIndex];
            const updatedFiles = invoice.files.filter((_, i) => i !== fileIndex);
            updateBulkInvoice(invoiceIndex, 'files', updatedFiles);
        },
        [bulkInvoices, updateBulkInvoice],
    );

    const handlePreview = (e) => {
        e.preventDefault();

        const isValid = validate(isBulkMode, bulkInvoices, bulkConfig, singleData);

        if (isValid) {
            setShowConfirmation(true);
        }
    };

    const handleSubmitConfirmed = () => {
        setShowConfirmation(false);
        setProcessing(true);
        setUploadProgress(0);

        // Prepare invoice data
        const invoicesWithSharedData = bulkInvoices.map((invoice) => {
            // Remove files from invoice object for JSON serialization
            const { files, ...invoiceWithoutFiles } = invoice;
            return {
                ...invoiceWithoutFiles,
                purchase_order_id: bulkConfig.sharedValues.purchase_order_id,
            };
        });

        const invoicesData = isBulkMode ? invoicesWithSharedData : [{ ...singleData, files: undefined }];

        // Create FormData
        const formData = new FormData();

        // Append the invoice data as JSON (without files)
        formData.append('_invoices_json', JSON.stringify(invoicesData));

        // Frontend file deduplication - send each unique file only once
        const sourceInvoices = isBulkMode ? bulkInvoices : [singleData];
        const fileMap = new Map(); // Map to track unique files: key = file signature, value = file object
        const invoiceFileReferences = []; // Track which invoices use which files

        sourceInvoices.forEach((invoice, index) => {
            invoiceFileReferences[index] = [];

            if (invoice.files && invoice.files.length > 0) {
                invoice.files.forEach((file) => {
                    // Create unique signature for file (name + size)
                    const fileSignature = `${file.name}_${file.size}`;

                    if (!fileMap.has(fileSignature)) {
                        // First occurrence - add to map
                        fileMap.set(fileSignature, file);
                    }

                    // Track that this invoice uses this file
                    invoiceFileReferences[index].push(fileSignature);
                });
            }
        });

        // Append unique files only once with a global index
        let globalFileIndex = 0;
        const fileSignatureToIndex = new Map();

        fileMap.forEach((file, signature) => {
            formData.append(`unique_files[${globalFileIndex}]`, file);
            fileSignatureToIndex.set(signature, globalFileIndex);
            globalFileIndex++;
        });

        // Append file references for each invoice
        sourceInvoices.forEach((invoice, invoiceIndex) => {
            if (invoiceFileReferences[invoiceIndex]) {
                invoiceFileReferences[invoiceIndex].forEach((signature, localFileIndex) => {
                    const globalIndex = fileSignatureToIndex.get(signature);
                    formData.append(`invoices[${invoiceIndex}][file_refs][${localFileIndex}]`, globalIndex);
                });
            }
        });

        // Use Inertia router for file uploads with progress tracking
        router.post('/invoices', formData, {
            // Track upload progress
            onProgress: (progress) => {
                if (progress.percentage) {
                    setUploadProgress(Math.round(progress.percentage));
                }
            },

            // Handle successful response
            onSuccess: (page) => {
                toast.success(`${isBulkMode ? bulkInvoices.length : '1'} invoice(s) created successfully!`);

                // Reset forms
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
                resetBulkConfig();
                setSelectedFiles([]);
                setErrors({});

                // Inertia will handle the redirect automatically
            },

            // Handle validation errors (422)
            onError: (errors) => {
                console.error('Validation errors:', errors);

                // Extract and format error messages
                const errorMessages = Object.entries(errors)
                    .map(([field, messages]) => {
                        const fieldName = field.replace(/invoices\.\d+\./, '').replace(/_/g, ' ');
                        const message = Array.isArray(messages) ? messages[0] : messages;
                        return `${fieldName}: ${message}`;
                    })
                    .slice(0, 3); // Show first 3 errors

                if (errorMessages.length > 0) {
                    toast.error(
                        <div>
                            <p className="font-semibold">Validation failed:</p>
                            <ul className="mt-1 list-disc pl-4 text-xs">
                                {errorMessages.map((msg, i) => <li key={i}>{msg}</li>)}
                            </ul>
                            {Object.keys(errors).length > 3 && (
                                <p className="mt-1 text-xs">+ {Object.keys(errors).length - 3} more errors</p>
                            )}
                        </div>,
                        { duration: 8000 }
                    );
                }

                // Set errors for inline display
                setErrors(errors);
            },

            // Always reset loading state when finished
            onFinish: () => {
                setProcessing(false);
                setUploadProgress(0);
            },

            // Preserve scroll position
            preserveScroll: true,

            // Force FormData to be used
            forceFormData: true,
        });
    };

    // Memoize bulk invoice summary calculations
    const bulkSummary = useMemo(() => {
        if (!isBulkMode || bulkInvoices.length === 0) return null;

        const totalAmount = bulkInvoices.reduce((sum, inv) => sum + (parseFloat(inv.invoice_amount) || 0), 0);
        const totalVAT = bulkInvoices.reduce((sum, inv) => sum + calculateVAT(inv.invoice_amount).vatAmount, 0);
        const totalVATExclusive = bulkInvoices.reduce((sum, inv) => sum + calculateVAT(inv.invoice_amount).vatableAmount, 0);
        const currency = bulkInvoices[0]?.currency || 'PHP';

        return {
            count: bulkInvoices.length,
            totalAmount,
            totalVAT,
            totalVATExclusive,
            currency,
        };
    }, [isBulkMode, bulkInvoices]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto max-w-full space-y-4 p-4">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-slate-900">{isBulkMode ? 'Bulk Add Invoices' : 'Add Invoice'}</h1>
                        <p className="text-sm text-slate-600">
                            {isBulkMode ? 'Configure and add multiple invoices for efficient data entry' : 'Add a new supplier invoice to the system'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={isBulkMode ? 'default' : 'outline'}
                            onClick={() => {
                                setBulkMode(!isBulkMode);
                                if (!isBulkMode) {
                                    resetBulkMode();
                                }
                            }}
                            size="sm"
                        >
                            <FileStack className="mr-2 h-4 w-4" />
                            {isBulkMode ? 'Single Mode' : 'Bulk Mode'}
                        </Button>
                    </div>
                </div>

                <form onSubmit={handlePreview}>
                    <div className={cn('grid gap-4', isBulkMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4')}>
                        {/* Main Form */}
                        <div className={cn('space-y-4', isBulkMode ? 'col-span-1' : 'lg:col-span-3')}>
                            {/* Purchase Order Selection */}
                            <PurchaseOrderSelection
                                setBulkConfig={setBulkConfig}
                                selectedPO={selectedPO}
                                poOptions={poOptions}
                                isBulkMode={isBulkMode}
                                setSingleData={setSingleData}
                                errors={errors}
                            />

                            {/* Bulk Mode - Configuration or Invoice List */}
                            {isBulkMode && (
                                <BulkConfiguration
                                    bulkConfig={bulkConfig}
                                    setBulkConfig={setBulkConfig}
                                    generateBulkInvoices={generateBulkInvoices}
                                    sharedFieldOptions={sharedFieldOptions}
                                    handleBulkConfigDateSelect={handleBulkConfigDateSelect}
                                    submitToOptions={submitToOptions}
                                    paymentTermsOptions={paymentTermsOptions}
                                    errors={errors}
                                />
                            )}

                            {/* Bulk Mode - Empty State (before generation) */}
                            {isBulkMode && !bulkConfigured && (
                                <EmptyInvoiceState />
                            )}

                            {/* Bulk Mode - Invoice Details Table */}
                            {isBulkMode && bulkConfigured && (
                                <Suspense fallback={<DialogLoadingFallback message="Loading bulk invoice form..." />}>
                                    <BulkMode
                                        bulkInvoices={bulkInvoices}
                                        resetBulkMode={resetBulkMode}
                                        bulkConfig={bulkConfig}
                                        updateBulkInvoice={updateBulkInvoice}
                                        errors={errors}
                                        handleBulkInvoiceFileChange={handleBulkInvoiceFileChange}
                                        removeBulkInvoiceFile={removeBulkInvoiceFile}
                                        handleBulkDateSelect={handleBulkDateSelect}
                                        paymentTermsOptions={paymentTermsOptions}
                                        duplicateBulkInvoice={duplicateBulkInvoice}
                                        deleteBulkInvoice={deleteBulkInvoice}
                                        createEmptyInvoice={createEmptyInvoice}
                                        setBulkInvoices={setBulkInvoices}
                                        sharedFieldOptions={sharedFieldOptions}
                                        selectedPO={selectedPO}
                                        calculatePOPercentage={calculatePOPercentage}
                                        calculateVAT={calculateVAT}
                                        bulkFiles={bulkFiles}
                                        setBulkFiles={setBulkFiles}
                                        fileMatching={fileMatching}
                                        handleBulkFilesUpload={handleBulkFilesUpload}
                                        handleRemoveMatchedFile={handleRemoveMatchedFile}
                                        handleReassignFile={handleReassignFile}
                                    />
                                </Suspense>
                            )}

                            {/* Single Invoice Mode */}
                            {!isBulkMode && (
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
                            )}
                        </div>

                        {/* Right Column - Summary (Only show in single mode) */}
                        {!isBulkMode && (
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
                        )}

                        {/* Bulk Mode - Bottom Summary and Actions */}
                        {isBulkMode && bulkConfigured && (
                            <BulkSummarySection
                                bulkSummary={bulkSummary}
                                bulkInvoices={bulkInvoices}
                                errorCount={errorCount}
                                errors={errors}
                                processing={processing}
                            />
                        )}
                    </div>
                </form>

                {/* Confirmation Dialog */}
                <ConfirmationDialog
                    open={showConfirmation}
                    onOpenChange={setShowConfirmation}
                    isBulkMode={isBulkMode}
                    bulkInvoices={bulkInvoices}
                    bulkSummary={bulkSummary}
                    singleData={singleData}
                    selectedPO={selectedPO}
                    calculateVAT={calculateVAT}
                    calculatePOPercentage={calculatePOPercentage}
                    processing={processing}
                    onConfirm={handleSubmitConfirmed}
                />

                {/* Simplified File Dialog - Single File Only */}
                <UnifiedFileDialog
                    open={showUnifiedDialog}
                    onOpenChange={setShowUnifiedDialog}
                    scenario={unifiedDialogData.scenario}
                    filesCount={unifiedDialogData.filesCount}
                    invoicesCount={bulkInvoices.length}
                    files={unifiedDialogData.files}
                    onShareWithAll={handleUnifiedShareWithAll}
                    onAssignToOne={handleUnifiedAssignToOne}
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
                                            <p className="text-sm text-gray-600">
                                                {isBulkMode
                                                    ? `Uploading ${bulkInvoices.length} invoice${bulkInvoices.length > 1 ? 's' : ''}...`
                                                    : 'Uploading invoice...'
                                                }
                                            </p>
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
                                                Creating invoices in database...
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

export default CreateInvoice;
