import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import PaginationServerSide from '@/components/custom/Pagination.jsx';
import { router } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Clock,
    Download,
    Eye,
    FileCheck,
    FileText,
    FileX2,
    Package,
    Search,
    ShoppingCart,
    XCircle,
    Building2,
    Calendar,
    DollarSign,
    AlertCircle,
    Filter,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';

const BulkInvoiceReview = ({ invoices, filters, filterOptions }) => {
    const [selectedInvoices, setSelectedInvoices] = useState(new Set());
    const [selectedAmounts, setSelectedAmounts] = useState(new Map());
    const [currentInvoiceIndex, setCurrentInvoiceIndex] = useState(0);
    const [searchValue, setSearchValue] = useState(filters.search || '');
    const [vendorFilter, setVendorFilter] = useState(filters.vendor || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [bulkAction, setBulkAction] = useState(null);
    const [vendorSearch, setVendorSearch] = useState('');
    const [reviewNotes, setReviewNotes] = useState('');

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Intl.DateTimeFormat('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(new Date(dateString));
    };

    const getStatusConfig = (status, hasFiles) => {
        switch (status) {
            case 'received':
                return {
                    label: 'Received',
                    variant: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
                    icon: <FileCheck className="h-3 w-3" />,
                };
            case 'under_review':
                return {
                    label: 'Review',
                    variant: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
                    icon: <Clock className="h-3 w-3" />,
                };
            case 'approved':
                return {
                    label: 'Approved',
                    variant: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
                    icon: <CheckCircle2 className="h-3 w-3" />,
                };
            case 'rejected':
                return {
                    label: 'Rejected',
                    variant: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
                    icon: <XCircle className="h-3 w-3" />,
                };
            default:
                return {
                    label: status,
                    variant: 'bg-slate-500/10 text-slate-700 border-slate-500/20',
                    icon: <Clock className="h-3 w-3" />,
                };
        }
    };

    const selectedTotal = useMemo(() => {
        return Array.from(selectedAmounts.values()).reduce((sum, amount) => {
            return sum + parseFloat(amount || 0);
        }, 0);
    }, [selectedAmounts]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchValue !== filters.search) {
                handleFilterChange({ search: searchValue, page: 1 });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchValue]);

    const handleFilterChange = (newFilters) => {
        const updatedFilters = {
            ...filters,
            ...newFilters,
        };

        Object.keys(updatedFilters).forEach((key) => {
            if (!updatedFilters[key] || updatedFilters[key] === 'all') {
                delete updatedFilters[key];
            }
        });

        router.get('/invoice/bulk-review', updatedFilters, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setSelectedInvoices((prev) => {
                    const newSet = new Set(prev);
                    const newAmounts = new Map(selectedAmounts);
                    invoices.data.forEach(inv => {
                        if (!newSet.has(inv.id)) return;
                        if (!invoices.data.find(i => i.id === inv.id)) {
                            newSet.delete(inv.id);
                            newAmounts.delete(inv.id);
                        }
                    });
                    setSelectedAmounts(newAmounts);
                    return newSet;
                });
            },
        });
    };

    const handleVendorChange = (value) => {
        setVendorFilter(value);
        setVendorSearch('');
        handleFilterChange({ vendor: value, page: 1 });
    };

    const handleStatusChange = (value) => {
        setStatusFilter(value);
        handleFilterChange({ status: value, page: 1 });
    };

    const handleSelectInvoice = (invoiceId, index) => {
        const newSelected = new Set(selectedInvoices);
        const newAmounts = new Map(selectedAmounts);

        if (newSelected.has(invoiceId)) {
            newSelected.delete(invoiceId);
            newAmounts.delete(invoiceId);
        } else {
            newSelected.add(invoiceId);
            newAmounts.set(invoiceId, invoices.data[index].invoice_amount);
        }

        setSelectedInvoices(newSelected);
        setSelectedAmounts(newAmounts);
        setCurrentInvoiceIndex(index);
    };

    const handleNavigate = (direction) => {
        const newIndex = direction === 'prev'
            ? Math.max(0, currentInvoiceIndex - 1)
            : Math.min(invoices.data.length - 1, currentInvoiceIndex + 1);
        setCurrentInvoiceIndex(newIndex);
    };

    const handleBulkAction = (action) => {
        if (selectedInvoices.size === 0) return;
        setBulkAction(action);
        setShowConfirmDialog(true);
    };

    const confirmBulkAction = () => {
        const invoiceIds = Array.from(selectedInvoices);

        router.post(`/invoice/bulk-${bulkAction}`, {
            invoice_ids: invoiceIds,
            notes: reviewNotes,
        }, {
            onSuccess: (e) => {
                toast.success('Invoices marked as received successfully!');
                setSelectedInvoices(new Set());
                setSelectedAmounts(new Map());
                setShowConfirmDialog(false);
                setReviewNotes('');
            },
            onError:(errors) => {
                toast.error(errors[0]);
            }
        });
    };

    const currentInvoice = invoices.data[currentInvoiceIndex];

    const getActionConfig = () => {
        switch (bulkAction) {
            case 'mark-received':
                return {
                    title: 'Mark Files as Received',
                    description: `Mark files as received for ${selectedInvoices.size} invoice(s)? Total: ${formatCurrency(selectedTotal)}`,
                };
            case 'approve':
                return {
                    title: 'Approve Invoices',
                    description: `Approve ${selectedInvoices.size} invoice(s) for payment? Total: ${formatCurrency(selectedTotal)}`,
                };
            case 'reject':
                return {
                    title: 'Reject Invoices',
                    description: `Reject ${selectedInvoices.size} invoice(s)? This action will require them to be resubmitted.`,
                };
            default:
                return { title: 'Confirm Action', description: `Proceed with ${selectedInvoices.size} invoice(s)?` };
        }
    };

    const actionConfig = getActionConfig();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 py-4">
            <div className="mx-auto max-w-[1800px] px-4">
                {/* Compact Header with Actions */}
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bulk Invoice Review</h1>
                        <p className="text-xs text-slate-600">Review and process multiple invoices</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {selectedInvoices.size > 0 && (
                            <>
                                <div className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 shadow-md">
                                    <div className="flex items-baseline gap-2 text-white">
                                        <span className="text-lg font-bold">{selectedInvoices.size}</span>
                                        <span className="text-xs">selected</span>
                                        <span className="mx-1">•</span>
                                        <span className="text-sm font-semibold">{formatCurrency(selectedTotal)}</span>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-9 border-blue-200 bg-white shadow-sm hover:bg-blue-50"
                                    onClick={() => handleBulkAction('mark-received')}
                                >
                                    <FileCheck className="mr-1.5 h-4 w-4" />
                                    Mark Received
                                </Button>
                                <Button
                                    size="sm"
                                    className="h-9 bg-emerald-600 shadow-md hover:bg-emerald-700"
                                    onClick={() => handleBulkAction('approve')}
                                >
                                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                    Approve
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-9 shadow-md"
                                    onClick={() => handleBulkAction('reject')}
                                >
                                    <XCircle className="mr-1.5 h-4 w-4" />
                                    Reject
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Compact Filters */}
                <Card className="mb-4 border-0 shadow-sm">
                    <CardContent className="p-3">
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                            <Select value={vendorFilter} onValueChange={handleVendorChange}>
                                <SelectTrigger className="h-9 border-slate-200">
                                    <SelectValue placeholder="All Vendors" />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="border-b p-2">
                                        <div className="relative">
                                            <Search className="absolute top-1/2 left-2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                                            <input
                                                type="text"
                                                placeholder="Search vendor..."
                                                value={vendorSearch}
                                                onChange={(e) => setVendorSearch(e.target.value)}
                                                className="h-8 w-full rounded-md border border-input bg-background px-7 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                onClick={(e) => e.stopPropagation()}
                                                onKeyDown={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                    <SelectItem value="all">All Vendors</SelectItem>
                                    {filterOptions?.vendors
                                        ?.filter((v) => v.name.toLowerCase().includes(vendorSearch.toLowerCase()))
                                        .map((vendor) => (
                                            <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                                {vendor.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={handleStatusChange}>
                                <SelectTrigger className="h-9 border-slate-200">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="received">Files Received</SelectItem>
                                    <SelectItem value="under_review">Under Review</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="relative">
                                <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                <Input
                                    type="search"
                                    placeholder="Search invoices..."
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    className="h-9 border-slate-200 pl-8"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Grid - Maximized Space */}
                <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
                    {/* Compact Invoice List */}
                    <div className="space-y-3">
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="p-3 pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold">Invoices</CardTitle>
                                    <Badge variant="secondary" className="">
                                        {invoices.data.length}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-[calc(100vh-280px)]">
                                    <div className="space-y-1.5 p-3">
                                        {invoices.data.map((invoice, index) => {
                                            const isSelected = selectedInvoices.has(invoice.id);
                                            const isCurrent = currentInvoiceIndex === index;
                                            const hasFiles = invoice.files_received_at !== null;
                                            const statusConfig = getStatusConfig(invoice.invoice_status, hasFiles);

                                            return (
                                                <div
                                                    key={invoice.id}
                                                    className={`group cursor-pointer rounded-lg border-2 p-2.5 transition-all ${
                                                        isCurrent
                                                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                                                            : isSelected
                                                                ? 'border-blue-300 bg-blue-50/50'
                                                                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                                                    }`}
                                                    onClick={() => handleSelectInvoice(invoice.id, index)}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() => handleSelectInvoice(invoice.id, index)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="mt-0.5"
                                                        />
                                                        <div className="flex-1 space-y-1 overflow-hidden">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="truncate font-mono text-xs font-bold text-slate-900">
                                                                    {invoice.si_number}
                                                                </span>
                                                                <Badge className={`${statusConfig.variant} flex items-center gap-1 border px-1.5 py-0 text-[10px]`}>
                                                                    {statusConfig.icon}
                                                                    {statusConfig.label}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-[11px] text-slate-600">
                                                                <Building2 className="h-3 w-3 shrink-0 text-slate-400" />
                                                                <span className="truncate">{invoice.purchase_order?.vendor?.name}</span>
                                                            </div>
                                                            <div className="text-sm font-bold text-emerald-600">
                                                                {formatCurrency(invoice.invoice_amount)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                        <PaginationServerSide items={invoices} onChange={handleFilterChange} />
                    </div>

                    {/* Compact Detail Panel */}
                    <Card className="border-0 shadow-sm">
                        {currentInvoice ? (
                            <>
                                <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white p-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-semibold">Invoice Details</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 w-7 p-0"
                                                onClick={() => handleNavigate('prev')}
                                                disabled={currentInvoiceIndex === 0}
                                            >
                                                <ChevronLeft className="h-3.5 w-3.5" />
                                            </Button>
                                            <span className="min-w-[50px] text-center text-xs font-medium text-slate-600">
                                                {currentInvoiceIndex + 1} / {invoices.data.length}
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 w-7 p-0"
                                                onClick={() => handleNavigate('next')}
                                                disabled={currentInvoiceIndex === invoices.data.length - 1}
                                            >
                                                <ChevronRight className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        {/* Column 1: Primary Info */}
                                        <div className="space-y-3">
                                            {/* Invoice Header */}
                                            <div className="rounded-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-3">
                                                <div className="mb-2 flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Invoice</div>
                                                        <h3 className="truncate font-mono text-base font-bold text-slate-900">
                                                            {currentInvoice.si_number}
                                                        </h3>
                                                    </div>
                                                    <Badge className={`${getStatusConfig(currentInvoice.invoice_status, currentInvoice.files_received_at).variant} shrink-0 border px-2 py-0.5 text-[10px] font-semibold`}>
                                                        {getStatusConfig(currentInvoice.invoice_status, currentInvoice.files_received_at).label}
                                                    </Badge>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="rounded-lg border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-2.5">
                                                        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-emerald-700">
                                                            <DollarSign className="h-3 w-3" />
                                                            Amount
                                                        </div>
                                                        <div className="text-xl font-bold text-emerald-700">
                                                            {formatCurrency(currentInvoice.invoice_amount)}
                                                        </div>
                                                    </div>

                                                    <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-2.5">
                                                        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-blue-700">
                                                            <Calendar className="h-3 w-3" />
                                                            Date
                                                        </div>
                                                        <div className="text-sm font-bold text-slate-900">
                                                            {formatDate(currentInvoice.si_date)}
                                                        </div>
                                                    </div>

                                                    {currentInvoice.due_date && (
                                                        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2">
                                                            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                                                            <div className="min-w-0 flex-1">
                                                                <div className="text-[10px] font-medium text-amber-900">Due Date</div>
                                                                <div className="truncate text-xs font-bold text-amber-700">{formatDate(currentInvoice.due_date)}</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Vendor Info */}
                                            <div className="rounded-lg border border-slate-200 bg-white p-3">
                                                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-900">
                                                    <div className="rounded bg-slate-100 p-1">
                                                        <Building2 className="h-3 w-3 text-slate-600" />
                                                    </div>
                                                    Vendor & PO
                                                </h4>
                                                <div className="space-y-2">
                                                    <div>
                                                        <div className="mb-0.5 text-[10px] font-medium text-slate-500">Vendor</div>
                                                        <div className="text-xs font-semibold text-slate-900">
                                                            {currentInvoice.purchase_order?.vendor?.name}
                                                        </div>
                                                    </div>
                                                    <Separator />
                                                    <div>
                                                        <div className="mb-0.5 text-[10px] font-medium text-slate-500">PO Number</div>
                                                        <div className="font-mono text-xs font-bold text-blue-600">
                                                            {currentInvoice.purchase_order?.po_number}
                                                        </div>
                                                    </div>
                                                    <Separator />
                                                    <div>
                                                        <div className="mb-0.5 text-[10px] font-medium text-slate-500">PO Amount</div>
                                                        <div className="text-xs font-bold text-slate-900">
                                                            {formatCurrency(currentInvoice.purchase_order?.po_amount || 0)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Column 2: Project & Files */}
                                        <div className="space-y-3">
                                            {/* Project Info */}
                                            <div className="rounded-lg border border-slate-200 bg-white p-3">
                                                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-900">
                                                    <div className="rounded bg-slate-100 p-1">
                                                        <ShoppingCart className="h-3 w-3 text-slate-600" />
                                                    </div>
                                                    Project
                                                </h4>
                                                <div className="space-y-2">
                                                    <div>
                                                        <div className="mb-0.5 text-[10px] font-medium text-slate-500">Title</div>
                                                        <div className="text-xs font-semibold leading-relaxed text-slate-900">
                                                            {currentInvoice.purchase_order?.project?.project_title}
                                                        </div>
                                                    </div>
                                                    {currentInvoice.purchase_order?.project?.cer_number && (
                                                        <>
                                                            <Separator />
                                                            <div>
                                                                <div className="mb-0.5 text-[10px] font-medium text-slate-500">CER Number</div>
                                                                <div className="font-mono text-xs font-bold text-slate-900">
                                                                    {currentInvoice.purchase_order?.project?.cer_number}
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Files */}
                                            <div className="rounded-lg border border-slate-200 bg-white p-3">
                                                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-900">
                                                    <div className="rounded bg-slate-100 p-1">
                                                        <FileCheck className="h-3 w-3 text-slate-600" />
                                                    </div>
                                                    Files
                                                </h4>
                                                {currentInvoice.files && currentInvoice.files.length > 0 ? (
                                                    <ScrollArea className="max-h-[300px]">
                                                        <div className="space-y-1.5">
                                                            {currentInvoice.files.map((file) => (
                                                                <div key={file.id} className="group flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-2 transition-all hover:border-blue-300 hover:bg-blue-50/50">
                                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                                        <div className="rounded bg-blue-100 p-1">
                                                                            <FileText className="h-3 w-3 text-blue-600" />
                                                                        </div>
                                                                        <div className="min-w-0 flex-1">
                                                                            <div className="truncate text-xs font-semibold text-slate-900">{file.file_name}</div>
                                                                            <div className="text-[10px] text-slate-500">
                                                                                {(file.file_size / 1024).toFixed(2)} KB
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <Button size="sm" variant="ghost" className="h-7 w-7 shrink-0 p-0 opacity-0 transition-opacity group-hover:opacity-100">
                                                                        <Download className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </ScrollArea>
                                                ) : (
                                                    <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 text-center">
                                                        <FileX2 className="mx-auto mb-1.5 h-6 w-6 text-slate-400" />
                                                        <p className="text-[10px] font-medium text-slate-500">No files attached</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Column 3: Notes */}
                                        <div>
                                            <div className="rounded-lg border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-3">
                                                <Label htmlFor="notes" className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-900">
                                                    <div className="rounded bg-amber-100 p-1">
                                                        <FileText className="h-3 w-3 text-amber-700" />
                                                    </div>
                                                    Review Notes
                                                </Label>
                                                <Textarea
                                                    id="notes"
                                                    placeholder="Add review notes, observations, or important flags..."
                                                    value={reviewNotes}
                                                    onChange={(e) => setReviewNotes(e.target.value)}
                                                    rows={20}
                                                    className="resize-none border-amber-200 bg-white text-xs shadow-sm focus-visible:ring-amber-400"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </>
                        ) : (
                            <div className="flex h-[calc(100vh-180px)] items-center justify-center">
                                <div className="text-center">
                                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                                        <Eye className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700">Select an invoice to review</p>
                                    <p className="mt-1 text-xs text-slate-500">Choose from the list on the left</p>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl">{actionConfig.title}</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm leading-relaxed">
                            {actionConfig.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {bulkAction === 'reject' && (
                        <div className="py-3">
                            <Label htmlFor="reject-notes" className="mb-2 text-sm font-semibold">
                                Reason for rejection
                            </Label>
                            <Textarea
                                id="reject-notes"
                                placeholder="Please provide a detailed reason for rejection..."
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                rows={3}
                                className="resize-none text-sm"
                            />
                        </div>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel className="font-medium">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmBulkAction}
                            className={`font-semibold ${bulkAction === 'reject' ? 'bg-destructive hover:bg-destructive/90' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default BulkInvoiceReview;
