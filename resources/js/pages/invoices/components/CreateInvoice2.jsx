import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import BulkConfiguration from '@/pages/invoices/components/create/BulkConfiguration.jsx';
import PurchaseOrderSelection from '@/pages/invoices/components/create/PurchaseOrderSelection.jsx';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    AlertCircle,
    Calculator,
    CalendarIcon,
    Check,
    Copy,
    Eye,
    FileStack,
    FileText, Loader,
    Plus,
    Receipt,
    Settings,
    Trash2,
    Upload,
    X
} from 'lucide-react';
import { lazy, Suspense, useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
const BulkMode = lazy(()=> import('@/pages/invoices/components/create/BulkMode.jsx'));
const SingleMode = lazy(()=> import('@/pages/invoices/components/create/SingleMode.jsx'));

const CreateInvoice = ({ purchaseOrders = [] }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isBulkMode, setBulkMode] = useState(false);
    const [bulkInvoices, setBulkInvoices] = useState([]);
    const [bulkConfigured, setBulkConfigured] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    // Bulk configuration
    const [bulkConfig, setBulkConfig] = useState({
        count: 2,
        siPrefix: '',
        sharedFields: {
            purchase_order_id: true,
            si_date: false,
            si_received_at: false,
            terms_of_payment: false,
            other_payment_terms: false,
            submitted_to: true,
            submitted_at: true,
            due_date: false,
            notes: false,
        },
        sharedValues: {
            purchase_order_id: '',
            si_date: '',
            si_received_at: '',
            terms_of_payment: '',
            other_payment_terms: '',
            submitted_to: '',
            submitted_at: '',
            due_date: '',
            notes: '',
        },
    });

    // Single invoice data
    const [singleData, setSingleData] = useState({
        purchase_order_id: '',
        si_number: '',
        si_date: '',
        si_received_at: '',
        invoice_amount: '',
        due_date: '',
        notes: '',
        submitted_at: '',
        submitted_to: '',
        files: [],
        terms_of_payment: '',
        other_payment_terms: '',
    });

    function createEmptyInvoice(index = 0) {
        const invoice = {
            si_number: bulkConfig.siPrefix ? `${bulkConfig.siPrefix}` : '',
            si_date: bulkConfig.sharedFields.si_date ? bulkConfig.sharedValues.si_date : '',
            si_received_at: bulkConfig.sharedFields.si_received_at ? bulkConfig.sharedValues.si_received_at : '',
            invoice_amount: '',
            terms_of_payment: bulkConfig.sharedFields.terms_of_payment ? bulkConfig.sharedValues.terms_of_payment : '',
            other_payment_terms: bulkConfig.sharedFields.other_payment_terms ? bulkConfig.sharedValues.other_payment_terms : '',
            due_date: bulkConfig.sharedFields.due_date ? bulkConfig.sharedValues.due_date : '',
            files: [],
        };
        return invoice;
    }

    // Add this new function for handling individual invoice file changes:
    const handleBulkInvoiceFileChange = useCallback((invoiceIndex, e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter((file) => {
            const maxSize = 10 * 1024 * 1024; // 10MB
            return file.size <= maxSize;
        });

        if (validFiles.length !== files.length) {
            alert('Some files were too large (max 10MB per file) and were not selected.');
        }

        updateBulkInvoice(invoiceIndex, 'files', validFiles);
        e.target.value = '';
    }, []);

    // Add function to remove individual invoice files:
    const removeBulkInvoiceFile = useCallback(
        (invoiceIndex, fileIndex) => {
            const invoice = bulkInvoices[invoiceIndex];
            const updatedFiles = invoice.files.filter((_, i) => i !== fileIndex);
            updateBulkInvoice(invoiceIndex, 'files', updatedFiles);
        },
        [bulkInvoices],
    );

    // Generate bulk invoices based on configuration
    const generateBulkInvoices = useCallback(() => {
        const newInvoices = [];
        for (let i = 0; i < bulkConfig.count; i++) {
            newInvoices.push(createEmptyInvoice(i));
        }
        setBulkInvoices(newInvoices);
        setBulkConfigured(true);
    }, [bulkConfig]);

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
            })),
        [purchaseOrders],
    );

    const selectedPO = useMemo(() => {
        const poId = isBulkMode ? bulkConfig.sharedValues.purchase_order_id : singleData.purchase_order_id;
        return poOptions.find((po) => po.value === poId?.toString());
    }, [poOptions, bulkConfig.sharedValues.purchase_order_id, singleData.purchase_order_id, isBulkMode]);

    // VAT Calculation helper
    const calculateVAT = (amount) => {
        const numAmount = parseFloat(amount) || 0;
        const vatableAmount = numAmount / 1.12;
        const vatAmount = numAmount - vatableAmount;
        return {
            grossAmount: numAmount,
            vatableAmount: vatableAmount,
            vatAmount: vatAmount,
        };
    };

    // Calculate percentage of PO amount used
    const calculatePOPercentage = (invoiceAmount, poAmount) => {
        const invoice = parseFloat(invoiceAmount) || 0;
        const po = parseFloat(poAmount) || 0;
        if (po === 0) return 0;
        return (invoice / po) * 100;
    };

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
    }, []);

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

    // Handle bulk invoice update
    const updateBulkInvoice = (index, field, value) => {
        setBulkInvoices((prev) => prev.map((invoice, i) => (i === index ? { ...invoice, [field]: value } : invoice)));
    };

    // Handle bulk date selection
    const handleBulkDateSelect = useCallback((index, field, date) => {
        const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
        updateBulkInvoice(index, field, formattedDate);
    }, []);

    // Handle file selection
    const handleFileChange = useCallback(
        (e) => {
            const files = Array.from(e.target.files);
            const validFiles = files.filter((file) => {
                const maxSize = 10 * 1024 * 1024; // 10MB
                return file.size <= maxSize;
            });

            if (validFiles.length !== files.length) {
                alert('Some files were too large (max 10MB per file) and were not selected.');
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
        [isBulkMode],
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
        [selectedFiles, isBulkMode],
    );

    // Delete bulk invoice
    const deleteBulkInvoice = (index) => {
        if (bulkInvoices.length > 1) {
            setBulkInvoices((prev) => prev.filter((_, i) => i !== index));
        }
    };

    // Duplicate bulk invoice
    const duplicateBulkInvoice = (index) => {
        const invoiceToDuplicate = bulkInvoices[index];
        setBulkInvoices((prev) => [...prev, { ...invoiceToDuplicate }]);
    };

    // Reset bulk mode
    const resetBulkMode = () => {
        setBulkConfigured(false);
        setBulkInvoices([]);
    };

    const handlePreview = (e) => {
        e.preventDefault();

        const newErrors = {};

        if (isBulkMode) {
            // Validate shared fields
            if (bulkConfig.sharedFields.purchase_order_id && !bulkConfig.sharedValues.purchase_order_id) {
                newErrors.purchase_order_id = 'Purchase order is required';
            }
            if (bulkConfig.sharedFields.si_date && !bulkConfig.sharedValues.si_date) {
                newErrors.si_date = 'SI Date is required';
            }
            if (bulkConfig.sharedFields.si_received_at && !bulkConfig.sharedValues.si_received_at) {
                newErrors.si_received_at = 'SI Received Date is required';
            }
            if (bulkConfig.sharedFields.terms_of_payment && !bulkConfig.sharedValues.terms_of_payment) {
                newErrors.terms_of_payment = 'Payment terms is required';
            }
            if (bulkConfig.sharedValues.terms_of_payment === 'others' && !bulkConfig.sharedValues.other_payment_terms) {
                newErrors.other_payment_terms = 'Please specify other payment terms';
            }
            if (bulkConfig.sharedFields.submitted_to && !bulkConfig.sharedValues.submitted_to) {
                newErrors.submitted_to = 'Submit to is required';
            }
            if (bulkConfig.sharedFields.submitted_at && !bulkConfig.sharedValues.submitted_at) {
                newErrors.submitted_at = 'Submission date is required';
            }

            // Validate each bulk invoice
            bulkInvoices.forEach((invoice, index) => {
                if (!invoice.si_number) newErrors[`bulk_${index}_si_number`] = `Invoice ${index + 1}: SI Number is required`;
                if (!bulkConfig.sharedFields.si_date && !invoice.si_date)
                    newErrors[`bulk_${index}_si_date`] = `Invoice ${index + 1}: SI Date is required`;
                if (!invoice.invoice_amount) newErrors[`bulk_${index}_invoice_amount`] = `Invoice ${index + 1}: Amount is required`;
                if (!bulkConfig.sharedFields.terms_of_payment && !invoice.terms_of_payment)
                    newErrors[`bulk_${index}_terms_of_payment`] = `Invoice ${index + 1}: Payment terms are required`;
                if (invoice.terms_of_payment === 'others' && !bulkConfig.sharedFields.terms_of_payment && !invoice.other_payment_terms) {
                    newErrors[`bulk_${index}_other_payment_terms`] = `Invoice ${index + 1}: Please specify other payment terms`;
                }
            });
        } else {
            // Validate single invoice
            if (!singleData.purchase_order_id) newErrors.purchase_order_id = 'Purchase order is required';
            if (!singleData.si_number) newErrors.si_number = 'SI Number is required';
            if (!singleData.si_date) newErrors.si_date = 'SI Date is required';
            if (!singleData.si_received_at) newErrors.si_received_at = 'SI Received Date is required';
            if (!singleData.invoice_amount) newErrors.invoice_amount = 'Invoice amount is required';
            if (!singleData.submitted_at) newErrors.submitted_at = 'Submission date is required';
            if (!singleData.submitted_to) newErrors.submitted_to = 'Submit to is required';
            if (!singleData.terms_of_payment) newErrors.terms_of_payment = 'Payment terms are required';
            if (singleData.terms_of_payment === 'others' && !singleData.other_payment_terms) {
                newErrors.other_payment_terms = 'Please specify other payment terms';
            }
        }

        console.log(newErrors);

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setShowConfirmation(true);
        }
    };

    const handleSubmitConfirmed = () => {
        setShowConfirmation(false);
        setProcessing(true);

        // Join the shared values to each bulk invoice
        const invoicesWithSharedData = bulkInvoices.map((invoice) => {
            const mergedInvoice = { ...invoice };

            // Add shared values for fields that are configured as shared
            Object.entries(bulkConfig.sharedFields).forEach(([fieldKey, isShared]) => {
                if (isShared && bulkConfig.sharedValues[fieldKey]) {
                    mergedInvoice[fieldKey] = bulkConfig.sharedValues[fieldKey];
                }
            });

            return mergedInvoice;
        });



        router.post(
            '/invoices',
            {
                invoices: isBulkMode ?  [ ...invoicesWithSharedData] : [singleData],
            },
            {
                onSuccess: () => {
                    // setProcessing(false);
                    toast.success(`${isBulkMode ? bulkInvoices.length : '1'} invoice(s) created successfully!`);
                    // Reset forms
                    setSingleData({
                        purchase_order_id: '',
                        si_number: '',
                        si_date: '',
                        si_received_at: '',
                        invoice_amount: '',
                        due_date: '',
                        notes: '',
                        submitted_at: '',
                        submitted_to: '',
                        files: [],
                        terms_of_payment: '',
                        other_payment_terms: '',
                    });
                    setBulkConfig({
                        count: 2,
                        siPrefix: '',
                        sharedFields: {
                            purchase_order_id: true,
                            si_date: false,
                            si_received_at: false,
                            terms_of_payment: true,
                            other_payment_terms: false,
                            submitted_to: true,
                            submitted_at: true,
                            due_date: false,
                            notes: true,
                        },
                        sharedValues: {
                            purchase_order_id: '',
                            si_date: '',
                            si_received_at: '',
                            terms_of_payment: '',
                            other_payment_terms: '',
                            submitted_to: '',
                            submitted_at: '',
                            due_date: '',
                            notes: '',
                            files: [],
                        },
                    });
                    setSelectedFiles([]);
                    setBulkInvoices([]);
                    setBulkConfigured(false);
                    setProcessing(false);

                },
                onError: (errors) => {
                    console.log(errors);
                    setErrors(errors);
                    setProcessing(false);
                }
            },
        );
    };

    const errorCount = Object.keys(errors).length;

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
                                    setBulkConfigured(false);
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

                            {/* Bulk Mode - Invoice Details Table */}
                            {isBulkMode && bulkConfigured && (
                                <Suspense fallback={<Loader className="animate-spin text-center" />}>
                                    <BulkMode
                                        bulkInvoices={bulkInvoices}
                                        resetBulkMode={resetBulkMode}
                                        bulkConfig={bulkConfig}
                                        updateBulkInvoice={updateBulkInvoice}
                                        errors={errors}
                                        handleBulkInvoiceFileChange={handleBulkInvoiceFileChange}
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
                                    />
                                </Suspense>

                            )}

                             {/*Single Invoice Mode */}
                            {!isBulkMode &&
                                <Suspense fallback={<Loader className="animate-spin text-center" />}>
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
                                    />
                                </Suspense>

                            }
                        </div>

                        {/* Right Column - Summary (Only show in single mode) */}
                        {!isBulkMode && (
                            <div className="space-y-4">
                                {/* Summary */}
                                <Card className="shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center text-lg">
                                            <Calculator className="mr-2 h-4 w-4 text-blue-600" />
                                            Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="space-y-3">
                                            <div className="rounded border bg-slate-50 p-3 text-center">
                                                <div className="mb-1 text-sm text-slate-600">Invoice Amount</div>
                                                <div className="text-2xl font-bold text-slate-900">
                                                    ₱{Number(singleData.invoice_amount || 0).toLocaleString()}
                                                </div>
                                            </div>

                                            {singleData.invoice_amount && (
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between rounded bg-slate-50 p-2">
                                                        <span>VATable Amount:</span>
                                                        <span className="font-medium">
                                                            ₱{calculateVAT(singleData.invoice_amount).vatableAmount.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between rounded bg-slate-50 p-2">
                                                        <span>VAT (12%):</span>
                                                        <span className="font-medium">
                                                            ₱{calculateVAT(singleData.invoice_amount).vatAmount.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {selectedPO && (
                                            <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                                                <h4 className="mb-2 text-sm font-medium text-blue-800">Selected PO</h4>
                                                <div className="space-y-1 text-xs text-blue-700">
                                                    <div className="flex justify-between">
                                                        <span>PO:</span>
                                                        <span className="font-medium">{selectedPO.po_number}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Vendor:</span>
                                                        <span className="ml-2 truncate font-medium">{selectedPO.vendor_name}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Amount:</span>
                                                        <span className="font-medium">₱{Number(selectedPO.po_amount).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Action Card */}
                                <Card className="shadow-sm">
                                    <CardContent className="pt-6">
                                        <div className="space-y-3">
                                            <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700" disabled={processing}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Preview & Submit
                                            </Button>

                                            {errorCount > 0 && (
                                                <div className="rounded-md border border-red-200 bg-red-50 p-3">
                                                    <div className="flex items-start">
                                                        <AlertCircle className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-red-600" />
                                                        <div className="flex-1">
                                                            <h3 className="mb-2 text-xs font-medium text-red-800">
                                                                {errorCount} error{errorCount > 1 ? 's' : ''} found:
                                                            </h3>
                                                            <ul className="max-h-32 space-y-1 overflow-y-auto text-xs text-red-700">
                                                                {Object.entries(errors)
                                                                    .slice(0, 5)
                                                                    .map(([field, error]) => (
                                                                        <li key={field} className="flex items-center">
                                                                            <span className="mr-2 h-1 w-1 flex-shrink-0 rounded-full bg-red-600"></span>
                                                                            <span>{error}</span>
                                                                        </li>
                                                                    ))}
                                                                {errorCount > 5 && (
                                                                    <li className="font-medium text-red-600">...and {errorCount - 5} more</li>
                                                                )}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Bulk Mode - Bottom Summary and Actions */}
                        {isBulkMode && bulkConfigured && (
                            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                                {/* Summary Cards */}
                                <Card className="shadow-sm">
                                    <CardContent className="pt-4">
                                        <div className="text-center">
                                            <div className="mb-1 text-sm text-slate-600">Total Invoices</div>
                                            <div className="text-2xl font-bold text-blue-900">{bulkInvoices.length}</div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardContent className="pt-4">
                                        <div className="text-center">
                                            <div className="mb-1 text-sm text-slate-600">Total Amount</div>
                                            <div className="text-2xl font-bold text-green-900">
                                                ₱{bulkInvoices.reduce((sum, inv) => sum + (parseFloat(inv.invoice_amount) || 0), 0).toLocaleString()}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-500">
                                                EX: ₱
                                                {bulkInvoices.reduce((sum, inv) => sum + calculateVAT(inv.invoice_amount).vatableAmount, 0).toFixed(2)}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-500">
                                                VAT: ₱
                                                {bulkInvoices.reduce((sum, inv) => sum + calculateVAT(inv.invoice_amount).vatAmount, 0).toFixed(2)}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardContent className="pt-4">
                                        <div className="space-y-3">
                                            <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700"
                                                    // disabled={processing}
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                Submit All ({bulkInvoices.length})
                                            </Button>

                                            {errorCount > 0 && (
                                                <div className="text-center">
                                                    <div className="text-xs font-medium text-red-600">
                                                        {errorCount} error{errorCount > 1 ? 's' : ''} found
                                                    </div>
                                                    <ul className="max-h-32 space-y-1 overflow-y-auto text-xs text-red-700">
                                                        {Object.entries(errors)
                                                            .slice(0, 5)
                                                            .map(([field, error]) => (
                                                                <li key={field} className="flex items-center">
                                                                    <span className="mr-2 h-1 w-1 flex-shrink-0 rounded-full bg-red-600"></span>
                                                                    <span>{error}</span>
                                                                </li>
                                                            ))}
                                                        {errorCount > 5 && (
                                                            <li className="font-medium text-red-600">...and {errorCount - 5} more</li>
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </form>

                {/* Confirmation Dialog */}
                <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                    <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center">
                                <Eye className="mr-2 h-5 w-5 text-blue-600" />
                                {isBulkMode ? `Review ${bulkInvoices.length} Invoices` : 'Review Invoice'}
                            </DialogTitle>
                            <DialogDescription className="text-xs">Please verify all information before submission.</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {isBulkMode ? (
                                <div>
                                    <div className="mb-4 rounded bg-blue-50 p-3">
                                        <h3 className="mb-2 font-medium text-blue-900">Bulk Submission Summary</h3>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="text-blue-700">Total Invoices:</span>
                                                <span className="ml-2 font-medium">{bulkInvoices.length}</span>
                                            </div>
                                            <div>
                                                <span className="text-blue-700">Total Amount:</span>
                                                <span className="ml-2 font-medium">
                                                    ₱
                                                    {bulkInvoices
                                                        .reduce((sum, inv) => sum + (parseFloat(inv.invoice_amount) || 0), 0)
                                                        .toLocaleString()}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-blue-700">Total VAT:</span>
                                                <span className="ml-2 font-medium">
                                                    ₱
                                                    {bulkInvoices
                                                        .reduce((sum, inv) => sum + calculateVAT(inv.invoice_amount).vatAmount, 0)
                                                        .toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="max-h-60 space-y-2 overflow-y-auto">
                                        {bulkInvoices.map((invoice, index) => (
                                            <div key={index} className="rounded border p-2 text-sm">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <span className="font-medium">{invoice.si_number}</span>
                                                        <span className="ml-2 text-slate-500">
                                                            {invoice.si_date ? format(new Date(invoice.si_date), 'MMM d, yyyy') : 'No date'}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-medium">₱{Number(invoice.invoice_amount || 0).toLocaleString()}</div>
                                                        <div className="text-xs text-slate-500">
                                                            VAT: ₱{calculateVAT(invoice.invoice_amount).vatAmount.toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-slate-600">SI Number:</span>
                                            <span className="ml-2 font-medium">{singleData.si_number}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-600">Amount:</span>
                                            <span className="ml-2 font-medium">₱{Number(singleData.invoice_amount || 0).toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-600">SI Date:</span>
                                            <span className="ml-2 font-medium">
                                                {singleData.si_date ? format(new Date(singleData.si_date), 'PPP') : 'Not set'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-600">VAT Amount:</span>
                                            <span className="ml-2 font-medium">₱{calculateVAT(singleData.invoice_amount).vatAmount.toFixed(2)}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-600">VAT Exclusive:</span>
                                            <span className="ml-2 font-medium">
                                                ₱{calculateVAT(singleData.invoice_amount).vatableAmount.toFixed(2)}
                                            </span>
                                        </div>
                                        {selectedPO && singleData.invoice_amount && (
                                            <div>
                                                <span className="text-slate-600">% of PO Amount:</span>
                                                <span className="ml-2 font-medium">
                                                    {calculatePOPercentage(singleData.invoice_amount, selectedPO.po_amount).toFixed(2)}%
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {selectedPO && (
                                        <div className="rounded bg-slate-50 p-3">
                                            <h4 className="mb-2 font-medium text-slate-900">Purchase Order</h4>
                                            <div className="text-sm text-slate-700">
                                                {selectedPO.po_number} - {selectedPO.vendor_name}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowConfirmation(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSubmitConfirmed}
                                // disabled={processing}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                                {processing ? 'Processing...' : `Confirm & Submit ${isBulkMode ? `(${bulkInvoices.length})` : ''}`}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default CreateInvoice;
