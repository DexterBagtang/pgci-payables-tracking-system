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

const EditInvoice = ({ invoice, purchaseOrders }) => {
    const [poComboboxOpen, setPoComboboxOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [filesToDelete, setFilesToDelete] = useState([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        purchase_order_id: invoice.purchase_order_id?.toString() || '',
        si_number: invoice.si_number || '',
        si_date: invoice.si_date || '',
        si_received_at: invoice.si_received_at || '',
        invoice_amount: invoice.invoice_amount || '',
        due_date: invoice.due_date || '',
        notes: invoice.notes || '',
        submitted_at: invoice.submitted_at || '',
        submitted_to: invoice.submitted_to || '',
        files: [],
        delete_files: [],
    });

    // Initialize form with invoice data on mount
    useEffect(() => {
        setData({
            purchase_order_id: invoice.purchase_order_id?.toString() || '',
            si_number: invoice.si_number || '',
            si_date: invoice.si_date || '',
            si_received_at: invoice.si_received_at || '',
            invoice_amount: invoice.invoice_amount || '',
            due_date: invoice.due_date || '',
            notes: invoice.notes || '',
            submitted_at: invoice.submitted_at || '',
            submitted_to: invoice.submitted_to || '',
            files: [],
            delete_files: [],
        });
    }, [invoice]);

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

        setSelectedFiles(prev => [...prev, ...validFiles]);
        e.target.value = '';

        setData('files', [...selectedFiles, ...validFiles]);
    }, [selectedFiles, setData]);

    // Remove selected new file
    const removeNewFile = useCallback((index) => {
        const updatedFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(updatedFiles);
        setData('files', updatedFiles);
    }, [selectedFiles, setData]);

    // Handle existing file deletion
    const handleDeleteExistingFile = useCallback((fileId) => {
        const updatedFilesToDelete = [...filesToDelete, fileId];
        setFilesToDelete(updatedFilesToDelete);
        setData('delete_files', updatedFilesToDelete);
    }, [filesToDelete, setData]);

    // Restore deleted file
    const restoreFile = useCallback((fileId) => {
        const updatedFilesToDelete = filesToDelete.filter(id => id !== fileId);
        setFilesToDelete(updatedFilesToDelete);
        setData('delete_files', updatedFilesToDelete);
    }, [filesToDelete, setData]);

    const handlePreview = (e) => {
        e.preventDefault();
        setShowConfirmation(true);
    };

    const handleSubmitConfirmed = () => {
        setShowConfirmation(false);


        post(`/invoices/${invoice.id}`,{
            _method:'patch',
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

    // Existing files that are not marked for deletion
    const existingFiles = invoice.files?.filter(file => !filesToDelete.includes(file.id)) || [];

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
                            <Button
                                variant="outline"
                                className="w-fit"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                            </Button>
                        </Link>
                        <Link href='/invoices' prefetch>
                            <Button
                                variant="outline"
                                className="w-fit"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        </Link>
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
                                        Select the purchase order for this invoice
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
                                            <p className="text-sm text-red-600 mt-1">{errors.purchase_order_id}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Invoice Information */}
                            <Card className="shadow-sm border-slate-200">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center text-slate-800">
                                        <FileText className="w-5 h-5 mr-2 text-green-600" />
                                        Invoice Information
                                    </CardTitle>
                                    <CardDescription className="text-slate-600">
                                        Update the basic invoice details and amount
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                onChange={e => setData('invoice_amount', e.target.value)}
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

                            {/* Processing Information */}
                            <Card className="shadow-sm border-slate-200">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center text-slate-800">
                                        <CalendarIcon className="w-5 h-5 mr-2 text-purple-600" />
                                        Processing Information
                                    </CardTitle>
                                    <CardDescription className="text-slate-600">
                                        Update when and to whom the invoice was submitted
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-slate-700">Received Date</Label>
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
                                        Manage supporting documents for this invoice
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Existing Files */}
                                        {existingFiles.length > 0 && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">
                                                    Current Files ({existingFiles.length})
                                                </Label>
                                                <div className="space-y-2">
                                                    {existingFiles.map((file) => (
                                                        <div
                                                            key={file.id}
                                                            className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded"
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-slate-900 truncate">
                                                                    {file.file_name}
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                    {(file.file_size / 1024 / 1024).toFixed(2)} MB
                                                                </p>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => window.open(`/storage/${file.file_path}`, '_blank')}
                                                                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteExistingFile(file.id)}
                                                                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Files marked for deletion */}
                                        {filesToDelete.length > 0 && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700 text-red-600">
                                                    Files to be deleted ({filesToDelete.length})
                                                </Label>
                                                <div className="space-y-2">
                                                    {invoice.files?.filter(file => filesToDelete.includes(file.id)).map((file) => (
                                                        <div
                                                            key={file.id}
                                                            className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded opacity-75"
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-slate-900 truncate line-through">
                                                                    {file.file_name}
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                    Will be deleted
                                                                </p>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => restoreFile(file.id)}
                                                                className="text-green-600 hover:text-green-800 hover:bg-green-50"
                                                            >
                                                                Restore
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Add new files */}
                                        <div>
                                            <div>
                                                <label
                                                    htmlFor="files"
                                                    className="inline-block cursor-pointer px-6 py-2 rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Upload className={"w-4 h-4"}/> <span>Add More Files</span>
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

                                        {/* New files to upload */}
                                        {selectedFiles.length > 0 && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">
                                                    New Files to Upload ({selectedFiles.length})
                                                </Label>
                                                <div className="space-y-2">
                                                    {selectedFiles.map((file, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded"
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
                                                                onClick={() => removeNewFile(index)}
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

                                    {/* File Changes Summary */}
                                    {(selectedFiles.length > 0 || filesToDelete.length > 0) && (
                                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                                            <h4 className="text-sm font-medium text-amber-800 mb-2">File Changes</h4>
                                            <div className="text-sm text-amber-700 space-y-1">
                                                {selectedFiles.length > 0 && (
                                                    <div className="flex justify-between">
                                                        <span>New files:</span>
                                                        <span className="font-medium">{selectedFiles.length}</span>
                                                    </div>
                                                )}
                                                {filesToDelete.length > 0 && (
                                                    <div className="flex justify-between">
                                                        <span>Files to delete:</span>
                                                        <span className="font-medium">{filesToDelete.length}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between border-t border-amber-300 pt-1">
                                                    <span>Total files after update:</span>
                                                    <span className="font-medium">
                                                        {existingFiles.length + selectedFiles.length}
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
                                            Preview & Update
                                        </Button>

                                        {errorCount > 0 && (
                                            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                                                <div className="flex items-start">
                                                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <h3 className="text-sm font-medium text-red-800 mb-2">
                                                            Please fix {errorCount} error{errorCount > 1 ? 's' : ''} before updating:
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
                                Review Invoice Changes
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-600">
                                Verify all changes before updating the invoice.
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
                                        <div>
                                            <div className="text-slate-500">Status</div>
                                            <Badge className="text-xs px-1.5 py-0.5 bg-green-100 text-green-800 capitalize">{selectedPO.po_status}</Badge>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Invoice Details */}
                            <div className="border border-emerald-200 rounded-lg p-3 bg-emerald-50">
                                <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wide mb-2">Invoice</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <div className="text-slate-500">SI #</div>
                                        <div>{data.si_number || <span className="text-slate-400">—</span>}</div>
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
                                        <div className="text-slate-500">Due</div>
                                        <div>{data.due_date ? format(new Date(data.due_date), "MMM d") : "—"}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Processing */}
                            <div className="border border-amber-200 rounded-lg p-3 bg-amber-50">
                                <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wide mb-2">Processing</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <div className="text-slate-500">Received</div>
                                        <div>{data.si_received_at ? format(new Date(data.si_received_at), "MMM d, yyyy") : "—"}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500">Submitted To</div>
                                        <div>{data.submitted_to || "—"}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500">On</div>
                                        <div>{data.submitted_at ? format(new Date(data.submitted_at), "MMM d, yyyy") : "—"}</div>
                                    </div>
                                </div>
                            </div>

                            {/* File Changes */}
                            {selectedFiles.length > 0 && (
                                <div className="border border-purple-200 rounded-lg p-3 bg-purple-50">
                                    <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wide mb-2">New Files to Upload ({selectedFiles.length})</h3>
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
                                    <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wide mb-2">Note</h3>
                                    <p className="text-slate-700 text-xs leading-tight">{data.notes}</p>
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
                                    Edit More
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
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-3 h-3 mr-1.5" />
                                            Confirm & Update
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

export default EditInvoice;
