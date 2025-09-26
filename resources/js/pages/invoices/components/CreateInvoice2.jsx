import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.js';
import { Textarea } from '@/components/ui/textarea';
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
    FileText,
    Plus,
    Receipt,
    Settings,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

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

    // Submit To options
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
                if (invoice.terms_of_payment === 'others' && !invoice.other_payment_terms) {
                    newErrors[`bulk_${index}_other_payment_terms`] = `Invoice ${index + 1}: Please specify other payment terms`;
                }
            });
        } else {
            // Validate single invoice
            if (!singleData.purchase_order_id) newErrors.purchase_order_id = 'Purchase order is required';
            if (!singleData.si_number) newErrors.si_number = 'SI Number is required';
            if (!singleData.si_date) newErrors.si_date = 'SI Date is required';
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
                    alert(`${isBulkMode ? bulkInvoices.length : '1'} invoice(s) created successfully!`);
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
                        siPrefix: 'SI-',
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
                },
                onError: (error) => {
                    console.log(error);
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
                                <>
                                    <Card className="shadow-sm">
                                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                                            <div>
                                                <CardTitle className="flex items-center text-lg">
                                                    <Receipt className="mr-2 h-4 w-4 text-green-600" />
                                                    Invoice Details ({bulkInvoices.length} items)
                                                </CardTitle>
                                                <CardDescription className="text-xs">
                                                    Enter invoice details. Shared fields are pre-filled.
                                                </CardDescription>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={resetBulkMode}
                                                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                            >
                                                <Settings className="mr-1 h-3 w-3" />
                                                Reconfigure
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="p-3">
                                            {/* Table Container */}
                                            <div className="rounded-md border">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-slate-100 hover:bg-slate-100">
                                                            <TableHead className="w-[50px] text-xs font-medium">#</TableHead>
                                                            <TableHead className="w-[180px] text-xs font-medium">SI Number *</TableHead>
                                                            {!bulkConfig.sharedFields.si_date && (
                                                                <TableHead className="text-xs font-medium">SI Date *</TableHead>
                                                            )}
                                                            <TableHead className="text-xs font-medium">Amount *</TableHead>
                                                            <TableHead className="text-center text-xs font-medium">VAT</TableHead>
                                                            {!bulkConfig.sharedFields.terms_of_payment && (
                                                                <TableHead className="text-xs font-medium">Payment Terms *</TableHead>
                                                            )}
                                                            {!bulkConfig.sharedFields.si_received_at && (
                                                                <TableHead className="text-xs font-medium">Received Date</TableHead>
                                                            )}
                                                            {!bulkConfig.sharedFields.due_date && (
                                                                <TableHead className="text-xs font-medium">Due Date</TableHead>
                                                            )}
                                                            {!bulkConfig.sharedFields.notes && (
                                                                <TableHead className="text-xs font-medium">Notes</TableHead>
                                                            )}
                                                            <TableHead className="w-[80px] text-xs font-medium">Actions</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {bulkInvoices.map((invoice, index) => (
                                                            <TableRow key={index} className="hover:bg-slate-50">
                                                                {/* Index */}
                                                                <TableCell className="text-xs font-medium text-slate-600">{index + 1}</TableCell>

                                                                {/* SI Number */}
                                                                <TableCell>
                                                                    <Input
                                                                        value={invoice.si_number}
                                                                        onChange={(e) => updateBulkInvoice(index, 'si_number', e.target.value)}
                                                                        placeholder={`${bulkConfig.siPrefix}${String(index + 1).padStart(3, '0')}`}
                                                                        className="h-8 text-xs"
                                                                    />
                                                                    {errors[`bulk_${index}_si_number`] && (
                                                                        <p className="mt-1 text-xs text-red-600">
                                                                            {errors[`bulk_${index}_si_number`]}
                                                                        </p>
                                                                    )}
                                                                </TableCell>

                                                                {/* SI Date */}
                                                                {!bulkConfig.sharedFields.si_date && (
                                                                    <TableCell>
                                                                        <Popover>
                                                                            <PopoverTrigger asChild>
                                                                                <Button
                                                                                    variant="outline"
                                                                                    className={cn(
                                                                                        'h-8 w-full justify-start text-xs',
                                                                                        !invoice.si_date && 'text-slate-400',
                                                                                    )}
                                                                                >
                                                                                    <CalendarIcon className="mr-1 h-3 w-3" />
                                                                                    {invoice.si_date
                                                                                        ? format(new Date(invoice.si_date), 'MMM d')
                                                                                        : 'Date'}
                                                                                </Button>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className="w-auto p-0">
                                                                                <Calendar
                                                                                    mode="single"
                                                                                    selected={invoice.si_date ? new Date(invoice.si_date) : undefined}
                                                                                    onSelect={(date) => handleBulkDateSelect(index, 'si_date', date)}
                                                                                />
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                        {errors[`bulk_${index}_si_date`] && (
                                                                            <p className="mt-1 text-xs text-red-600">
                                                                                {errors[`bulk_${index}_si_date`]}
                                                                            </p>
                                                                        )}
                                                                    </TableCell>
                                                                )}

                                                                {/* Invoice Amount */}
                                                                <TableCell>
                                                                    <div className="space-y-1">
                                                                        <div className="relative">
                                                                            <Input
                                                                                type="number"
                                                                                step="0.01"
                                                                                value={invoice.invoice_amount}
                                                                                onChange={(e) =>
                                                                                    updateBulkInvoice(index, 'invoice_amount', e.target.value)
                                                                                }
                                                                                placeholder="0.00"
                                                                                className="h-8 pr-9 text-xs" // add padding-right so text doesn't overlap
                                                                            />
                                                                            <span className="absolute inset-y-0 right-2 flex items-center text-xs text-slate-500">
                                                                                {selectedPO && (
                                                                                    <span className="font-semibold text-blue-700">
                                                                                        {calculatePOPercentage(
                                                                                            invoice.invoice_amount,
                                                                                            selectedPO.po_amount,
                                                                                        ).toFixed(0)}
                                                                                        %
                                                                                    </span>
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    {errors[`bulk_${index}_invoice_amount`] && (
                                                                        <p className="mt-1 text-xs text-red-600">
                                                                            {errors[`bulk_${index}_invoice_amount`]}
                                                                        </p>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="align-top">
                                                                    <div className="space-y-0.5 rounded-md border bg-slate-50 p-1 text-[11px] leading-tight text-slate-700">
                                                                        <div className="flex justify-between">
                                                                            <span className="text-slate-500">Ex:</span>
                                                                            <span className="font-medium">
                                                                                ₱{calculateVAT(invoice.invoice_amount).vatableAmount.toFixed(2)}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span className="text-slate-500">VAT:</span>
                                                                            <span className="font-medium">
                                                                                ₱{calculateVAT(invoice.invoice_amount).vatAmount.toFixed(2)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </TableCell>

                                                                {/* Payment Terms */}
                                                                {!bulkConfig.sharedFields.terms_of_payment && (
                                                                    <TableCell>
                                                                        <Select
                                                                            value={invoice.terms_of_payment}
                                                                            onValueChange={(value) =>
                                                                                updateBulkInvoice(index, 'terms_of_payment', value)
                                                                            }
                                                                        >
                                                                            <SelectTrigger className="h-8 text-xs">
                                                                                <SelectValue placeholder="Terms" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {paymentTermsOptions.map((option) => (
                                                                                    <SelectItem
                                                                                        key={option.value}
                                                                                        value={option.value}
                                                                                        className="text-xs"
                                                                                    >
                                                                                        {option.label}
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                        {invoice.terms_of_payment === 'others' && (
                                                                            <Input
                                                                                value={invoice.other_payment_terms}
                                                                                onChange={(e) =>
                                                                                    updateBulkInvoice(index, 'other_payment_terms', e.target.value)
                                                                                }
                                                                                placeholder="Specify terms"
                                                                                className="mt-1 h-6 text-xs"
                                                                            />
                                                                        )}
                                                                        {errors[`bulk_${index}_terms_of_payment`] && (
                                                                            <p className="mt-1 text-xs text-red-600">
                                                                                {errors[`bulk_${index}_terms_of_payment`]}
                                                                            </p>
                                                                        )}
                                                                    </TableCell>
                                                                )}

                                                                {/* SI Received Date */}
                                                                {!bulkConfig.sharedFields.si_received_at && (
                                                                    <TableCell>
                                                                        <Popover>
                                                                            <PopoverTrigger asChild>
                                                                                <Button
                                                                                    variant="outline"
                                                                                    className={cn(
                                                                                        'h-8 w-full justify-start text-xs',
                                                                                        !invoice.si_received_at && 'text-slate-400',
                                                                                    )}
                                                                                >
                                                                                    <CalendarIcon className="mr-1 h-3 w-3" />
                                                                                    {invoice.si_received_at
                                                                                        ? format(new Date(invoice.si_received_at), 'MMM d')
                                                                                        : 'Received'}
                                                                                </Button>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className="w-auto p-0">
                                                                                <Calendar
                                                                                    mode="single"
                                                                                    selected={
                                                                                        invoice.si_received_at
                                                                                            ? new Date(invoice.si_received_at)
                                                                                            : undefined
                                                                                    }
                                                                                    onSelect={(date) =>
                                                                                        handleBulkDateSelect(index, 'si_received_at', date)
                                                                                    }
                                                                                />
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                    </TableCell>
                                                                )}

                                                                {/* Due Date */}
                                                                {!bulkConfig.sharedFields.due_date && (
                                                                    <TableCell>
                                                                        <Popover>
                                                                            <PopoverTrigger asChild>
                                                                                <Button
                                                                                    variant="outline"
                                                                                    className={cn(
                                                                                        'h-8 w-full justify-start text-xs',
                                                                                        !invoice.due_date && 'text-slate-400',
                                                                                    )}
                                                                                >
                                                                                    <CalendarIcon className="mr-1 h-3 w-3" />
                                                                                    {invoice.due_date
                                                                                        ? format(new Date(invoice.due_date), 'MMM d')
                                                                                        : 'Due'}
                                                                                </Button>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className="w-auto p-0">
                                                                                <Calendar
                                                                                    mode="single"
                                                                                    selected={
                                                                                        invoice.due_date ? new Date(invoice.due_date) : undefined
                                                                                    }
                                                                                    onSelect={(date) => handleBulkDateSelect(index, 'due_date', date)}
                                                                                />
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                    </TableCell>
                                                                )}

                                                                {/* Notes */}
                                                                {!bulkConfig.sharedFields.notes && (
                                                                    <TableCell>
                                                                        <Input
                                                                            value={invoice.notes || ''}
                                                                            onChange={(e) => updateBulkInvoice(index, 'notes', e.target.value)}
                                                                            placeholder="Invoice notes..."
                                                                            className="h-8 text-xs"
                                                                        />
                                                                    </TableCell>
                                                                )}

                                                                {/* Actions */}
                                                                <TableCell>
                                                                    <div className="flex items-center gap-1">
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => duplicateBulkInvoice(index)}
                                                                            className="h-6 w-6 p-0"
                                                                            title="Duplicate"
                                                                        >
                                                                            <Copy className="h-3 w-3 text-blue-600" />
                                                                        </Button>
                                                                        {bulkInvoices.length > 1 && (
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => deleteBulkInvoice(index)}
                                                                                className="h-6 w-6 p-0"
                                                                                title="Delete"
                                                                            >
                                                                                <Trash2 className="h-3 w-3 text-red-600" />
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>

                                            {/* Add Invoice Button */}
                                            <div className="mt-3 flex justify-center">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setBulkInvoices((prev) => [...prev, createEmptyInvoice(prev.length)]);
                                                    }}
                                                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                                >
                                                    <Plus className="mr-1 h-3 w-3" />
                                                    Add Row
                                                </Button>
                                            </div>

                                            {/* Shared Configuration Summary */}
                                            <div className="mt-4 rounded border bg-blue-50 p-3">
                                                <h4 className="mb-2 text-sm font-medium text-blue-800">Shared Configuration Summary</h4>
                                                <div className="grid grid-cols-2 gap-2 text-xs text-blue-700 md:grid-cols-4">
                                                    {Object.entries(bulkConfig.sharedFields)
                                                        .filter(([_, isShared]) => isShared)
                                                        .map(([field, _]) => {
                                                            const fieldConfig = sharedFieldOptions.find((f) => f.key === field);
                                                            if (!fieldConfig) return null;
                                                            return (
                                                                <div key={field} className="flex items-center">
                                                                    <Check className="mr-1 h-3 w-3 text-green-600" />
                                                                    <span>{fieldConfig.label}</span>
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="shadow-sm">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center text-lg">
                                                <Upload className="mr-2 h-4 w-4 text-orange-600" />
                                                Individual Invoice Attachments
                                            </CardTitle>
                                            <CardDescription className="text-sm">Each invoice can have separate attachments</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="max-h-96 space-y-4 overflow-y-auto">
                                                {bulkInvoices.map((invoice, index) => (
                                                    <div key={index} className="rounded border p-3">
                                                        <div className="mb-2 flex items-center justify-between">
                                                            <Label className="text-sm font-medium">
                                                                {invoice.si_number || `Invoice ${index + 1}`} Files
                                                            </Label>
                                                            <label
                                                                htmlFor={`bulk-files-${index}`}
                                                                className="cursor-pointer rounded bg-blue-50 px-3 py-1 text-xs text-blue-700 hover:bg-blue-100"
                                                            >
                                                                <Upload className="mr-1 inline h-3 w-3" />
                                                                Upload
                                                            </label>
                                                            <input
                                                                id={`bulk-files-${index}`}
                                                                type="file"
                                                                multiple
                                                                onChange={(e) => handleBulkInvoiceFileChange(index, e)}
                                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                                                                className="hidden"
                                                            />
                                                        </div>

                                                        {invoice.files && invoice.files.length > 0 && (
                                                            <div className="space-y-1">
                                                                {invoice.files.map((file, fileIndex) => (
                                                                    <div
                                                                        key={fileIndex}
                                                                        className="flex items-center justify-between rounded bg-slate-50 p-2 text-xs"
                                                                    >
                                                                        <div className="min-w-0 flex-1">
                                                                            <p className="truncate font-medium text-slate-900">{file.name}</p>
                                                                            <p className="text-slate-500">
                                                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                                                            </p>
                                                                        </div>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => removeBulkInvoiceFile(index, fileIndex)}
                                                                            className="h-6 w-6 p-0 text-red-600 hover:bg-red-50 hover:text-red-800"
                                                                        >
                                                                            <X className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {(!invoice.files || invoice.files.length === 0) && (
                                                            <p className="py-2 text-center text-xs text-slate-500">No files selected</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            )}

                            {/* Single Invoice Mode */}
                            {!isBulkMode && (
                                <>
                                    <Card className="shadow-sm">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center text-lg">
                                                <FileText className="mr-2 h-4 w-4 text-green-600" />
                                                Invoice Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div>
                                                    <Label className="text-sm font-medium">SI Number *</Label>
                                                    <Input
                                                        value={singleData.si_number}
                                                        onChange={(e) =>
                                                            setSingleData((prev) => ({
                                                                ...prev,
                                                                si_number: e.target.value,
                                                            }))
                                                        }
                                                        placeholder="e.g., SI-2024-001"
                                                        className="mt-1"
                                                    />
                                                    {errors.si_number && <p className="mt-1 text-xs text-red-600">{errors.si_number}</p>}
                                                </div>

                                                <div>
                                                    <Label className="text-sm font-medium">SI Date *</Label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    'mt-1 w-full justify-start text-left font-normal',
                                                                    !singleData.si_date && 'text-slate-500',
                                                                )}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {singleData.si_date ? format(new Date(singleData.si_date), 'PPP') : 'Select date'}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0">
                                                            <Calendar
                                                                mode="single"
                                                                selected={singleData.si_date ? new Date(singleData.si_date) : undefined}
                                                                onSelect={(date) => handleDateSelect('si_date', date)}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    {errors.si_date && <p className="mt-1 text-xs text-red-600">{errors.si_date}</p>}
                                                </div>

                                                <div>
                                                    <Label className="text-sm font-medium">Invoice Amount *</Label>
                                                    <div className="mt-1 space-y-2">
                                                        <div className="relative">
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                value={singleData.invoice_amount}
                                                                onChange={(e) =>
                                                                    setSingleData((prev) => ({
                                                                        ...prev,
                                                                        invoice_amount: e.target.value,
                                                                    }))
                                                                }
                                                                placeholder="0.00"
                                                                className="pr-16"
                                                            />
                                                            {selectedPO && singleData.invoice_amount && (
                                                                <div className="absolute top-0 right-1 flex h-10 items-center">
                                <span className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                                    {calculatePOPercentage(singleData.invoice_amount, selectedPO.po_amount).toFixed(0)}%
                                </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* VAT Breakdown */}
                                                        {singleData.invoice_amount && (
                                                            <div className="rounded-md border bg-slate-50 p-2">
                                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                                    <div className="flex justify-between">
                                                                        <span className="text-slate-600">Vatable Amount:</span>
                                                                        <span className="font-medium">
                                        ₱{calculateVAT(singleData.invoice_amount).vatableAmount.toFixed(2)}
                                    </span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-slate-600">VAT (12%):</span>
                                                                        <span className="font-medium">
                                        ₱{calculateVAT(singleData.invoice_amount).vatAmount.toFixed(2)}
                                    </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {errors.invoice_amount && <p className="mt-1 text-xs text-red-600">{errors.invoice_amount}</p>}
                                                </div>

                                                <div>
                                                    <Label className="text-sm font-medium">Terms of Payment *</Label>
                                                    <Select
                                                        value={singleData.terms_of_payment}
                                                        onValueChange={(value) =>
                                                            setSingleData((prev) => ({
                                                                ...prev,
                                                                terms_of_payment: value,
                                                            }))
                                                        }
                                                    >
                                                        <SelectTrigger className="mt-1">
                                                            <SelectValue placeholder="Select payment terms" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {paymentTermsOptions.map((option) => (
                                                                <SelectItem key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.terms_of_payment && (
                                                        <p className="mt-1 text-xs text-red-600">{errors.terms_of_payment}</p>
                                                    )}
                                                </div>

                                                {singleData.terms_of_payment === 'others' && (
                                                    <div className="md:col-span-2">
                                                        <Label className="text-sm font-medium">Specify Other Terms *</Label>
                                                        <Input
                                                            value={singleData.other_payment_terms}
                                                            onChange={(e) =>
                                                                setSingleData((prev) => ({
                                                                    ...prev,
                                                                    other_payment_terms: e.target.value,
                                                                }))
                                                            }
                                                            placeholder="Enter payment terms"
                                                            className="mt-1"
                                                        />
                                                        {errors.other_payment_terms && (
                                                            <p className="mt-1 text-xs text-red-600">{errors.other_payment_terms}</p>
                                                        )}
                                                    </div>
                                                )}

                                                <div>
                                                    <Label className="text-sm font-medium">SI Received Date</Label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    'mt-1 w-full justify-start text-left font-normal',
                                                                    !singleData.si_received_at && 'text-slate-500',
                                                                )}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {singleData.si_received_at
                                                                    ? format(new Date(singleData.si_received_at), 'PPP')
                                                                    : 'Select date'}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0">
                                                            <Calendar
                                                                mode="single"
                                                                selected={singleData.si_received_at ? new Date(singleData.si_received_at) : undefined}
                                                                onSelect={(date) => handleDateSelect('si_received_at', date)}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>

                                                <div>
                                                    <Label className="text-sm font-medium">Due Date</Label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    'mt-1 w-full justify-start text-left font-normal',
                                                                    !singleData.due_date && 'text-slate-500',
                                                                )}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {singleData.due_date ? format(new Date(singleData.due_date), 'PPP') : 'Select date'}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0">
                                                            <Calendar
                                                                mode="single"
                                                                captionLayout="dropdown"
                                                                className="w-56"
                                                                selected={singleData.due_date ? new Date(singleData.due_date) : undefined}
                                                                onSelect={(date) => handleDateSelect('due_date', date)}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>

                                                <div>
                                                    <Label className="text-sm font-medium">Submit To *</Label>
                                                    <Select
                                                        value={singleData.submitted_to}
                                                        onValueChange={(value) =>
                                                            setSingleData((prev) => ({
                                                                ...prev,
                                                                submitted_to: value,
                                                            }))
                                                        }
                                                    >
                                                        <SelectTrigger className="mt-1">
                                                            <SelectValue placeholder="Select recipient" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {submitToOptions.map((option) => (
                                                                <SelectItem key={option} value={option}>
                                                                    {option}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.submitted_to && <p className="mt-1 text-xs text-red-600">{errors.submitted_to}</p>}
                                                </div>

                                                <div>
                                                    <Label className="text-sm font-medium">Submission Date *</Label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    'mt-1 w-full justify-start text-left font-normal',
                                                                    !singleData.submitted_at && 'text-slate-500',
                                                                )}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {singleData.submitted_at
                                                                    ? format(new Date(singleData.submitted_at), 'PPP')
                                                                    : 'Select date'}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0">
                                                            <Calendar
                                                                mode="single"
                                                                selected={singleData.submitted_at ? new Date(singleData.submitted_at) : undefined}
                                                                onSelect={(date) => handleDateSelect('submitted_at', date)}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    {errors.submitted_at && <p className="mt-1 text-xs text-red-600">{errors.submitted_at}</p>}
                                                </div>
                                            </div>

                                            <div>
                                                <Label className="text-sm font-medium">Notes</Label>
                                                <Textarea
                                                    value={singleData.notes}
                                                    onChange={(e) =>
                                                        setSingleData((prev) => ({
                                                            ...prev,
                                                            notes: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="Additional notes about this invoice..."
                                                    rows={3}
                                                    className="mt-1 resize-none"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="shadow-sm">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center text-lg">
                                                <Upload className="mr-2 h-4 w-4 text-orange-600" />
                                                Attachments{' '}
                                                {isBulkMode && <span className="ml-2 text-sm text-slate-500">(Shared for all invoices)</span>}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div>
                                                    <label
                                                        htmlFor="files"
                                                        className="inline-block cursor-pointer rounded bg-blue-50 px-4 py-2 text-sm text-blue-700 hover:bg-blue-100"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Upload className="h-4 w-4" />
                                                            <span>Upload Files</span>
                                                        </div>
                                                    </label>
                                                    <input
                                                        id="files"
                                                        type="file"
                                                        multiple
                                                        onChange={handleFileChange}
                                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                                                        className="hidden"
                                                    />
                                                    <p className="mt-1 text-xs text-slate-500">PDF, DOC, XLS, JPG, PNG (Max: 10MB per file)</p>
                                                </div>

                                                {selectedFiles.length > 0 && (
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">Selected Files ({selectedFiles.length})</Label>
                                                        <div className="space-y-1">
                                                            {selectedFiles.map((file, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-center justify-between rounded border bg-slate-50 p-2 text-sm"
                                                                >
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="truncate text-xs font-medium text-slate-900">{file.name}</p>
                                                                        <p className="text-xs text-slate-500">
                                                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                                                        </p>
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => removeFile(index)}
                                                                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-800"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            )}
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
                                                VAT: ₱
                                                {bulkInvoices.reduce((sum, inv) => sum + calculateVAT(inv.invoice_amount).vatAmount, 0).toFixed(2)}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardContent className="pt-4">
                                        <div className="space-y-3">
                                            <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700" disabled={processing}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Submit All ({bulkInvoices.length})
                                            </Button>

                                            {errorCount > 0 && (
                                                <div className="text-center">
                                                    <div className="text-xs font-medium text-red-600">
                                                        {errorCount} error{errorCount > 1 ? 's' : ''} found
                                                    </div>
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
                                disabled={processing}
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
