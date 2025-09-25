import { useState, useCallback, useMemo } from 'react';
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
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    Plus,
    Calculator,
    FileStack,
    Receipt,
    Grid,
    Trash2,
    Copy,
    Download
} from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import BackButton from '@/components/custom/BackButton.jsx';

const CreateInvoice = ({ purchaseOrders = [] }) => {
    const [poComboboxOpen, setPoComboboxOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [bulkInvoices, setBulkInvoices] = useState([createEmptyInvoice()]);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [bulkSettings, setBulkSettings] = useState({
        invoiceCount: 1,
        autoGenerateSI: true,
        siPrefix: 'SI-2024-'
    });

    // Mock useForm functionality for this example
    const [data, setData] = useState({
        purchase_order_id: '',
        si_received_at: '',
        notes: '',
        submitted_at: '',
        submitted_to: '',
        files: [],
    });

    // Create empty invoice structure for bulk mode
    function createEmptyInvoice(index = 0) {
        return {
            si_number: '',
            si_date: '',
            invoice_amount: '',
            due_date: '',
            terms_of_payment: '',
            other_payment_terms: ''
        };
    }

    // Memoized purchase order options
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

    // VAT Calculation (12% VAT)
    const calculateVAT = (amount) => {
        const grossAmount = parseFloat(amount) || 0;
        const vatableAmount = grossAmount / 1.12;
        const vatAmount = grossAmount - vatableAmount;
        return {
            grossAmount,
            vatableAmount,
            vatAmount,
            vatRate: 12
        };
    };

    // Amount Percentage Calculation
    const calculatePercentage = (invoiceAmount) => {
        if (!selectedPO || !invoiceAmount) return 0;
        return ((parseFloat(invoiceAmount) / parseFloat(selectedPO.po_amount)) * 100);
    };

    // Submit To options
    const submitToOptions = [
        'Kimberly Usona',
        'Joseph David Maderazo'
    ];

    // Terms of Payment options
    const paymentTermsOptions = [
        { value: 'downpayment', label: 'Downpayment' },
        { value: 'progress_billing', label: 'Progress Billing' },
        { value: 'final_payment', label: 'Final Payment' },
        { value: 'others', label: 'Others' }
    ];

    // Handle date selection for shared fields
    const handleDateSelect = useCallback((field, date) => {
        setData(prev => ({
            ...prev,
            [field]: date ? format(date, "yyyy-MM-dd") : ''
        }));
    }, []);

    // Handle bulk invoice date selection
    const handleBulkDateSelect = useCallback((index, field, date) => {
        setBulkInvoices(prev => prev.map((invoice, i) =>
            i === index
                ? { ...invoice, [field]: date ? format(date, "yyyy-MM-dd") : '' }
                : invoice
        ));
    }, []);

    // Handle file selection
    const handleFileChange = useCallback((e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            const maxSize = 10 * 1024 * 1024; // 10MB
            return file.size <= maxSize;
        });

        if (validFiles.length !== files.length) {
            alert('Some files were too large (max 10MB per file) and were not selected.');
        }

        setSelectedFiles(validFiles);
        e.target.value = '';
        setData(prev => ({ ...prev, files: validFiles }));
    }, []);

    // Remove selected file
    const removeFile = useCallback((index) => {
        const updatedFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(updatedFiles);
        setData(prev => ({ ...prev, files: updatedFiles }));
    }, [selectedFiles]);

    // Generate bulk invoices based on count
    const generateBulkInvoices = () => {
        const count = Math.min(Math.max(1, bulkSettings.invoiceCount), 1000); // Limit to 1000
        const newInvoices = Array.from({ length: count }, (_, index) =>
            createEmptyInvoice(index)
        );
        setBulkInvoices(newInvoices);
    };

    // Add single invoice to bulk list
    const addBulkInvoice = () => {
        setBulkInvoices(prev => [...prev, createEmptyInvoice(prev.length)]);
    };

    // Remove bulk invoice
    const removeBulkInvoice = (index) => {
        if (bulkInvoices.length > 1) {
            setBulkInvoices(prev => prev.filter((_, i) => i !== index));
        }
    };

    // Update bulk invoice field
    const updateBulkInvoice = (index, field, value) => {
        setBulkInvoices(prev => prev.map((invoice, i) =>
            i === index ? { ...invoice, [field]: value } : invoice
        ));
    };

    // Copy first row values to all rows
    const copyFirstRowToAll = () => {
        if (bulkInvoices.length > 1) {
            const firstRow = { ...bulkInvoices[0] };
            setBulkInvoices(prev => prev.map((_, index) =>
                index === 0 ? firstRow : {
                    ...firstRow,
                    si_number: `${bulkSettings.siPrefix}${String(index + 1).padStart(3, '0')}`
                }
            ));
        }
    };

    // Clear all bulk invoices
    const clearAllBulkInvoices = () => {
        setBulkInvoices([createEmptyInvoice()]);
    };

    // Handle bulk settings change
    const handleBulkSettingsChange = (field, value) => {
        setBulkSettings(prev => ({ ...prev, [field]: value }));
    };

    const handlePreview = (e) => {
        e.preventDefault();

        // Basic validation
        const newErrors = {};

        if (!data.purchase_order_id) newErrors.purchase_order_id = 'Purchase order is required';
        if (!data.submitted_at) newErrors.submitted_at = 'Submission date is required';
        if (!data.submitted_to) newErrors.submitted_to = 'Submit to is required';

        // Validate bulk invoices
        if (isBulkMode) {
            bulkInvoices.forEach((invoice, index) => {
                if (!invoice.si_number) newErrors[`bulk_si_number_${index}`] = `SI Number required for invoice ${index + 1}`;
                if (!invoice.si_date) newErrors[`bulk_si_date_${index}`] = `SI Date required for invoice ${index + 1}`;
                if (!invoice.invoice_amount) newErrors[`bulk_invoice_amount_${index}`] = `Invoice amount required for invoice ${index + 1}`;
                if (!invoice.terms_of_payment) newErrors[`bulk_terms_${index}`] = `Payment terms required for invoice ${index + 1}`;

                if (invoice.terms_of_payment === 'others' && !invoice.other_payment_terms) {
                    newErrors[`bulk_other_terms_${index}`] = `Other payment terms required for invoice ${index + 1}`;
                }
            });
        } else {
            // Single mode validation
            if (!data.si_number) newErrors.si_number = 'SI Number is required';
            if (!data.si_date) newErrors.si_date = 'SI Date is required';
            if (!data.invoice_amount) newErrors.invoice_amount = 'Invoice amount is required';
            if (!data.terms_of_payment) newErrors.terms_of_payment = 'Payment terms are required';

            if (data.terms_of_payment === 'others' && !data.other_payment_terms) {
                newErrors.other_payment_terms = 'Please specify other payment terms';
            }
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setShowConfirmation(true);
        }
    };

    const handleSubmitConfirmed = () => {
        setShowConfirmation(false);
        setProcessing(true);

        // Mock submission
        setTimeout(() => {
            setProcessing(false);
            alert(isBulkMode ? `${bulkInvoices.length} invoices created successfully!` : 'Invoice created successfully!');
            // Reset form
            setData({
                purchase_order_id: '',
                si_received_at: '',
                notes: '',
                submitted_at: '',
                submitted_to: '',
                files: [],
            });
            setSelectedFiles([]);
            setBulkInvoices([createEmptyInvoice()]);
            setIsBulkMode(false);
        }, 2000);
    };

    const errorCount = Object.keys(errors).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container max-w-7xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-slate-900">
                            {isBulkMode ? 'Bulk Create Invoices' : 'Create Invoice'}
                        </h1>
                        <p className="text-slate-600">
                            {isBulkMode ? 'Add multiple invoices for a single purchase order' : 'Add a new supplier invoice to the system'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={isBulkMode ? "default" : "outline"}
                            onClick={() => setIsBulkMode(!isBulkMode)}
                            className="w-fit"
                        >
                            <FileStack className="w-4 h-4 mr-2" />
                            {isBulkMode ? 'Single Mode' : 'Bulk Mode'}
                        </Button>
                        <BackButton />
                    </div>
                </div>

                <form onSubmit={handlePreview}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Purchase Order Selection */}
                            <Card className="shadow-sm border-slate-200">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center text-slate-800">
                                        <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                                        Purchase Order
                                    </CardTitle>
                                    <CardDescription className="text-slate-600">
                                        Select the purchase order for {isBulkMode ? 'these invoices' : 'this invoice'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div>
                                        <Label className="text-sm font-medium text-slate-700">Purchase Order *</Label>
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
                                                            <div className="text-sm text-slate-600 truncate">
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
                                                    <CommandInput placeholder="Search purchase orders..."
                                                                  className="h-9" />
                                                    <CommandEmpty>No purchase order found.</CommandEmpty>
                                                    <CommandList>
                                                        <CommandGroup>
                                                            {poOptions.map((po) => (
                                                                <CommandItem
                                                                    key={po.value}
                                                                    value={`${po.po_number} ${po.vendor_name} ${po.project_title} ${po.cer_number}`}
                                                                    onSelect={() => {
                                                                        setData(prev => ({
                                                                            ...prev,
                                                                            purchase_order_id: po.value
                                                                        }));
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
                                                                            <div
                                                                                className="font-medium">{po.po_number}</div>
                                                                            <div
                                                                                className="text-sm text-slate-600 truncate">
                                                                                {po.vendor_name} • {po.project_title}
                                                                            </div>
                                                                            <div
                                                                                className="text-xs text-slate-500 flex gap-2">
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
                                            <p className="text-sm text-red-600 mt-1">{errors.purchase_order_id}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Bulk Invoice Settings */}
                            {isBulkMode && (
                                <Card className="shadow-sm border-slate-200">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center text-slate-800">
                                            <Grid className="w-5 h-5 mr-2 text-green-600" />
                                            Bulk Settings
                                        </CardTitle>
                                        <CardDescription className="text-slate-600">
                                            Configure how you want to create multiple invoices
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium text-slate-700">Number of
                                                    Invoices</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="1000"
                                                    value={bulkSettings.invoiceCount}
                                                    onChange={(e) => handleBulkSettingsChange('invoiceCount', parseInt(e.target.value) || 1)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-slate-700">SI Number
                                                    Prefix</Label>
                                                <Input
                                                    value={bulkSettings.siPrefix}
                                                    onChange={(e) => handleBulkSettingsChange('siPrefix', e.target.value)}
                                                    placeholder="SI-2024-"
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div className="flex items-end gap-2">
                                                <Button
                                                    type="button"
                                                    onClick={generateBulkInvoices}
                                                    className="w-full"
                                                >
                                                    Generate Invoices
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={copyFirstRowToAll}
                                                size="sm"
                                                disabled={bulkInvoices.length <= 1}
                                            >
                                                <Copy className="w-4 h-4 mr-2" />
                                                Copy First Row to All
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={clearAllBulkInvoices}
                                                size="sm"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Clear All
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Invoice Information */}
                            {!isBulkMode ? (
                                <Card className="shadow-sm border-slate-200">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center text-slate-800">
                                            <FileText className="w-5 h-5 mr-2 text-green-600" />
                                            Invoice Information
                                        </CardTitle>
                                        <CardDescription className="text-slate-600">
                                            Enter the basic invoice details and amount
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium text-slate-700">SI Number
                                                    *</Label>
                                                <Input
                                                    value={data.si_number}
                                                    onChange={e => setData(prev => ({
                                                        ...prev,
                                                        si_number: e.target.value
                                                    }))}
                                                    placeholder="e.g., SI-2024-001"
                                                    className="mt-1"
                                                />
                                                {errors.si_number && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.si_number}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label className="text-sm font-medium text-slate-700">SI Date *</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal mt-1",
                                                                !data.si_date && "text-slate-500"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {data.si_date ? format(new Date(data.si_date), "PPP") : "Select date"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            className="w-64 mx-auto"
                                                            selected={data.si_date ? new Date(data.si_date) : undefined}
                                                            onSelect={(date) => handleDateSelect('si_date', date)}
                                                            captionLayout="dropdown"
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                {errors.si_date && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.si_date}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label className="text-sm font-medium text-slate-700">Invoice Amount
                                                    *</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.invoice_amount}
                                                    onChange={e => setData(prev => ({
                                                        ...prev,
                                                        invoice_amount: e.target.value
                                                    }))}
                                                    placeholder="0.00"
                                                    className="mt-1"
                                                />
                                                {data.invoice_amount && (
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        VAT Breakdown:
                                                        ₱{calculateVAT(data.invoice_amount).vatableAmount.toLocaleString()} +
                                                        ₱{calculateVAT(data.invoice_amount).vatAmount.toLocaleString()} VAT
                                                    </div>
                                                )}
                                                {errors.invoice_amount && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.invoice_amount}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label className="text-sm font-medium text-slate-700">Terms of Payment
                                                    *</Label>
                                                <Select
                                                    value={data.terms_of_payment}
                                                    onValueChange={(value) => setData(prev => ({
                                                        ...prev,
                                                        terms_of_payment: value
                                                    }))}
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
                                                    <p className="text-sm text-red-600 mt-1">{errors.terms_of_payment}</p>
                                                )}
                                            </div>

                                            {data.terms_of_payment === 'others' && (
                                                <div className="md:col-span-2">
                                                    <Label className="text-sm font-medium text-slate-700">Specify Other
                                                        Terms *</Label>
                                                    <Input
                                                        value={data.other_payment_terms}
                                                        onChange={e => setData(prev => ({
                                                            ...prev,
                                                            other_payment_terms: e.target.value
                                                        }))}
                                                        placeholder="Enter payment terms"
                                                        className="mt-1"
                                                    />
                                                    {errors.other_payment_terms && (
                                                        <p className="text-sm text-red-600 mt-1">{errors.other_payment_terms}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                /* Bulk Invoice Creation - Compact Table View */
                                <Card className="shadow-sm border-slate-200">
                                    <CardHeader className="pb-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <CardTitle className="flex items-center text-slate-800">
                                                    <FileStack className="w-5 h-5 mr-2 text-green-600" />
                                                    Bulk Invoices ({bulkInvoices.length})
                                                </CardTitle>
                                                <CardDescription className="text-slate-600">
                                                    Enter invoice details in table format
                                                </CardDescription>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={addBulkInvoice}
                                                size="sm"
                                                variant="outline"
                                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Row
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                <tr className="border-b border-slate-200">
                                                    <th className="text-left p-2 font-medium text-slate-700 w-12">#</th>
                                                    <th className="text-left p-2 font-medium text-slate-700">SI Number
                                                        *
                                                    </th>
                                                    <th className="text-left p-2 font-medium text-slate-700">SI Date *
                                                    </th>
                                                    <th className="text-left p-2 font-medium text-slate-700">Invoice
                                                        Amount *
                                                    </th>
                                                    <th className="text-left p-2 font-medium text-slate-700">Payment
                                                        Terms *
                                                    </th>
                                                    <th className="text-left p-2 font-medium text-slate-700 w-20">Actions</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {bulkInvoices.map((invoice, index) => {
                                                    const vat = calculateVAT(invoice.invoice_amount);
                                                    return (
                                                        <tr key={index}
                                                            className="border-b border-slate-100 hover:bg-slate-50">
                                                            <td className="p-2 text-slate-500">{index + 1}</td>
                                                            <td className="p-2">
                                                                <Input
                                                                    value={invoice.si_number}
                                                                    onChange={e => updateBulkInvoice(index, 'si_number', e.target.value)}
                                                                    placeholder="SI-2024-001"
                                                                    className="w-full h-8 text-sm"
                                                                />
                                                            </td>
                                                            <td className="p-2">
                                                                <Popover>
                                                                    <PopoverTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            className={cn(
                                                                                "w-full h-8 justify-start text-left font-normal text-sm",
                                                                                !invoice.si_date && "text-slate-500"
                                                                            )}
                                                                        >
                                                                            <CalendarIcon className="mr-1 h-3 w-3" />
                                                                            {invoice.si_date ? format(new Date(invoice.si_date), "MMM dd") : "Select"}
                                                                        </Button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-auto p-0"
                                                                                    align="start">
                                                                        <Calendar
                                                                            mode="single"
                                                                            selected={invoice.si_date ? new Date(invoice.si_date) : undefined}
                                                                            onSelect={(date) => handleBulkDateSelect(index, 'si_date', date)}
                                                                        />
                                                                    </PopoverContent>
                                                                </Popover>
                                                            </td>
                                                            <td className="p-2">
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    value={invoice.invoice_amount}
                                                                    onChange={e => updateBulkInvoice(index, 'invoice_amount', e.target.value)}
                                                                    placeholder="0.00"
                                                                    className="w-full h-8 text-sm"
                                                                />
                                                                {invoice.invoice_amount && (
                                                                    <div className="text-xs text-slate-500 mt-1">
                                                                        VAT: ₱{vat.vatAmount.toLocaleString()}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="p-2">
                                                                <Select
                                                                    value={invoice.terms_of_payment}
                                                                    onValueChange={(value) => updateBulkInvoice(index, 'terms_of_payment', value)}
                                                                >
                                                                    <SelectTrigger className="h-8 text-sm">
                                                                        <SelectValue placeholder="Select" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {paymentTermsOptions.map((option) => (
                                                                            <SelectItem key={option.value}
                                                                                        value={option.value}
                                                                                        className="text-sm">
                                                                                {option.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                {invoice.terms_of_payment === 'others' && (
                                                                    <Input
                                                                        value={invoice.other_payment_terms}
                                                                        onChange={e => updateBulkInvoice(index, 'other_payment_terms', e.target.value)}
                                                                        placeholder="Specify terms"
                                                                        className="w-full h-7 text-xs mt-1"
                                                                    />
                                                                )}
                                                            </td>
                                                            <td className="p-2">
                                                                {bulkInvoices.length > 1 && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => removeBulkInvoice(index)}
                                                                        className="h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </Button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Shared Fields for Bulk Mode */}
                            {isBulkMode && (
                                <>
                                    {/* Filing of SI Details */}
                                    <Card className="shadow-sm border-slate-200">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="flex items-center text-slate-800">
                                                <Receipt className="w-5 h-5 mr-2 text-purple-600" />
                                                Shared Invoice Details
                                            </CardTitle>
                                            <CardDescription className="text-slate-600">
                                                These details will apply to all invoices above
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-sm font-medium text-slate-700">SI Received
                                                        Date</Label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    "w-full justify-start text-left font-normal mt-1",
                                                                    !data.si_received_at && "text-slate-500"
                                                                )}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {data.si_received_at ? format(new Date(data.si_received_at), "PPP") : "Select date"}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={data.si_received_at ? new Date(data.si_received_at) : undefined}
                                                                onSelect={(date) => handleDateSelect('si_received_at', date)}
                                                                captionLayout="dropdown"
                                                                className="w-64 mx-auto"
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>

                                                <div>
                                                    <Label className="text-sm font-medium text-slate-700">Submit To
                                                        *</Label>
                                                    <Select
                                                        value={data.submitted_to}
                                                        onValueChange={(value) => setData(prev => ({
                                                            ...prev,
                                                            submitted_to: value
                                                        }))}
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
                                                    {errors.submitted_to && (
                                                        <p className="text-sm text-red-600 mt-1">{errors.submitted_to}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <Label className="text-sm font-medium text-slate-700">Submission Date
                                                    *</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal mt-1",
                                                                !data.submitted_at && "text-slate-500"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {data.submitted_at ? format(new Date(data.submitted_at), "PPP") : "Select date"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={data.submitted_at ? new Date(data.submitted_at) : undefined}
                                                            onSelect={(date) => handleDateSelect('submitted_at', date)}
                                                            captionLayout="dropdown"
                                                            className="w-64 mx-auto"
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                {errors.submitted_at && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.submitted_at}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label className="text-sm font-medium text-slate-700">Shared
                                                    Notes</Label>
                                                <Textarea
                                                    value={data.notes}
                                                    onChange={e => setData(prev => ({
                                                        ...prev,
                                                        notes: e.target.value
                                                    }))}
                                                    placeholder="Notes that apply to all invoices..."
                                                    rows={3}
                                                    className="mt-1 resize-none"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
export default CreateInvoice;


