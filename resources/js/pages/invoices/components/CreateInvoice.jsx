import { useForm } from '@inertiajs/react';
import { useState, useCallback, useMemo } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
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
    CalendarIcon,
    FileText,
    DollarSign,
    Building2,
    AlertCircle,
    Check,
    ChevronsUpDown,
    X
} from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Label } from '@/components/ui/label';

const PAYMENT_TYPES = [
    { value: "cash", label: "Cash" },
    { value: "check", label: "Check" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "credit_card", label: "Credit Card" },
    { value: "other", label: "Other" }
];

const INVOICE_STATUSES = [
    { value: "received", label: "Received" },
    { value: "under_review", label: "Under Review" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "paid", label: "Paid" },
    { value: "overdue", label: "Overdue" }
];

const CreateInvoice = ({ purchaseOrders = [] }) => {
    const [poComboboxOpen, setPoComboboxOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        purchase_order_id: '',
        si_number: '',
        si_date: '',
        received_date: new Date().toISOString().split('T')[0],
        payment_type: '',
        invoice_amount: '',
        tax_amount: 0,
        discount_amount: 0,
        net_amount: 0,
        invoice_status: 'received',
        due_date: '',
        notes: '',
        submitted_at: '',
        submitted_to: '',
        files: [],
    });

    // Memoized purchase order options for better performance
    const poOptions = useMemo(() =>
            purchaseOrders.map(po => ({
                value: po.id.toString(),
                label: `${po.po_number} - ${po.vendor?.name || 'No Vendor'} - ${po.project?.project_title || 'No Project'}`,
                po_number: po.po_number,
                vendor_name: po.vendor?.name || 'No Vendor',
                project_title: po.project?.project_title || 'No Project',
                po_amount: po.po_amount,
                po_status: po.po_status,
                payment_term: po.payment_term
            })),
        [purchaseOrders]
    );

    const selectedPO = useMemo(() =>
            poOptions.find(po => po.value === data.purchase_order_id?.toString()),
        [poOptions, data.purchase_order_id]
    );

    // Handle amount changes with auto-calculation
    const handleAmountChange = useCallback((field, value) => {
        const numericValue = parseFloat(value) || 0;
        setData(field, numericValue);

        // Calculate net amount immediately with new values
        const updatedData = { ...data, [field]: numericValue };
        const invoiceAmount = parseFloat(updatedData.invoice_amount) || 0;
        const taxAmount = parseFloat(updatedData.tax_amount) || 0;
        const discountAmount = parseFloat(updatedData.discount_amount) || 0;
        const netAmount = invoiceAmount + taxAmount - discountAmount;

        // Update net amount with proper decimal handling
        setData(prevData => ({
            ...prevData,
            [field]: numericValue,
            net_amount: parseFloat(netAmount.toFixed(2))
        }));
    }, [data, setData]);

    // Handle date selection
    const handleDateSelect = useCallback((field, date) => {
        setData(field, date ? format(date, "yyyy-MM-dd") : '');
    }, [setData]);

    // Handle file selection with validation
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
        setData('files', validFiles);
    }, [setData]);

    // Remove selected file
    const removeFile = useCallback((index) => {
        const updatedFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(updatedFiles);
        setData('files', updatedFiles);
    }, [selectedFiles, setData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/invoices', {
            onSuccess: () => {
                reset();
                setSelectedFiles([]);
            },
        });
    };

    // Error summary for better UX
    const errorCount = Object.keys(errors).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container max-w-7xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-slate-900">Create Invoice</h1>
                        <p className="text-slate-600">Add a new supplier invoice to the system</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => window.history.back()}
                        className="w-fit"
                    >
                        Cancel
                    </Button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Invoice Details */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="shadow-sm border-slate-200">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center text-slate-800">
                                        <FileText className="w-5 h-5 mr-2 text-blue-600" />
                                        Invoice Details
                                    </CardTitle>
                                    <CardDescription className="text-slate-600">
                                        Enter the basic information for this invoice
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Purchase Order Combobox */}
                                        <div className="md:col-span-2">
                                            <Label className="text-sm font-medium text-slate-700">Purchase Order *</Label>
                                            <Popover open={poComboboxOpen} onOpenChange={setPoComboboxOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={poComboboxOpen}
                                                        className={cn(
                                                            "w-full justify-between h-auto min-h-[40px] text-left",
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
                                                        <CommandInput
                                                            placeholder="Search purchase orders..."
                                                            className="h-9"
                                                        />
                                                        <CommandEmpty>No purchase order found.</CommandEmpty>
                                                        <CommandList>
                                                            <CommandGroup>
                                                                {poOptions.map((po) => (
                                                                    <CommandItem
                                                                        key={po.value}
                                                                        value={`${po.po_number} ${po.vendor_name} ${po.project_title}`}
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
                                                                                    <span>{po.payment_term}</span>
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

                                        <div>
                                            <Label className="text-sm font-medium text-slate-700">SI Number *</Label>
                                            <Input
                                                value={data.si_number}
                                                onChange={e => setData('si_number', e.target.value)}
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
                                                        selected={data.si_date ? new Date(data.si_date) : undefined}
                                                        onSelect={(date) => handleDateSelect('si_date', date)}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            {errors.si_date && (
                                                <p className="text-sm text-red-600 mt-1">{errors.si_date}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium text-slate-700">Received Date</Label>
                                            <Input
                                                type="date"
                                                value={data.received_date}
                                                onChange={e => setData('received_date', e.target.value)}
                                                className="mt-1"
                                            />
                                            {errors.received_date && (
                                                <p className="text-sm text-red-600 mt-1">{errors.received_date}</p>
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
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            {errors.due_date && (
                                                <p className="text-sm text-red-600 mt-1">{errors.due_date}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium text-slate-700">Payment Type</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            "w-full justify-between mt-1",
                                                            !data.payment_type && "text-slate-500"
                                                        )}
                                                    >
                                                        {data.payment_type
                                                            ? PAYMENT_TYPES.find(type => type.value === data.payment_type)?.label
                                                            : "Select payment type"}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0" align="start">
                                                    <Command>
                                                        <CommandInput placeholder="Search payment types..." />
                                                        <CommandEmpty>No payment type found.</CommandEmpty>
                                                        <CommandList>
                                                            <CommandGroup>
                                                                {PAYMENT_TYPES.map((type) => (
                                                                    <CommandItem
                                                                        key={type.value}
                                                                        value={type.label}
                                                                        onSelect={() => setData('payment_type', type.value)}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                data.payment_type === type.value ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        {type.label}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            {errors.payment_type && (
                                                <p className="text-sm text-red-600 mt-1">{errors.payment_type}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium text-slate-700">Status</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            "w-full justify-between mt-1",
                                                            !data.invoice_status && "text-slate-500"
                                                        )}
                                                    >
                                                        {data.invoice_status
                                                            ? INVOICE_STATUSES.find(status => status.value === data.invoice_status)?.label
                                                            : "Select status"}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0" align="start">
                                                    <Command>
                                                        <CommandInput placeholder="Search status..." />
                                                        <CommandEmpty>No status found.</CommandEmpty>
                                                        <CommandList>
                                                            <CommandGroup>
                                                                {INVOICE_STATUSES.map((status) => (
                                                                    <CommandItem
                                                                        key={status.value}
                                                                        value={status.label}
                                                                        onSelect={() => setData('invoice_status', status.value)}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                data.invoice_status === status.value ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        {status.label}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            {errors.invoice_status && (
                                                <p className="text-sm text-red-600 mt-1">{errors.invoice_status}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium text-slate-700">Notes</Label>
                                        <Textarea
                                            value={data.notes}
                                            onChange={e => setData('notes', e.target.value)}
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

                            {/* Attachments Card */}
                            <Card className="shadow-sm border-slate-200">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-slate-800">Attachments</CardTitle>
                                    <CardDescription className="text-slate-600">
                                        Upload supporting documents for this invoice
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="files" className="text-sm font-medium text-slate-700">
                                                Upload Files
                                            </Label>
                                            <Input
                                                id="files"
                                                type="file"
                                                multiple
                                                onChange={handleFileChange}
                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                                className="mt-1 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            />
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

                        {/* Right Column - Amounts and Actions */}
                        <div className="space-y-6">
                            <Card className="shadow-sm border-slate-200">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center text-slate-800">
                                        <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                                        Amounts
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium text-slate-700">Invoice Amount *</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.invoice_amount}
                                            onChange={e => handleAmountChange('invoice_amount', e.target.value)}
                                            placeholder="0.00"
                                            className="mt-1"
                                        />
                                        {errors.invoice_amount && (
                                            <p className="text-sm text-red-600 mt-1">{errors.invoice_amount}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium text-slate-700">Tax Amount</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.tax_amount}
                                            onChange={e => handleAmountChange('tax_amount', e.target.value)}
                                            placeholder="0.00"
                                            className="mt-1"
                                        />
                                        {errors.tax_amount && (
                                            <p className="text-sm text-red-600 mt-1">{errors.tax_amount}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium text-slate-700">Discount Amount</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.discount_amount}
                                            onChange={e => handleAmountChange('discount_amount', e.target.value)}
                                            placeholder="0.00"
                                            className="mt-1"
                                        />
                                        {errors.discount_amount && (
                                            <p className="text-sm text-red-600 mt-1">{errors.discount_amount}</p>
                                        )}
                                    </div>

                                    <div className="border-t pt-4">
                                        <Label className="text-lg font-semibold text-slate-800">Net Amount</Label>
                                        <div className="mt-1 p-3 bg-slate-50 rounded border">
                                            <div className="text-2xl font-bold text-slate-900">
                                                ₱{Number(data.net_amount || 0).toLocaleString()}
                                            </div>
                                            <div className="text-sm text-slate-600">
                                                Final amount after tax and discount
                                            </div>
                                        </div>
                                        {errors.net_amount && (
                                            <p className="text-sm text-red-600 mt-1">{errors.net_amount}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm border-slate-200">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center text-slate-800">
                                        <Building2 className="w-5 h-5 mr-2 text-purple-600" />
                                        Submission Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium text-slate-700">Submitted To</Label>
                                        <Input
                                            value={data.submitted_to}
                                            onChange={e => setData('submitted_to', e.target.value)}
                                            placeholder="Name or department"
                                            className="mt-1"
                                        />
                                        {errors.submitted_to && (
                                            <p className="text-sm text-red-600 mt-1">{errors.submitted_to}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium text-slate-700">Submission Date</Label>
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
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.submitted_at && (
                                            <p className="text-sm text-red-600 mt-1">{errors.submitted_at}</p>
                                        )}
                                    </div>
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
                                            {processing ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Creating Invoice...
                                                </>
                                            ) : (
                                                'Create Invoice'
                                            )}
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

                                        {/* Summary Card for better UX */}
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
                                                        <span className="font-medium">{selectedPO.vendor_name}</span>
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

                                        {/* Quick Stats */}
                                        <div className="grid grid-cols-2 gap-3 text-center">
                                            <div className="p-3 bg-slate-50 rounded border">
                                                <div className="text-sm text-slate-600">Invoice Amount</div>
                                                <div className="text-lg font-semibold text-slate-900">
                                                    ₱{Number(data.invoice_amount || 0).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded border">
                                                <div className="text-sm text-slate-600">Net Amount</div>
                                                <div className="text-lg font-semibold text-slate-900">
                                                    ₱{Number(data.net_amount || 0).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateInvoice;
