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
import BulkInvoiceList from '@/pages/invoices/components/BulkInvoiceList.jsx';
import BulkInvoiceDetails from '@/pages/invoices/components/BulkInvoicesDetails.jsx';
import BulkInvoiceConfirmDialog from '@/pages/invoices/components/BulkInvoiceConfirmDialog.jsx';

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
                    <BulkInvoiceList
                        invoices={invoices}
                        selectedInvoices={selectedInvoices}
                        currentInvoiceIndex={currentInvoiceIndex}
                        handleSelectInvoice={handleSelectInvoice}
                        handleFilterChange={handleFilterChange}
                        getStatusConfig={getStatusConfig}
                        formatCurrency={formatCurrency}
                    />

                    {/* Compact Detail Panel */}
                    <BulkInvoiceDetails
                        currentInvoice={currentInvoice}
                        currentInvoiceIndex={currentInvoiceIndex}
                        invoices={invoices}
                        handleNavigate={handleNavigate}
                        getStatusConfig={getStatusConfig}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                        reviewNotes={reviewNotes}
                        setReviewNotes={setReviewNotes}
                    />

                </div>
            </div>

            {/* Confirmation Dialog */}
            <BulkInvoiceConfirmDialog
                open={showConfirmDialog}
                onOpenChange={setShowConfirmDialog}
                bulkAction={bulkAction}
                actionConfig={actionConfig}
                reviewNotes={reviewNotes}
                setReviewNotes={setReviewNotes}
                onConfirm={confirmBulkAction}
            />

        </div>
    );
};

export default BulkInvoiceReview;
