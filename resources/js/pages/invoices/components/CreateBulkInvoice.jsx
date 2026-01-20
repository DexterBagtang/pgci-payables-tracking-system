import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import BulkConfiguration from '@/pages/invoices/components/create/BulkConfiguration.jsx';
import PurchaseOrderSelection from '@/pages/invoices/components/create/PurchaseOrderSelection.jsx';
import { Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { FileText } from 'lucide-react';
import { lazy, Suspense, useCallback, useMemo, useState } from 'react';
import DialogLoadingFallback from '@/components/custom/DialogLoadingFallback';

// Lazy loaded components
const BulkMode = lazy(() => import('@/pages/invoices/components/create/BulkMode.jsx'));

// Dialogs
import ConfirmationDialog from '@/pages/invoices/components/create/dialogs/ConfirmationDialog.jsx';
import UnifiedFileDialog from '@/pages/invoices/components/create/dialogs/UnifiedFileDialog.jsx';

// UI Components
import BulkSummarySection from '@/pages/invoices/components/create/components/BulkSummarySection.jsx';
import EmptyInvoiceState from '@/pages/invoices/components/create/components/EmptyInvoiceState.jsx';

// Custom Hooks
import { useInvoiceFileMatching } from '@/pages/invoices/components/create/hooks/useInvoiceFileMatching.js';
import { useInvoiceValidation } from '@/pages/invoices/components/create/hooks/useInvoiceValidation.js';
import { useBulkInvoiceConfig } from '@/pages/invoices/components/create/hooks/useBulkInvoiceConfig.js';

// Utils
import { calculateVAT, calculatePOPercentage } from '@/pages/invoices/components/create/utils/invoiceCalculations.js';
import { submitToOptions, paymentTermsOptions, sharedFieldOptions } from '@/pages/invoices/components/shared/constants.js';
import { handleBulkInvoiceFileChange as handleBulkInvoiceFileChangeUtil, removeBulkInvoiceFile as removeBulkInvoiceFileUtil } from '@/pages/invoices/components/shared/InvoiceFileHandler.js';
import { submitInvoices } from '@/pages/invoices/components/shared/InvoiceSubmission.js';

const CreateBulkInvoice = ({ purchaseOrders = [] }) => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

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
        const poId = bulkConfig.sharedValues.purchase_order_id;
        return poOptions.find((po) => po.value === poId?.toString());
    }, [poOptions, bulkConfig.sharedValues.purchase_order_id]);

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

    // Handle bulk date selection
    const handleBulkDateSelect = useCallback((index, field, date) => {
        const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
        updateBulkInvoice(index, field, formattedDate);
    }, [updateBulkInvoice]);

    // Add function for handling individual invoice file changes (for BulkMode)
    const handleBulkInvoiceFileChange = useCallback((invoiceIndex, e) => {
        handleBulkInvoiceFileChangeUtil(invoiceIndex, e, bulkInvoices, updateBulkInvoice);
    }, [bulkInvoices, updateBulkInvoice]);

    // Add function to remove individual invoice files
    const removeBulkInvoiceFile = useCallback(
        (invoiceIndex, fileIndex) => {
            removeBulkInvoiceFileUtil(invoiceIndex, fileIndex, bulkInvoices, updateBulkInvoice);
        },
        [bulkInvoices, updateBulkInvoice],
    );

    const handlePreview = (e) => {
        e.preventDefault();

        const isValid = validate(true, bulkInvoices, bulkConfig, {});

        if (isValid) {
            setShowConfirmation(true);
        }
    };

    const handleSubmitConfirmed = () => {
        setShowConfirmation(false);

        submitInvoices({
            isBulkMode: true,
            bulkInvoices,
            bulkConfig,
            singleData: {},
            setProcessing,
            setUploadProgress,
            onSuccess: () => {
                // Reset forms
                resetBulkConfig();
                setErrors({});
            },
            setErrors,
        });
    };

    // Memoize bulk invoice summary calculations
    const bulkSummary = useMemo(() => {
        if (bulkInvoices.length === 0) return null;

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
    }, [bulkInvoices]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto max-w-full space-y-4 p-4">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-slate-900">Bulk Add Invoices</h1>
                        <p className="text-sm text-slate-600">
                            Configure and add multiple invoices for efficient data entry
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            asChild
                            size="sm"
                        >
                            <Link href="/invoices/create">
                                <FileText className="mr-2 h-4 w-4" />
                                Single Mode
                            </Link>
                        </Button>
                    </div>
                </div>

                <form onSubmit={handlePreview}>
                    <div className={cn('grid gap-4 grid-cols-1')}>
                        {/* Main Form */}
                        <div className={cn('space-y-4 col-span-1')}>
                            {/* Purchase Order Selection */}
                            <PurchaseOrderSelection
                                setBulkConfig={setBulkConfig}
                                selectedPO={selectedPO}
                                poOptions={poOptions}
                                isBulkMode={true}
                                errors={errors}
                            />

                            {/* Bulk Mode - Configuration */}
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

                            {/* Bulk Mode - Empty State (before generation) */}
                            {!bulkConfigured && (
                                <EmptyInvoiceState />
                            )}

                            {/* Bulk Mode - Invoice Details Table */}
                            {bulkConfigured && (
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
                        </div>

                        {/* Bulk Mode - Bottom Summary and Actions */}
                        {bulkConfigured && (
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
                    isBulkMode={true}
                    bulkInvoices={bulkInvoices}
                    bulkSummary={bulkSummary}
                    singleData={{}}
                    selectedPO={selectedPO}
                    calculateVAT={calculateVAT}
                    calculatePOPercentage={calculatePOPercentage}
                    processing={processing}
                    onConfirm={handleSubmitConfirmed}
                />

                {/* Unified File Dialog */}
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
                                                Uploading {bulkInvoices.length} invoice{bulkInvoices.length > 1 ? 's' : ''}...
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

export default CreateBulkInvoice;
