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
    Receipt
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

    // Mock useForm functionality for this example
    const [data, setData] = useState({
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
        other_payment_terms: ''
    });

    // Create empty invoice structure for bulk mode
    function createEmptyInvoice() {
        return {
            si_number: '',
            si_date: '',
            invoice_amount: '',
            due_date: '',
            notes: '',
            submitted_at: '',
            submitted_to: '',
            terms_of_payment: '',
            other_payment_terms: '',
            files: []
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
    const vatCalculation = useMemo(() => {
        const amount = parseFloat(data.invoice_amount) || 0;
        const vatableAmount = amount / 1.12;
        const vatAmount = amount - vatableAmount;
        return {
            grossAmount: amount,
            vatableAmount: vatableAmount,
            vatAmount: vatAmount,
            vatRate: 12
        };
    }, [data.invoice_amount]);

    // Amount Percentage Calculation
    const amountPercentage = useMemo(() => {
        if (!selectedPO || !data.invoice_amount) return 0;
        return ((parseFloat(data.invoice_amount) / parseFloat(selectedPO.po_amount)) * 100);
    }, [data.invoice_amount, selectedPO]);

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

    // Handle date selection
    const handleDateSelect = useCallback((field, date) => {
        setData(prev => ({
            ...prev,
            [field]: date ? format(date, "yyyy-MM-dd") : ''
        }));
    }, []);

    // Handle bulk date selection
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

    // Add new bulk invoice
    const addBulkInvoice = () => {
        setBulkInvoices(prev => [...prev, createEmptyInvoice()]);
    };

    // Remove bulk invoice
    const removeBulkInvoice = (index) => {
        setBulkInvoices(prev => prev.filter((_, i) => i !== index));
    };

    // Update bulk invoice
    const updateBulkInvoice = (index, field, value) => {
        setBulkInvoices(prev => prev.map((invoice, i) =>
            i === index ? { ...invoice, [field]: value } : invoice
        ));
    };

    const handlePreview = (e) => {
        e.preventDefault();

        // Basic validation
        const newErrors = {};

        if (!data.purchase_order_id) newErrors.purchase_order_id = 'Purchase order is required';
        if (!data.si_number) newErrors.si_number = 'SI Number is required';
        if (!data.si_date) newErrors.si_date = 'SI Date is required';
        if (!data.invoice_amount) newErrors.invoice_amount = 'Invoice amount is required';
        if (!data.submitted_at) newErrors.submitted_at = 'Submission date is required';
        if (!data.submitted_to) newErrors.submitted_to = 'Submit to is required';
        if (!data.terms_of_payment) newErrors.terms_of_payment = 'Payment terms are required';

        if (data.terms_of_payment === 'others' && !data.other_payment_terms) {
            newErrors.other_payment_terms = 'Please specify other payment terms';
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
            alert('Invoice created successfully!');
            // Reset form
            setData({
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
                other_payment_terms: ''
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
                                                    <CommandInput placeholder="Search purchase orders..." className="h-9" />
                                                    <CommandEmpty>No purchase order found.</CommandEmpty>
                                                    <CommandList>
                                                        <CommandGroup>
                                                            {poOptions.map((po) => (
                                                                <CommandItem
                                                                    key={po.value}
                                                                    value={`${po.po_number} ${po.vendor_name} ${po.project_title} ${po.cer_number}`}
                                                                    onSelect={() => {
                                                                        setData(prev => ({ ...prev, purchase_order_id: po.value }));
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
                                            <p className="text-sm text-red-600 mt-1">{errors.purchase_order_id}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

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
                                                <Label className="text-sm font-medium text-slate-700">SI Number *</Label>
                                                <Input
                                                    value={data.si_number}
                                                    onChange={e => setData(prev => ({ ...prev, si_number: e.target.value }))}
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
                                                <Label className="text-sm font-medium text-slate-700">Invoice Amount *</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.invoice_amount}
                                                    onChange={e => setData(prev => ({ ...prev, invoice_amount: e.target.value }))}
                                                    placeholder="0.00"
                                                    className="mt-1"
                                                />
                                                {errors.invoice_amount && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.invoice_amount}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label className="text-sm font-medium text-slate-700">Due Date</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal mt-1",
                                                                !data.due_date && "text-slate-500"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {data.due_date ? format(new Date(data.due_date), "PPP") : "Select date"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={data.due_date ? new Date(data.due_date) : undefined}
                                                            onSelect={(date) => handleDateSelect('due_date', date)}
                                                            captionLayout="dropdown"
                                                            className="w-64 mx-auto"
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                {errors.due_date && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.due_date}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label className="text-sm font-medium text-slate-700">Terms of Payment *</Label>
                                                <Select
                                                    value={data.terms_of_payment}
                                                    onValueChange={(value) => setData(prev => ({ ...prev, terms_of_payment: value }))}
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
                                                <div>
                                                    <Label className="text-sm font-medium text-slate-700">Specify Other Terms *</Label>
                                                    <Input
                                                        value={data.other_payment_terms}
                                                        onChange={e => setData(prev => ({ ...prev, other_payment_terms: e.target.value }))}
                                                        placeholder="Enter payment terms"
                                                        className="mt-1"
                                                    />
                                                    {errors.other_payment_terms && (
                                                        <p className="text-sm text-red-600 mt-1">{errors.other_payment_terms}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium text-slate-700">Notes</Label>
                                            <Textarea
                                                value={data.notes}
                                                onChange={e => setData(prev => ({ ...prev, notes: e.target.value }))}
                                                placeholder="Additional notes about this invoice..."
                                                rows={3}
                                                className="mt-1 resize-none"
                                            />
                                            {errors.notes && (
                                                <p className="text-sm text-red-600 mt-1">{errors.notes}</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                /* Bulk Invoice Creation */
                                <Card className="shadow-sm border-slate-200">
                                    <CardHeader className="pb-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <CardTitle className="flex items-center text-slate-800">
                                                    <FileStack className="w-5 h-5 mr-2 text-green-600" />
                                                    Bulk Invoice Creation
                                                </CardTitle>
                                                <CardDescription className="text-slate-600">
                                                    Create multiple invoices for the selected purchase order
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
                                                Add Invoice
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-6">
                                            {bulkInvoices.map((invoice, index) => (
                                                <div key={index} className="border border-slate-200 rounded-lg p-4 relative">
                                                    {bulkInvoices.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeBulkInvoice(index)}
                                                            className="absolute top-2 right-2 text-red-600 hover:text-red-800 hover:bg-red-50"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    )}

                                                    <div className="mb-4">
                                                        <h4 className="font-medium text-slate-800">Invoice #{index + 1}</h4>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <Label className="text-sm font-medium text-slate-700">SI Number *</Label>
                                                            <Input
                                                                value={invoice.si_number}
                                                                onChange={e => updateBulkInvoice(index, 'si_number', e.target.value)}
                                                                placeholder="e.g., SI-2024-001"
                                                                className="mt-1"
                                                            />
                                                        </div>

                                                        <div>
                                                            <Label className="text-sm font-medium text-slate-700">SI Date *</Label>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        className={cn(
                                                                            "w-full justify-start text-left font-normal mt-1",
                                                                            !invoice.si_date && "text-slate-500"
                                                                        )}
                                                                    >
                                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                                        {invoice.si_date ? format(new Date(invoice.si_date), "MMM d, yyyy") : "Select date"}
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0" align="start">
                                                                    <Calendar
                                                                        mode="single"
                                                                        className="w-64 mx-auto"
                                                                        selected={invoice.si_date ? new Date(invoice.si_date) : undefined}
                                                                        onSelect={(date) => handleBulkDateSelect(index, 'si_date', date)}
                                                                        captionLayout="dropdown"
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                        </div>

                                                        <div>
                                                            <Label className="text-sm font-medium text-slate-700">Invoice Amount *</Label>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                value={invoice.invoice_amount}
                                                                onChange={e => updateBulkInvoice(index, 'invoice_amount', e.target.value)}
                                                                placeholder="0.00"
                                                                className="mt-1"
                                                            />
                                                        </div>

                                                        <div>
                                                            <Label className="text-sm font-medium text-slate-700">Terms of Payment *</Label>
                                                            <Select
                                                                value={invoice.terms_of_payment}
                                                                onValueChange={(value) => updateBulkInvoice(index, 'terms_of_payment', value)}
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
                                                        </div>

                                                        <div>
                                                            <Label className="text-sm font-medium text-slate-700">Submit To *</Label>
                                                            <Select
                                                                value={invoice.submitted_to}
                                                                onValueChange={(value) => updateBulkInvoice(index, 'submitted_to', value)}
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
                                                        </div>

                                                        <div>
                                                            <Label className="text-sm font-medium text-slate-700">Submission Date *</Label>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        className={cn(
                                                                            "w-full justify-start text-left font-normal mt-1",
                                                                            !invoice.submitted_at && "text-slate-500"
                                                                        )}
                                                                    >
                                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                                        {invoice.submitted_at ? format(new Date(invoice.submitted_at), "MMM d, yyyy") : "Select date"}
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0" align="start">
                                                                    <Calendar
                                                                        mode="single"
                                                                        selected={invoice.submitted_at ? new Date(invoice.submitted_at) : undefined}
                                                                        onSelect={(date) => handleBulkDateSelect(index, 'submitted_at', date)}
                                                                        captionLayout="dropdown"
                                                                        className="w-64 mx-auto"
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                        </div>
                                                    </div>

                                                    {invoice.terms_of_payment === 'others' && (
                                                        <div className="mt-4">
                                                            <Label className="text-sm font-medium text-slate-700">Specify Other Terms *</Label>
                                                            <Input
                                                                value={invoice.other_payment_terms}
                                                                onChange={e => updateBulkInvoice(index, 'other_payment_terms', e.target.value)}
                                                                placeholder="Enter payment terms"
                                                                className="mt-1"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="mt-4">
                                                        <Label className="text-sm font-medium text-slate-700">Notes</Label>
                                                        <Textarea
                                                            value={invoice.notes}
                                                            onChange={e => updateBulkInvoice(index, 'notes', e.target.value)}
                                                            placeholder="Additional notes..."
                                                            rows={2}
                                                            className="mt-1 resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Filing of SI Details */}
                            <Card className="shadow-sm border-slate-200">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center text-slate-800">
                                        <Receipt className="w-5 h-5 mr-2 text-purple-600" />
                                        Filing of SI Details
                                    </CardTitle>
                                    <CardDescription className="text-slate-600">
                                        Track filing and submission information
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-slate-700">SI Received Date</Label>
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
                                            {errors.si_received_at && (
                                                <p className="text-sm text-red-600 mt-1">{errors.si_received_at}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium text-slate-700">Submit To *</Label>
                                            <Select
                                                value={data.submitted_to}
                                                onValueChange={(value) => setData(prev => ({ ...prev, submitted_to: value }))}
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
                                        <Label className="text-sm font-medium text-slate-700">Submission Date *</Label>
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
                                </CardContent>
                            </Card>

                            {/* Attachments */}
                            <Card className="shadow-sm border-slate-200">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center text-slate-800">
                                        <Upload className="w-5 h-5 mr-2 text-orange-600" />
                                        Attachments
                                    </CardTitle>
                                    <CardDescription className="text-slate-600">
                                        Upload supporting documents for this invoice
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <div>
                                                <label
                                                    htmlFor="files"
                                                    className="inline-block cursor-pointer px-6 py-2 rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Upload className="w-4 h-4" />
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
                                            </div>

                                            <p className="text-sm text-slate-500 mt-1">
                                                Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max: 10MB per file)
                                            </p>
                                            {errors.files && (
                                                <p className="text-sm text-red-600 mt-1">{errors.files}</p>
                                            )}
                                        </div>

                                        {selectedFiles.length > 0 && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">
                                                    Selected Files ({selectedFiles.length})
                                                </Label>
                                                <div className="space-y-2">
                                                    {selectedFiles.map((file, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between p-2 bg-slate-50 rounded border"
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-slate-900 truncate">
                                                                    {file.name}
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                                </p>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeFile(index)}
                                                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Summary and Actions */}
                        <div className="space-y-6">
                            {/* VAT Computation */}
                            {data.invoice_amount && (
                                <Card className="shadow-sm border-slate-200">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center text-slate-800">
                                            <Calculator className="w-5 h-5 mr-2 text-blue-600" />
                                            VAT Computation
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="text-center p-4 bg-blue-50 rounded border">
                                            <div className="text-sm text-blue-600 mb-1">Gross Amount</div>
                                            <div className="text-2xl font-bold text-blue-900">
                                                ₱{vatCalculation.grossAmount.toLocaleString()}
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between p-2 bg-slate-50 rounded">
                                                <span>VATable Amount:</span>
                                                <span className="font-medium">₱{vatCalculation.vatableAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between p-2 bg-slate-50 rounded">
                                                <span>VAT ({vatCalculation.vatRate}%):</span>
                                                <span className="font-medium">₱{vatCalculation.vatAmount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Invoice Summary */}
                            <Card className="shadow-sm border-slate-200">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center text-slate-800">
                                        <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                                        Invoice Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-center p-4 bg-slate-50 rounded border">
                                        <div className="text-sm text-slate-600 mb-1">Total Amount</div>
                                        <div className="text-3xl font-bold text-slate-900">
                                            ₱{Number(data.invoice_amount || 0).toLocaleString()}
                                        </div>
                                    </div>

                                    {selectedPO && data.invoice_amount && (
                                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                                            <div className="text-sm text-amber-700 mb-2">
                                                <span className="font-medium">Amount Percentage:</span>
                                            </div>
                                            <div className="text-lg font-bold text-amber-800">
                                                {amountPercentage.toFixed(2)}%
                                            </div>
                                            <div className="text-xs text-amber-600 mt-1">
                                                (₱{Number(data.invoice_amount).toLocaleString()} ÷ ₱{Number(selectedPO.po_amount).toLocaleString()} × 100)
                                            </div>
                                        </div>
                                    )}

                                    {selectedPO && (
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                                            <h4 className="text-sm font-medium text-blue-800 mb-2">Selected Purchase Order</h4>
                                            <div className="text-sm text-blue-700 space-y-1">
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
                                </CardContent>
                            </Card>

                            {/* Action Card */}
                            <Card className="shadow-sm border-slate-200">
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <Button
                                            type="submit"
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                            disabled={processing}
                                            size="lg"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            {isBulkMode ? 'Preview & Submit All' : 'Preview & Submit'}
                                        </Button>

                                        {errorCount > 0 && (
                                            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                                                <div className="flex items-start">
                                                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <h3 className="text-sm font-medium text-red-800 mb-2">
                                                            Please fix {errorCount} error{errorCount > 1 ? 's' : ''} before submitting:
                                                        </h3>
                                                        <ul className="text-sm text-red-700 space-y-1">
                                                            {Object.entries(errors).map(([field, error]) => (
                                                                <li key={field} className="flex items-center">
                                                                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2 flex-shrink-0"></span>
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
                    <DialogContent className="!max-w-5xl max-h-[90vh] overflow-y-auto p-4">
                        <DialogHeader className="pb-3">
                            <DialogTitle className="flex items-center text-lg">
                                <Eye className="w-5 h-5 mr-2 text-blue-600" />
                                {isBulkMode ? 'Review Bulk Invoices' : 'Review Invoice'}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-600">
                                Verify before submission.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 text-sm">
                            {/* PO Info */}
                            {selectedPO && (
                                <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                                    <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wide mb-2">PO Info</h3>
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
                            {!isBulkMode ? (
                                <div className="border border-emerald-200 rounded-lg p-3 bg-emerald-50">
                                    <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wide mb-2">Invoice Details</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <div className="text-slate-500">SI #</div>
                                            <div>{data.si_number || "—"}</div>
                                        </div>
                                        <div>
                                            <div className="text-slate-500">Date</div>
                                            <div>{data.si_date ? format(new Date(data.si_date), "MMM d, yyyy") : "—"}</div>
                                        </div>
                                        <div>
                                            <div className="text-slate-500">Amount</div>
                                            <div className="font-bold text-emerald-600">
                                                {data.invoice_amount ? `₱${Number(data.invoice_amount).toLocaleString()}` : "—"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-slate-500">Due Date</div>
                                            <div>{data.due_date ? format(new Date(data.due_date), "MMM d") : "—"}</div>
                                        </div>
                                        <div>
                                            <div className="text-slate-500">Payment Terms</div>
                                            <div className="capitalize">
                                                {data.terms_of_payment === 'others'
                                                    ? data.other_payment_terms
                                                    : data.terms_of_payment?.replace('_', ' ') || "—"
                                                }
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-slate-500">Amount %</div>
                                            <div className="font-medium text-amber-600">
                                                {selectedPO && data.invoice_amount ? `${amountPercentage.toFixed(2)}%` : "—"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* VAT Info */}
                                    {data.invoice_amount && (
                                        <div className="mt-3 pt-3 border-t border-emerald-300">
                                            <div className="text-slate-500 text-xs mb-2">VAT Breakdown</div>
                                            <div className="grid grid-cols-3 gap-2 text-xs">
                                                <div>
                                                    <div className="text-slate-500">VATable</div>
                                                    <div>₱{vatCalculation.vatableAmount.toLocaleString()}</div>
                                                </div>
                                                <div>
                                                    <div className="text-slate-500">VAT (12%)</div>
                                                    <div>₱{vatCalculation.vatAmount.toLocaleString()}</div>
                                                </div>
                                                <div>
                                                    <div className="text-slate-500">Gross</div>
                                                    <div className="font-bold">₱{vatCalculation.grossAmount.toLocaleString()}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Bulk Invoice Summary */
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wide">
                                        Bulk Invoices ({bulkInvoices.length})
                                    </h3>
                                    {bulkInvoices.map((invoice, index) => (
                                        <div key={index} className="border border-emerald-200 rounded-lg p-3 bg-emerald-50">
                                            <h4 className="font-medium text-emerald-800 mb-2">Invoice #{index + 1}</h4>
                                            <div className="grid grid-cols-3 gap-2 text-xs">
                                                <div>
                                                    <div className="text-slate-500">SI #</div>
                                                    <div>{invoice.si_number || "—"}</div>
                                                </div>
                                                <div>
                                                    <div className="text-slate-500">Amount</div>
                                                    <div className="font-bold">
                                                        {invoice.invoice_amount ? `₱${Number(invoice.invoice_amount).toLocaleString()}` : "—"}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-slate-500">Payment Terms</div>
                                                    <div className="capitalize">
                                                        {invoice.terms_of_payment === 'others'
                                                            ? invoice.other_payment_terms
                                                            : invoice.terms_of_payment?.replace('_', ' ') || "—"
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Filing Details */}
                            <div className="border border-purple-200 rounded-lg p-3 bg-purple-50">
                                <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wide mb-2">Filing Details</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <div className="text-slate-500">Received Date</div>
                                        <div>{data.si_received_at ? format(new Date(data.si_received_at), "MMM d, yyyy") : "—"}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500">Submit To</div>
                                        <div>{data.submitted_to || "—"}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500">Submission Date</div>
                                        <div>{data.submitted_at ? format(new Date(data.submitted_at), "MMM d, yyyy") : "—"}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes and Files */}
                            {(data.notes || selectedFiles.length > 0) && (
                                <div className="space-y-3">
                                    {data.notes && (
                                        <div className="border border-amber-200 rounded-lg p-3 bg-amber-50">
                                            <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wide mb-2">Notes</h3>
                                            <p className="text-slate-700 text-xs leading-tight">{data.notes}</p>
                                        </div>
                                    )}

                                    {selectedFiles.length > 0 && (
                                        <div className="border border-rose-200 rounded-lg p-3 bg-rose-50">
                                            <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wide mb-2">
                                                Attachments ({selectedFiles.length})
                                            </h3>
                                            <ul className="text-xs text-slate-700 space-y-1">
                                                {selectedFiles.map((file, i) => (
                                                    <li key={i} className="truncate">
                                                        📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <DialogFooter className="pt-4 border-t bg-slate-50 -mx-4 mt-4 px-4">
                            <div className="flex flex-col sm:flex-row gap-2 w-full">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowConfirmation(false)}
                                    className="text-xs py-1 px-3 border-slate-300 hover:bg-slate-50"
                                >
                                    Edit
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleSubmitConfirmed}
                                    disabled={processing}
                                    className="text-xs py-1 px-3 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {processing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1.5"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="w-3 h-3 mr-1.5" />
                                            {isBulkMode ? 'Confirm & Submit All' : 'Confirm & Submit'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

// Mock data for demonstration
const mockPurchaseOrders = [
    {
        id: 1,
        po_number: "PO-2024-001",
        po_amount: "150000.00",
        po_status: "payable",
        vendor: { name: "ABC Construction Corp" },
        project: {
            project_title: "Building Renovation Phase 1",
            cer_number: "CER-2024-001"
        }
    },
    {
        id: 2,
        po_number: "PO-2024-002",
        po_amount: "85000.00",
        po_status: "payable",
        vendor: { name: "XYZ Supplies Ltd" },
        project: {
            project_title: "Office Equipment Upgrade",
            cer_number: "CER-2024-002"
        }
    }
];

export default function InvoiceDemo() {
    return <CreateInvoice purchaseOrders={mockPurchaseOrders} />;
}
