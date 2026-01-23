import { router, useForm } from '@inertiajs/react';
import { useState, useCallback, useMemo, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    CalendarIcon,
    FileText,
    DollarSign,
    Building2,
    AlertCircle,
    Check,
    ChevronsUpDown,
    X,
    Upload,
    Eye,
    ArrowLeft,
    Download,
    Trash2
} from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge.js';
import { Link } from '@inertiajs/react'
import { toast } from "sonner";
import BackButton from '@/components/custom/BackButton.jsx';
import { DatePicker } from '@/components/custom/DatePicker.jsx';
import { RequiredLabel } from '@/components/custom/RequiredLabel.jsx';
import { PaymentTermsSelect } from '@/components/custom/PaymentTermsSelect.jsx';
import { CurrencyToggle } from '@/components/custom/CurrencyToggle.jsx';
import FileUpload from '@/components/custom/FileUpload';
import { InvoiceTypeSelector } from '@/pages/invoices/components/create/InvoiceTypeSelector';
import { DirectVendorProjectSelector } from '@/pages/invoices/components/create/DirectVendorProjectSelector';

const EditInvoice = ({ invoice, purchaseOrders, vendors = [], projects = [] }) => {
    // Debug: Log vendors to console
    console.log('EditInvoice - Vendors received:', vendors);
    console.log('EditInvoice - Projects received:', projects);
    console.log('EditInvoice - Invoice type:', invoice.invoice_type);
    const [poComboboxOpen, setPoComboboxOpen] = useState(false);
    const [vendorComboboxOpen, setVendorComboboxOpen] = useState(false);
    const [projectComboboxOpen, setProjectComboboxOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [invoiceType, setInvoiceType] = useState(invoice.invoice_type || 'purchase_order');

    const { data, setData, post, processing, errors, reset } = useForm({
        invoice_type: invoice.invoice_type || 'purchase_order',
        purchase_order_id: invoice.purchase_order_id?.toString() || '',
        vendor_id: invoice.vendor_id?.toString() || '',
        project_id: invoice.project_id?.toString() || '',
        si_number: invoice.si_number || '',
        si_date: invoice.si_date || '',
        si_received_at: invoice.si_received_at || '',
        invoice_amount: invoice.invoice_amount || '',
        currency: invoice.currency || 'PHP',
        terms_of_payment: invoice.terms_of_payment || '',
        other_payment_terms: invoice.other_payment_terms || '',
        due_date: invoice.due_date || '',
        notes: invoice.notes || '',
        submitted_at: invoice.submitted_at || '',
        submitted_to: invoice.submitted_to || '',
        files: [],
    });

    // Initialize form with invoice data on mount
    useEffect(() => {
        setData({
            invoice_type: invoice.invoice_type || 'purchase_order',
            purchase_order_id: invoice.purchase_order_id?.toString() || '',
            vendor_id: invoice.vendor_id?.toString() || '',
            project_id: invoice.project_id?.toString() || '',
            si_number: invoice.si_number || '',
            si_date: invoice.si_date || '',
            si_received_at: invoice.si_received_at || '',
            invoice_amount: invoice.invoice_amount || '',
            currency: invoice.currency || 'PHP',
            terms_of_payment: invoice.terms_of_payment || '',
            other_payment_terms: invoice.other_payment_terms || '',
            due_date: invoice.due_date || '',
            notes: invoice.notes || '',
            submitted_at: invoice.submitted_at || '',
            submitted_to: invoice.submitted_to || '',
            files: [],
        });
        setInvoiceType(invoice.invoice_type || 'purchase_order');
    }, [invoice]);

    // Payment terms options (matching SingleMode)
    const paymentTermsOptions = [
        { value: 'downpayment', label: 'Downpayment' },
        { value: 'progress_billing', label: 'Progress Billing' },
        { value: 'final_payment', label: 'Final Payment' },
        { value: 'others', label: 'Others' },
    ];

    // Submit to options (matching SingleMode)
    const submitToOptions = ['Kimberly Usona', 'Joseph David Maderazo'];

    // Memoized purchase order options for better performance
    const poOptions = useMemo(() =>
            purchaseOrders.map(po => ({
                value: po.id.toString(),
                label: `${po.po_number} - ${po.vendor?.name || 'No Vendor'} - ${po.project?.project_title || 'No Project'} - ${po.project.cer_number}`,
                po_number: po.po_number,
                vendor_name: po.vendor?.name || 'No Vendor',
                project_title: po.project?.project_title || 'No Project',
                po_amount: po.po_amount,
                po_status: po.po_status,
                cer_number: po.project.cer_number
            })),
        [purchaseOrders]
    );

    const selectedPO = useMemo(() =>
            poOptions.find(po => po.value === data.purchase_order_id?.toString()),
        [poOptions, data.purchase_order_id]
    );

    // Calculate PO percentage (matching SingleMode)
    const calculatePOPercentage = useCallback((invoiceAmount, poAmount) => {
        if (!invoiceAmount || !poAmount) return 0;
        return (parseFloat(invoiceAmount) / parseFloat(poAmount)) * 100;
    }, []);

    // Calculate VAT breakdown (matching SingleMode)
    const calculateVAT = useCallback((amount) => {
        const totalAmount = parseFloat(amount) || 0;
        const vatableAmount = totalAmount / 1.12;
        const vatAmount = totalAmount - vatableAmount;
        return { vatableAmount, vatAmount };
    }, []);

    // Handle date selection
    const handleDateSelect = useCallback((field, date) => {
        setData(field, date ? format(date, "yyyy-MM-dd") : '');
    }, [setData]);

    // Handle file selection with validation
    const handleFileChange = useCallback((e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            const maxSize = 20 * 1024 * 1024; // 20MB
            return file.size <= maxSize;
        });

        if (validFiles.length !== files.length) {
            toast.error('Some files were too large (max 20MB per file) and were not selected.');
        }

        setSelectedFiles(prev => [...prev, ...validFiles]);
        e.target.value = '';
        setData('files', [...selectedFiles, ...validFiles]);
    }, [selectedFiles, setData]);

    // Remove selected new file
    const removeFile = useCallback((index) => {
        const updatedFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(updatedFiles);
        setData('files', updatedFiles);
    }, [selectedFiles, setData]);

    const handlePreview = (e) => {
        e.preventDefault();
        setShowConfirmation(true);
    };

    const handleSubmitConfirmed = () => {
        setShowConfirmation(false);
        post(`/invoices/${invoice.id}`, {
            _method: 'patch',
            onSuccess: () => {
                toast.success('Invoice updated successfully.');
            },
            onError: () => {
                toast.error('Failed to update invoice. Please check the form and try again.');
            }
        });
    };

    // Error summary for better UX
    const errorCount = Object.keys(errors).length;

    // Download file handler
    const downloadFile = useCallback((file) => {
        window.open(`/storage/${file.file_path}`, '_blank');
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container max-w-6xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-slate-900">Edit Invoice</h1>
                        <p className="text-slate-600">Update invoice details and information</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/invoices/${invoice.id}`} prefetch>
                            <Button variant="outline" className="w-fit">
                                <Eye className="w-4 h-4 mr-2" />
                                View
                            </Button>
                        </Link>
                        <BackButton/>
                    </div>
                </div>

                <form onSubmit={handlePreview}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Invoice Type Selection */}
                            <InvoiceTypeSelector
                                value={invoiceType}
                                onChange={(type) => {
                                    setInvoiceType(type);
                                    setData({
                                        ...data,
                                        invoice_type: type,
                                        // Clear opposite fields
                                        ...(type === 'purchase_order'
                                            ? { vendor_id: '', project_id: '' }
                                            : { purchase_order_id: '' }
                                        )
                                    });
                                }}
                            />

                            {/* Conditional: Purchase Order Selection or Direct Vendor/Project */}
                            {invoiceType === 'purchase_order' ? (
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center text-lg">
                                        <Building2 className="mr-2 h-4 w-4 text-blue-600" />
                                        Purchase Order Selection
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div>
                                        <Label className="text-sm font-medium">Purchase Order<RequiredLabel /></Label>
                                        <Popover open={poComboboxOpen} onOpenChange={setPoComboboxOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={poComboboxOpen}
                                                    className={cn(
                                                        "w-full justify-between h-auto min-h-[40px] text-left mt-1",
                                                        !selectedPO && "text-slate-500"
                                                    )}
                                                >
                                                    {selectedPO ? (
                                                        <div className="flex flex-col items-start py-1">
                                                            <div className="font-medium">{selectedPO.po_number}</div>
                                                            <div className="text-sm text-slate-600 text-wrap truncate">
                                                                {selectedPO.vendor_name} • {selectedPO.project_title}
                                                            </div>
                                                            <div className="text-xs text-slate-500">
                                                                ₱{Number(selectedPO.po_amount).toLocaleString()} • {selectedPO.po_status}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        "Select purchase order..."
                                                    )}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder="Search purchase orders..." className="h-9" />
                                                    <CommandEmpty>No purchase order found.</CommandEmpty>
                                                    <CommandList>
                                                        <CommandGroup>
                                                            {poOptions.map((po) => (
                                                                <CommandItem
                                                                    key={po.value}
                                                                    value={`${po.po_number} ${po.vendor_name} ${po.project_title} ${po.cer_number}`}
                                                                    onSelect={() => {
                                                                        setData('purchase_order_id', po.value);
                                                                        setPoComboboxOpen(false);
                                                                    }}
                                                                    className="flex flex-col items-start py-3"
                                                                >
                                                                    <div className="flex items-center w-full">
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                selectedPO?.value === po.value ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        <div className="flex-1">
                                                                            <div className="font-medium">{po.po_number}</div>
                                                                            <div className="text-sm text-slate-600 truncate">
                                                                                {po.vendor_name} • {po.project_title}
                                                                            </div>
                                                                            <div className="text-xs text-slate-500 flex gap-2">
                                                                                <span>₱{Number(po.po_amount).toLocaleString()}</span>
                                                                                <span>•</span>
                                                                                <span className={cn(
                                                                                    "capitalize px-1 rounded",
                                                                                    po.po_status === 'payable' && "bg-green-100 text-green-700",
                                                                                    po.po_status === 'closed' && "bg-gray-100 text-gray-700"
                                                                                )}>
                                                                                    {po.po_status}
                                                                                </span>
                                                                                <span>•</span>
                                                                                <span>CER:{po.cer_number}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        {errors.purchase_order_id && (
                                            <p className="mt-1 text-xs text-red-600">{errors.purchase_order_id}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                            ) : (
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center text-lg">
                                        <Building2 className="mr-2 h-4 w-4 text-orange-600" />
                                        Direct Invoice - Vendor & Project
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        {vendors.length === 0 && (
                                            <span className="text-amber-600 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                No vendors loaded. Please contact support if this persists.
                                            </span>
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <DirectVendorProjectSelector
                                        vendors={vendors}
                                        selectedVendorId={data.vendor_id}
                                        onVendorChange={(vendorId) => {
                                            setData('vendor_id', vendorId);
                                            setData('project_id', ''); // Clear project when vendor changes
                                        }}
                                    />
                                    {errors.vendor_id && (
                                        <p className="mt-2 text-xs text-red-600">{errors.vendor_id}</p>
                                    )}
                                </CardContent>
                            </Card>
                            )}

                            {/* Invoice Information - Using DatePicker and PaymentTermsSelect components */}
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
                                            <Label className="text-sm font-medium">SI Number<RequiredLabel /></Label>
                                            <Input
                                                value={data.si_number}
                                                onChange={(e) => setData('si_number', e.target.value)}
                                                placeholder="e.g., SI-2024-001"
                                                className="mt-1"
                                            />
                                            {errors.si_number && <p className="mt-1 text-xs text-red-600">{errors.si_number}</p>}
                                        </div>

                                        <DatePicker
                                            label="SI Date"
                                            value={data.si_date}
                                            onChange={(date) => handleDateSelect('si_date', date)}
                                            error={errors.si_date}
                                            required={true}
                                        />

                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <Label className="text-sm font-medium">Invoice Amount<RequiredLabel /></Label>
                                                <CurrencyToggle
                                                    value={data.currency || 'PHP'}
                                                    onChange={(value) => setData('currency', value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="relative">
                                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
                                                        {data.currency === 'USD' ? '$' : '₱'}
                                                    </span>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={data.invoice_amount}
                                                        onChange={(e) => setData('invoice_amount', e.target.value)}
                                                        placeholder="0.00"
                                                        className="pl-8 pr-16"
                                                    />
                                                    {selectedPO && data.invoice_amount && (
                                                        <div className="absolute top-0 right-1 flex h-10 items-center">
                                                            <span className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                                                                {calculatePOPercentage(data.invoice_amount, selectedPO.po_amount).toFixed(0)}%
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* VAT Breakdown */}
                                                {data.invoice_amount && (
                                                    <div className="rounded-md border bg-slate-50 p-2">
                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-600">Vatable Amount:</span>
                                                                <span className="font-medium">
                                                                    {data.currency === 'USD' ? '$' : '₱'}{calculateVAT(data.invoice_amount).vatableAmount.toFixed(2)}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-600">VAT (12%):</span>
                                                                <span className="font-medium">
                                                                    {data.currency === 'USD' ? '$' : '₱'}{calculateVAT(data.invoice_amount).vatAmount.toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {errors.invoice_amount && <p className="mt-1 text-xs text-red-600">{errors.invoice_amount}</p>}
                                        </div>

                                        <PaymentTermsSelect
                                            value={data.terms_of_payment}
                                            onChange={(value) => setData('terms_of_payment', value)}
                                            otherValue={data.other_payment_terms}
                                            onOtherChange={(value) => setData('other_payment_terms', value)}
                                            error={errors.terms_of_payment}
                                            otherError={errors.other_payment_terms}
                                            paymentTermsOptions={paymentTermsOptions}
                                            required={true}
                                        />

                                        <DatePicker
                                            label="SI Received Date"
                                            value={data.si_received_at}
                                            onChange={(date) => handleDateSelect('si_received_at', date)}
                                            error={errors.si_received_at}
                                            required={true}
                                        />

                                        <DatePicker
                                            label="Due Date"
                                            value={data.due_date}
                                            onChange={(date) => handleDateSelect('due_date', date)}
                                            error={errors.due_date}
                                            required={false}
                                        />

                                        <div>
                                            <Label className="text-sm font-medium">Submit To<RequiredLabel /></Label>
                                            <Select
                                                value={data.submitted_to}
                                                onValueChange={(value) => setData('submitted_to', value)}
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

                                        <DatePicker
                                            label="Submission Date"
                                            value={data.submitted_at}
                                            onChange={(date) => handleDateSelect('submitted_at', date)}
                                            error={errors.submitted_at}
                                            required={true}
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium">Notes</Label>
                                        <Textarea
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Additional notes about this invoice..."
                                            rows={3}
                                            className="mt-1 resize-none"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Attachments */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center text-lg">
                                        <Upload className="mr-2 h-4 w-4 text-orange-600" />
                                        Attachments
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FileUpload
                                        files={selectedFiles}
                                        onChange={(newFiles) => {
                                            setSelectedFiles(newFiles);
                                            setData('files', newFiles);
                                        }}
                                        existingFiles={invoice.files || []}
                                        onDownloadFile={downloadFile}
                                        label="Upload Additional Files"
                                        description="PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT (Max 20MB). New files will be added to existing attachments."
                                        variant="compact"
                                        maxFiles={10}
                                        maxSizePerFile={20}
                                        accept={['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.txt']}
                                        error={errors?.files}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Summary and Actions */}
                        <div className="space-y-6">
                            {/* Invoice Summary */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center text-lg">
                                        <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                                        Invoice Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-center p-4 bg-slate-50 rounded border">
                                        <div className="text-sm text-slate-600 mb-1">Total Amount</div>
                                        <div className="text-3xl font-bold text-slate-900">
                                            {data.currency === 'USD' ? '$' : '₱'}{Number(data.invoice_amount || 0).toLocaleString()}
                                        </div>
                                    </div>

                                    {selectedPO && data.invoice_amount && (
                                        <div className="rounded-md border bg-blue-50 p-3">
                                            <div className="text-xs text-slate-600 mb-1">PO Utilization</div>
                                            <div className="text-lg font-bold text-blue-700">
                                                {calculatePOPercentage(data.invoice_amount, selectedPO.po_amount).toFixed(1)}%
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                of ₱{Number(selectedPO.po_amount).toLocaleString()}
                                            </div>
                                        </div>
                                    )}

                                    {data.invoice_amount && (
                                        <div className="rounded-md border bg-slate-50 p-3">
                                            <div className="text-xs font-medium text-slate-600 mb-2">VAT Breakdown</div>
                                            <div className="space-y-1 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600">Vatable Amount:</span>
                                                    <span className="font-medium">
                                                        {data.currency === 'USD' ? '$' : '₱'}{calculateVAT(data.invoice_amount).vatableAmount.toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600">VAT (12%):</span>
                                                    <span className="font-medium">
                                                        {data.currency === 'USD' ? '$' : '₱'}{calculateVAT(data.invoice_amount).vatAmount.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedPO && (
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                            <h4 className="text-xs font-medium text-blue-800 mb-2 uppercase tracking-wide">Selected Purchase Order</h4>
                                            <div className="text-xs text-blue-700 space-y-1">
                                                <div className="flex justify-between">
                                                    <span>PO Number:</span>
                                                    <span className="font-medium">{selectedPO.po_number}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Vendor:</span>
                                                    <span className="font-medium truncate ml-2">{selectedPO.vendor_name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>PO Amount:</span>
                                                    <span className="font-medium">₱{Number(selectedPO.po_amount).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Status:</span>
                                                    <span className={cn(
                                                        "font-medium capitalize px-2 py-0.5 rounded text-xs",
                                                        selectedPO.po_status === 'payable' && "bg-green-200 text-green-800",
                                                        selectedPO.po_status === 'closed' && "bg-gray-200 text-gray-800"
                                                    )}>
                                                        {selectedPO.po_status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* File Changes Summary */}
                                    {selectedFiles.length > 0 && (
                                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                                            <h4 className="text-xs font-medium text-amber-800 mb-2 uppercase tracking-wide">File Changes</h4>
                                            <div className="text-xs text-amber-700 space-y-1">
                                                <div className="flex justify-between">
                                                    <span>New files to add:</span>
                                                    <span className="font-medium">{selectedFiles.length}</span>
                                                </div>
                                                <div className="flex justify-between border-t border-amber-300 pt-1">
                                                    <span>Total files after update:</span>
                                                    <span className="font-medium">
                                                        {(invoice.files?.length || 0) + selectedFiles.length}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Action Card */}
                            <Card className="shadow-sm">
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <Button
                                            type="submit"
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                            disabled={processing}
                                            size="lg"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            Preview & Update
                                        </Button>

                                        {errorCount > 0 && (
                                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                                <div className="flex items-start">
                                                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <h3 className="text-xs font-medium text-red-800 mb-1">
                                                            Please fix {errorCount} error{errorCount > 1 ? 's' : ''} before updating:
                                                        </h3>
                                                        <ul className="text-xs text-red-700 space-y-1">
                                                            {Object.entries(errors).map(([field, error]) => (
                                                                <li key={field} className="flex items-center">
                                                                    <span className="w-1 h-1 bg-red-600 rounded-full mr-2 flex-shrink-0"></span>
                                                                    <span className="capitalize">
                                                                        {field.replace('_', ' ')}: {error}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>

                {/* Confirmation Dialog */}
                <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center text-lg">
                                <Eye className="w-5 h-5 mr-2 text-blue-600" />
                                Review Invoice Changes
                            </DialogTitle>
                            <DialogDescription>
                                Verify all changes before updating the invoice.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 text-sm">
                            {/* PO Info */}
                            {selectedPO && (
                                <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                                    <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wide mb-2">Purchase Order</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <div className="text-slate-500">PO #</div>
                                            <div className="font-medium">{selectedPO.po_number}</div>
                                        </div>
                                        <div>
                                            <div className="text-slate-500">Vendor</div>
                                            <div className="font-medium">{selectedPO.vendor_name}</div>
                                        </div>
                                        <div>
                                            <div className="text-slate-500">Project</div>
                                            <div className="font-medium truncate">{selectedPO.project_title}</div>
                                        </div>
                                        <div>
                                            <div className="text-slate-500">Amount</div>
                                            <div className="font-bold text-emerald-600">₱{Number(selectedPO.po_amount).toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Invoice Details */}
                            <div className="border border-emerald-200 rounded-lg p-3 bg-emerald-50">
                                <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wide mb-2">Invoice Information</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <div className="text-slate-500">SI Number</div>
                                        <div>{data.si_number || <span className="text-slate-400">—</span>}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500">SI Date</div>
                                        <div>{data.si_date ? format(new Date(data.si_date), "MMM d, yyyy") : "—"}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500">Invoice Amount</div>
                                        <div className="font-bold text-emerald-600">
                                            {data.invoice_amount ? `${data.currency === 'USD' ? '$' : '₱'}${Number(data.invoice_amount).toLocaleString()}` : "—"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500">Payment Terms</div>
                                        <div>{paymentTermsOptions.find(opt => opt.value === data.terms_of_payment)?.label || data.other_payment_terms || "—"}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500">Due Date</div>
                                        <div>{data.due_date ? format(new Date(data.due_date), "MMM d, yyyy") : "—"}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500">Received Date</div>
                                        <div>{data.si_received_at ? format(new Date(data.si_received_at), "MMM d, yyyy") : "—"}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500">Submitted To</div>
                                        <div>{data.submitted_to || "—"}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500">Submission Date</div>
                                        <div>{data.submitted_at ? format(new Date(data.submitted_at), "MMM d, yyyy") : "—"}</div>
                                    </div>
                                </div>
                            </div>

                            {/* File Changes */}
                            {selectedFiles.length > 0 && (
                                <div className="border border-purple-200 rounded-lg p-3 bg-purple-50">
                                    <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wide mb-2">New Files to Add</h3>
                                    <div className="text-slate-600 text-xs mb-1">New Files ({selectedFiles.length})</div>
                                    <ul className="text-xs text-slate-700 space-y-1">
                                        {selectedFiles.map((file, i) => (
                                            <li key={i} className="truncate">
                                                📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Notes */}
                            {data.notes && (
                                <div className="border border-rose-200 rounded-lg p-3 bg-rose-50">
                                    <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wide mb-2">Notes</h3>
                                    <p className="text-slate-700 text-xs leading-relaxed">{data.notes}</p>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowConfirmation(false)}
                            >
                                Edit More
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSubmitConfirmed}
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Confirm & Update
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default EditInvoice;
