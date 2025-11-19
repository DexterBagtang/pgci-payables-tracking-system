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
import DialogLoadingFallback from '@/components/custom/DialogLoadingFallback';
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

    // Bulk file upload state
    const [bulkFiles, setBulkFiles] = useState([]);
    const [fileMatching, setFileMatching] = useState([]);

    // Single file sharing verification
    const [showSingleFileDialog, setShowSingleFileDialog] = useState(false);
    const [pendingSingleFile, setPendingSingleFile] = useState(null);

    // Partial upload handling (files < invoices)
    const [showPartialUploadDialog, setShowPartialUploadDialog] = useState(false);
    const [partialUploadData, setPartialUploadData] = useState({ files: [], matches: [], unmatchedInvoiceCount: 0 });

    // Bulk configuration
    const [bulkConfig, setBulkConfig] = useState({
        count: 2,
        siPrefix: '',
        autoIncrementEnabled: false,
        startingNumber: 1,
        inputMode: 'manual', // 'manual' or 'range'
        rangeStart: '',
        rangeEnd: '',
        sharedFields: {
            purchase_order_id: true,
            currency: true,
            invoice_amount: false,
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
            currency: 'PHP',
            invoice_amount: '',
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
        currency: 'PHP',
        due_date: '',
        notes: '',
        submitted_at: '',
        submitted_to: '',
        files: [],
        terms_of_payment: '',
        other_payment_terms: '',
    });

    function createEmptyInvoice(index = 0) {
        // Generate SI number based on input mode
        let siNumber = '';

        if (bulkConfig.inputMode === 'range') {
            // Range Mode: Use range numbers directly as SI numbers (no prefix, no padding)
            if (bulkConfig.rangeStart) {
                const rangeStartNum = parseInt(bulkConfig.rangeStart);
                siNumber = String(rangeStartNum + index);
            }
        } else {
            // Manual Mode: Use prefix with optional auto-increment
            if (bulkConfig.siPrefix) {
                if (bulkConfig.autoIncrementEnabled) {
                    const currentNumber = bulkConfig.startingNumber + index;
                    // Count digits in prefix to determine padding
                    const prefixMatch = bulkConfig.siPrefix.match(/0+$/);
                    const paddingLength = prefixMatch ? prefixMatch[0].length : 3; // Default to 3 if no zeros
                    siNumber = `${bulkConfig.siPrefix.replace(/0+$/, '')}${String(currentNumber).padStart(paddingLength, '0')}`;
                } else {
                    siNumber = bulkConfig.siPrefix;
                }
            }
        }

        // Always populate shared values for flexibility, regardless of sharedFields setting
        const invoice = {
            si_number: siNumber,
            si_date: bulkConfig.sharedValues.si_date || '',
            si_received_at: bulkConfig.sharedValues.si_received_at || '',
            invoice_amount: bulkConfig.sharedValues.invoice_amount || '',
            currency: bulkConfig.sharedValues.currency || 'PHP',
            terms_of_payment: bulkConfig.sharedValues.terms_of_payment || '',
            other_payment_terms: bulkConfig.sharedValues.other_payment_terms || '',
            due_date: bulkConfig.sharedValues.due_date || '',
            notes: bulkConfig.sharedValues.notes || '',
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

    // Filename matching logic - fuzzy match invoice numbers
    const matchFileToInvoice = useCallback((fileName, invoices) => {
        // Remove file extension
        const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');

        // Try to find matching invoice by SI number
        for (let i = 0; i < invoices.length; i++) {
            const invoice = invoices[i];
            if (!invoice.si_number) continue;

            // Normalize both for comparison (remove spaces, hyphens, underscores, lowercase)
            const normalizedSI = invoice.si_number.toLowerCase().replace(/[\s\-_]/g, '');
            const normalizedFileName = nameWithoutExt.toLowerCase().replace(/[\s\-_]/g, '');

            // Check if filename contains the SI number
            if (normalizedFileName.includes(normalizedSI) || normalizedSI.includes(normalizedFileName)) {
                return { matched: true, invoiceIndex: i, invoiceNumber: invoice.si_number };
            }
        }

        return { matched: false, invoiceIndex: null, invoiceNumber: null };
    }, []);

    // Handle bulk file upload
    const handleBulkFilesUpload = useCallback((e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter((file) => {
            const maxSize = 10 * 1024 * 1024; // 10MB
            return file.size <= maxSize;
        });

        if (validFiles.length !== files.length) {
            toast.error('Some files were too large (max 10MB per file) and were not selected.');
        }

        // Check if single file uploaded with multiple invoices
        if (validFiles.length === 1 && bulkInvoices.length > 1) {
            setPendingSingleFile(validFiles[0]);
            setShowSingleFileDialog(true);
            e.target.value = '';
            return;
        }

        // Match files to invoices
        const matches = validFiles.map((file) => {
            const match = matchFileToInvoice(file.name, bulkInvoices);
            return {
                file,
                ...match,
            };
        });

        // Check if files < invoices (partial upload scenario)
        if (validFiles.length < bulkInvoices.length && validFiles.length > 1) {
            // Count how many invoices will remain unmatched
            const matchedInvoiceIndices = new Set(
                matches.filter(m => m.matched && m.invoiceIndex !== null).map(m => m.invoiceIndex)
            );
            const unmatchedInvoiceCount = bulkInvoices.length - matchedInvoiceIndices.size;

            // Show dialog if there are unmatched invoices after auto-matching
            if (unmatchedInvoiceCount > 0) {
                setPartialUploadData({
                    files: validFiles,
                    matches: matches,
                    unmatchedInvoiceCount: unmatchedInvoiceCount
                });
                setShowPartialUploadDialog(true);
                e.target.value = '';
                return;
            }
        }

        setFileMatching(matches);

        // Auto-assign matched files to invoices
        matches.forEach((match) => {
            if (match.matched && match.invoiceIndex !== null) {
                const invoice = bulkInvoices[match.invoiceIndex];
                const existingFiles = invoice.files || [];
                updateBulkInvoice(match.invoiceIndex, 'files', [...existingFiles, match.file]);
            }
        });

        e.target.value = '';
    }, [bulkInvoices, matchFileToInvoice]);

    // Handle remove matched file
    const handleRemoveMatchedFile = useCallback((matchIndex) => {
        const match = fileMatching[matchIndex];

        // Remove from invoice files if it was matched
        if (match.matched && match.invoiceIndex !== null) {
            const invoice = bulkInvoices[match.invoiceIndex];
            const updatedFiles = (invoice.files || []).filter(f => f.name !== match.file.name);
            updateBulkInvoice(match.invoiceIndex, 'files', updatedFiles);
        }

        // Remove from file matching list
        setFileMatching(prev => prev.filter((_, i) => i !== matchIndex));
    }, [fileMatching, bulkInvoices]);

    // Handle file reassignment
    const handleReassignFile = useCallback((matchIndex, newInvoiceIndex) => {
        const match = fileMatching[matchIndex];

        // Remove from old invoice if previously assigned
        if (match.invoiceIndex !== null) {
            const oldInvoice = bulkInvoices[match.invoiceIndex];
            const updatedOldFiles = (oldInvoice.files || []).filter(f => f.name !== match.file.name);
            updateBulkInvoice(match.invoiceIndex, 'files', updatedOldFiles);
        }

        // Add to new invoice
        const newInvoice = bulkInvoices[newInvoiceIndex];
        const existingFiles = newInvoice.files || [];
        updateBulkInvoice(newInvoiceIndex, 'files', [...existingFiles, match.file]);

        // Update matching state
        setFileMatching(prev => prev.map((m, i) =>
            i === matchIndex
                ? { ...m, matched: true, invoiceIndex: newInvoiceIndex, invoiceNumber: newInvoice.si_number || `Invoice ${newInvoiceIndex + 1}` }
                : m
        ));
    }, [fileMatching, bulkInvoices]);

    // Handle single file sharing confirmation
    const handleShareSingleFile = useCallback(() => {
        if (!pendingSingleFile) return;

        // Assign the same file to all invoices
        bulkInvoices.forEach((invoice, index) => {
            const existingFiles = invoice.files || [];
            updateBulkInvoice(index, 'files', [...existingFiles, pendingSingleFile]);
        });

        toast.success(`File "${pendingSingleFile.name}" has been assigned to all ${bulkInvoices.length} invoices.`);
        setShowSingleFileDialog(false);
        setPendingSingleFile(null);
    }, [pendingSingleFile, bulkInvoices]);

    // Handle single file assignment to one invoice
    const handleAssignSingleFileToOne = useCallback(() => {
        if (!pendingSingleFile) return;

        // Add the file as a match for manual assignment
        const match = matchFileToInvoice(pendingSingleFile.name, bulkInvoices);
        const newMatch = {
            file: pendingSingleFile,
            ...match,
        };

        setFileMatching(prev => [...prev, newMatch]);

        // If matched, auto-assign it
        if (match.matched && match.invoiceIndex !== null) {
            const invoice = bulkInvoices[match.invoiceIndex];
            const existingFiles = invoice.files || [];
            updateBulkInvoice(match.invoiceIndex, 'files', [...existingFiles, pendingSingleFile]);
        }

        setShowSingleFileDialog(false);
        setPendingSingleFile(null);
    }, [pendingSingleFile, bulkInvoices, matchFileToInvoice]);

    // Handle partial upload - Share all files with all invoices
    const handleShareAllFilesWithAll = useCallback(() => {
        if (!partialUploadData.files || partialUploadData.files.length === 0) return;

        // Assign all uploaded files to all invoices
        bulkInvoices.forEach((invoice, index) => {
            const existingFiles = invoice.files || [];
            // Add all uploaded files to this invoice
            const allFiles = [...existingFiles, ...partialUploadData.files];
            // Remove duplicates based on file name
            const uniqueFiles = allFiles.filter((file, idx, self) =>
                idx === self.findIndex((f) => f.name === file.name)
            );
            updateBulkInvoice(index, 'files', uniqueFiles);
        });

        toast.success(`${partialUploadData.files.length} file(s) have been assigned to all ${bulkInvoices.length} invoices.`);
        setShowPartialUploadDialog(false);
        setPartialUploadData({ files: [], matches: [], unmatchedInvoiceCount: 0 });
    }, [partialUploadData, bulkInvoices]);

    // Handle partial upload - Continue with manual assignment
    const handleContinueManualAssignment = useCallback(() => {
        if (!partialUploadData.matches || partialUploadData.matches.length === 0) return;

        setFileMatching(partialUploadData.matches);

        // Auto-assign matched files to invoices
        partialUploadData.matches.forEach((match) => {
            if (match.matched && match.invoiceIndex !== null) {
                const invoice = bulkInvoices[match.invoiceIndex];
                const existingFiles = invoice.files || [];
                updateBulkInvoice(match.invoiceIndex, 'files', [...existingFiles, match.file]);
            }
        });

        const matchedCount = partialUploadData.matches.filter(m => m.matched).length;
        const unmatchedCount = partialUploadData.matches.length - matchedCount;

        if (matchedCount > 0) {
            toast.success(`${matchedCount} file(s) auto-matched. ${unmatchedCount > 0 ? `${unmatchedCount} file(s) need manual assignment.` : ''}`);
        } else {
            toast.info(`${unmatchedCount} file(s) need manual assignment.`);
        }

        setShowPartialUploadDialog(false);
        setPartialUploadData({ files: [], matches: [], unmatchedInvoiceCount: 0 });
    }, [partialUploadData, bulkInvoices]);

    // Handle partial upload - Leave unmatched invoices without files
    const handleLeaveUnmatched = useCallback(() => {
        // Same as manual assignment - just proceed with auto-matching
        handleContinueManualAssignment();
    }, [handleContinueManualAssignment]);

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
                currency: po.currency || 'PHP',
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
            // Validate purchase order (required for all invoices)
            if (!bulkConfig.sharedValues.purchase_order_id) {
                newErrors.purchase_order_id = 'Purchase order is required';
            }

            // Validate each bulk invoice individually (since shared values can be edited)
            bulkInvoices.forEach((invoice, index) => {
                if (!invoice.si_number)
                    newErrors[`bulk_${index}_si_number`] = `Invoice ${index + 1}: SI Number is required`;
                if (!invoice.si_date)
                    newErrors[`bulk_${index}_si_date`] = `Invoice ${index + 1}: SI Date is required`;
                if (!invoice.invoice_amount)
                    newErrors[`bulk_${index}_invoice_amount`] = `Invoice ${index + 1}: Amount is required`;
                if (!invoice.terms_of_payment)
                    newErrors[`bulk_${index}_terms_of_payment`] = `Invoice ${index + 1}: Payment terms are required`;
                if (invoice.terms_of_payment === 'others' && !invoice.other_payment_terms) {
                    newErrors[`bulk_${index}_other_payment_terms`] = `Invoice ${index + 1}: Please specify other payment terms`;
                }
                // File upload is now optional - removed validation
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
            // File upload is now optional - removed validation
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setShowConfirmation(true);
        }
    };

    const handleSubmitConfirmed = () => {
        setShowConfirmation(false);
        setProcessing(true);

        // Use individual invoice data as-is (shared values were pre-filled during generation)
        // No need to override since users can edit the pre-filled values
        const invoicesWithSharedData = bulkInvoices.map((invoice) => {
            // Only add purchase_order_id from shared config as it's always required
            return {
                ...invoice,
                purchase_order_id: bulkConfig.sharedValues.purchase_order_id,
            };
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
                        autoIncrementEnabled: false,
                        startingNumber: 1,
                        sharedFields: {
                            purchase_order_id: true,
                            currency: true,
                            invoice_amount: false,
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
                            currency: 'PHP',
                            invoice_amount: '',
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

                             {/*Single Invoice Mode */}
                            {!isBulkMode &&
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
                                                    {singleData.currency === 'USD' ? '$' : '₱'}{Number(singleData.invoice_amount || 0).toLocaleString()}
                                                </div>
                                            </div>

                                            {singleData.invoice_amount && (
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between rounded bg-slate-50 p-2">
                                                        <span>VATable Amount:</span>
                                                        <span className="font-medium">
                                                            {singleData.currency === 'USD' ? '$' : '₱'}{calculateVAT(singleData.invoice_amount).vatableAmount.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between rounded bg-slate-50 p-2">
                                                        <span>VAT (12%):</span>
                                                        <span className="font-medium">
                                                            {singleData.currency === 'USD' ? '$' : '₱'}{calculateVAT(singleData.invoice_amount).vatAmount.toFixed(2)}
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
                                                        <span className="font-medium">{selectedPO.currency === 'USD' ? '$' : '₱'}{Number(selectedPO.po_amount).toLocaleString()}</span>
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
                                                {bulkInvoices[0]?.currency === 'USD' ? '$' : '₱'}{bulkInvoices.reduce((sum, inv) => sum + (parseFloat(inv.invoice_amount) || 0), 0).toLocaleString()}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-500">
                                                EX: {bulkInvoices[0]?.currency === 'USD' ? '$' : '₱'}
                                                {bulkInvoices.reduce((sum, inv) => sum + calculateVAT(inv.invoice_amount).vatableAmount, 0).toFixed(2)}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-500">
                                                VAT: {bulkInvoices[0]?.currency === 'USD' ? '$' : '₱'}
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
                                                    {bulkInvoices[0]?.currency === 'USD' ? '$' : '₱'}
                                                    {bulkInvoices
                                                        .reduce((sum, inv) => sum + (parseFloat(inv.invoice_amount) || 0), 0)
                                                        .toLocaleString()}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-blue-700">Total VAT:</span>
                                                <span className="ml-2 font-medium">
                                                    {bulkInvoices[0]?.currency === 'USD' ? '$' : '₱'}
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
                                                        <div className="font-medium">{invoice.currency === 'USD' ? '$' : '₱'}{Number(invoice.invoice_amount || 0).toLocaleString()}</div>
                                                        <div className="text-xs text-slate-500">
                                                            VAT: {invoice.currency === 'USD' ? '$' : '₱'}{calculateVAT(invoice.invoice_amount).vatAmount.toFixed(2)}
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
                                            <span className="ml-2 font-medium">{singleData.currency === 'USD' ? '$' : '₱'}{Number(singleData.invoice_amount || 0).toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-600">SI Date:</span>
                                            <span className="ml-2 font-medium">
                                                {singleData.si_date ? format(new Date(singleData.si_date), 'PPP') : 'Not set'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-600">VAT Amount:</span>
                                            <span className="ml-2 font-medium">{singleData.currency === 'USD' ? '$' : '₱'}{calculateVAT(singleData.invoice_amount).vatAmount.toFixed(2)}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-600">VAT Exclusive:</span>
                                            <span className="ml-2 font-medium">
                                                {singleData.currency === 'USD' ? '$' : '₱'}{calculateVAT(singleData.invoice_amount).vatableAmount.toFixed(2)}
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

                {/* Single File Sharing Verification Dialog */}
                <Dialog open={showSingleFileDialog} onOpenChange={setShowSingleFileDialog}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center">
                                <FileStack className="mr-2 h-5 w-5 text-blue-600" />
                                Single File Detected
                            </DialogTitle>
                            <DialogDescription className="text-sm">
                                You've uploaded a single file with {bulkInvoices.length} invoices. How would you like to handle this file?
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* File Info */}
                            <div className="rounded border bg-slate-50 p-4">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-8 w-8 text-blue-600" />
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900">{pendingSingleFile?.name}</p>
                                        <p className="text-sm text-slate-500">
                                            {pendingSingleFile && (pendingSingleFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="space-y-3">
                                <div className="rounded border-2 border-blue-200 bg-blue-50/50 p-4">
                                    <div className="mb-2 flex items-start gap-2">
                                        <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-blue-900">Share with all invoices</h4>
                                            <p className="text-sm text-blue-700">
                                                This file contains multiple pages with all {bulkInvoices.length} invoices.
                                                The same file will be attached to all invoices.
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={handleShareSingleFile}
                                        className="mt-3 w-full bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                        <Check className="mr-2 h-4 w-4" />
                                        Yes, Share with All {bulkInvoices.length} Invoices
                                    </Button>
                                </div>

                                <div className="rounded border bg-slate-50 p-4">
                                    <div className="mb-2">
                                        <h4 className="font-semibold text-slate-900">Assign to one invoice only</h4>
                                        <p className="text-sm text-slate-600">
                                            This file belongs to a single invoice. I'll assign it manually.
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleAssignSingleFileToOne}
                                        className="mt-3 w-full"
                                    >
                                        <Receipt className="mr-2 h-4 w-4" />
                                        No, Assign to One Invoice
                                    </Button>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="rounded border border-slate-200 bg-slate-50 p-3">
                                <p className="text-xs text-slate-600">
                                    <strong>Tip:</strong> If your PDF contains all invoices in one file (e.g., 10 invoices in a single PDF),
                                    choose "Share with all invoices". If it's a single invoice file, choose "Assign to one invoice".
                                </p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowSingleFileDialog(false);
                                    setPendingSingleFile(null);
                                }}
                            >
                                Cancel
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Partial Upload Dialog - Files < Invoices */}
                <Dialog open={showPartialUploadDialog} onOpenChange={setShowPartialUploadDialog}>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader className="pb-2">
                            <DialogTitle className="flex items-center text-base">
                                <Upload className="mr-2 h-4 w-4 text-orange-600" />
                                Partial Upload: {partialUploadData.files.length} files for {bulkInvoices.length} invoices
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                {partialUploadData.unmatchedInvoiceCount > 0 && (
                                    <span className="font-medium text-orange-600">
                                        {partialUploadData.unmatchedInvoiceCount} invoice(s) will remain unmatched.
                                    </span>
                                )}
                                {' '}Choose how to handle the files below.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3">
                            {/* Compact Summary + Files Preview in one section */}
                            <div className="grid grid-cols-2 gap-2">
                                {/* Left: Stats */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between rounded border bg-blue-50 px-2 py-1.5">
                                        <span className="text-xs text-blue-700">Files</span>
                                        <span className="text-sm font-bold text-blue-900">{partialUploadData.files.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded border bg-green-50 px-2 py-1.5">
                                        <span className="text-xs text-green-700">Invoices</span>
                                        <span className="text-sm font-bold text-green-900">{bulkInvoices.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded border bg-orange-50 px-2 py-1.5">
                                        <span className="text-xs text-orange-700">Unmatched</span>
                                        <span className="text-sm font-bold text-orange-900">{partialUploadData.unmatchedInvoiceCount}</span>
                                    </div>
                                </div>

                                {/* Right: Files List */}
                                <div className="rounded border bg-slate-50 p-2">
                                    <h4 className="mb-1 text-xs font-medium text-slate-700">Uploaded Files:</h4>
                                    <div className="max-h-20 space-y-0.5 overflow-y-auto">
                                        {partialUploadData.files.map((file, idx) => (
                                            <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600">
                                                <FileText className="h-3 w-3 flex-shrink-0" />
                                                <span className="flex-1 truncate">{file.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Compact Options - Reduced vertical spacing */}
                            <div className="space-y-2">
                                {/* Option 1: Share all files with all invoices */}
                                <div className="rounded border-2 border-blue-200 bg-blue-50/50 p-2.5">
                                    <div className="mb-2 flex items-start gap-2">
                                        <FileStack className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-blue-900">Share with all invoices</h4>
                                            <p className="text-xs text-blue-700">
                                                All {partialUploadData.files.length} files → all {bulkInvoices.length} invoices
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={handleShareAllFilesWithAll}
                                        size="sm"
                                        className="w-full bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                        <FileStack className="mr-1.5 h-3.5 w-3.5" />
                                        Share All Files
                                    </Button>
                                </div>

                                {/* Option 2: Manual assignment */}
                                <div className="rounded border bg-slate-50 p-2.5">
                                    <div className="mb-2 flex items-start gap-2">
                                        <Settings className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-600" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-slate-900">Manual assignment</h4>
                                            <p className="text-xs text-slate-600">
                                                Auto-match by SI number, then assign unmatched files manually
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleContinueManualAssignment}
                                        className="w-full"
                                    >
                                        <Settings className="mr-1.5 h-3.5 w-3.5" />
                                        Manual Assignment
                                    </Button>
                                </div>

                                {/* Option 3: Leave unmatched */}
                                <div className="rounded border border-orange-200 bg-orange-50/50 p-2.5">
                                    <div className="mb-2 flex items-start gap-2">
                                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-orange-900">Auto-match only</h4>
                                            <p className="text-xs text-orange-700">
                                                Only matched files assigned, rest left empty
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleLeaveUnmatched}
                                        className="w-full border-orange-300 text-orange-900 hover:bg-orange-100"
                                    >
                                        <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
                                        Auto-Match Only
                                    </Button>
                                </div>
                            </div>

                            {/* Compact Info Box */}
                            <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1.5">
                                <p className="text-xs text-slate-600">
                                    <strong>Tip:</strong> Fuzzy matching compares filenames with SI numbers (e.g., "INV-001.pdf" → "INV001")
                                </p>
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setShowPartialUploadDialog(false);
                                    setPartialUploadData({ files: [], matches: [], unmatchedInvoiceCount: 0 });
                                }}
                            >
                                Cancel
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default CreateInvoice;
