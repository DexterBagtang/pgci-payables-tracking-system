import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
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
import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { toast } from 'sonner';
import DialogLoadingFallback from '@/components/custom/DialogLoadingFallback';
const BulkInvoiceList = lazy(() => import('@/pages/invoices/components/BulkInvoiceList.jsx'));
const BulkInvoiceDetails = lazy(() => import('@/pages/invoices/components/BulkInvoicesDetails.jsx'));
const BulkInvoiceConfirmDialog = lazy(() => import('@/pages/invoices/components/BulkInvoiceConfirmDialog.jsx'));

const BulkInvoiceReview = ({ invoices, filters, filterOptions }) => {
    const [selectedInvoices, setSelectedInvoices] = useState(new Set());
    const [selectedAmounts, setSelectedAmounts] = useState(new Map());
    const [currentInvoiceIndex, setCurrentInvoiceIndex] = useState(0);
    const [searchValue, setSearchValue] = useState(filters.search || '');
    const [vendorFilter, setVendorFilter] = useState(filters.vendor || 'all');
    const [purchaseOrderFilter, setPurchaseOrderFilter] = useState(filters.purchase_order || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [bulkAction, setBulkAction] = useState(null);
    const [vendorSearch, setVendorSearch] = useState('');
    const [poSearch, setPoSearch] = useState('');
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

    const handlePurchaseOrderChange = (value) => {
        const newValue = value === '' ? 'all' : value;
        setPurchaseOrderFilter(newValue);
        handleFilterChange({ purchase_order: newValue, page: 1 });
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
            onError: (errors) => {
                const msg = Array.isArray(errors)
                    ? errors[0]
                    : Object.values(errors || {})[0] || 'An unexpected error occurred.';
                toast.error(Array.isArray(msg) ? msg[0] : msg);
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
        <div className="h-screen flex flex-col bg-slate-50">
            {/* Sticky Header Bar */}
            <div className="bg-white border-b shadow-sm">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Invoice Review</h1>
                            <p className="text-sm text-slate-500 mt-0.5">Review and process invoices efficiently</p>
                        </div>
                        
                        {/* Action Buttons */}
                        {selectedInvoices.size > 0 && (
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-blue-600">{selectedInvoices.size}</span>
                                        <span className="text-xs text-slate-600">selected</span>
                                        <span className="text-slate-300 mx-1">|</span>
                                        <span className="text-lg font-bold text-blue-600">{formatCurrency(selectedTotal)}</span>
                                    </div>
                                </div>
                                
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleBulkAction('mark-received')}
                                    className="h-9"
                                >
                                    <FileCheck className="h-4 w-4 mr-2" />
                                    Mark Received
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => handleBulkAction('approve')}
                                    className="h-9 bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Approve
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleBulkAction('reject')}
                                    className="h-9"
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Active Filters */}
                    {(vendorFilter !== 'all' || purchaseOrderFilter !== 'all' || statusFilter !== 'all' || searchValue) && (
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                <Filter className="h-3.5 w-3.5" />
                                <span className="font-medium">Active Filters:</span>
                            </div>
                            
                            {vendorFilter !== 'all' && (
                                <Badge 
                                    variant="secondary" 
                                    className="gap-1.5 pl-2 pr-1 py-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                >
                                    <Building2 className="h-3 w-3" />
                                    <span className="text-xs">
                                        {filterOptions?.vendors?.find(v => v.id.toString() === vendorFilter)?.name || 'Vendor'}
                                    </span>
                                    <button
                                        onClick={() => handleVendorChange('all')}
                                        className="ml-0.5 rounded-sm hover:bg-blue-200 p-0.5"
                                    >
                                        <XCircle className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            
                            {purchaseOrderFilter !== 'all' && (
                                <Badge 
                                    variant="secondary" 
                                    className="gap-1.5 pl-2 pr-1 py-1 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                                >
                                    <ShoppingCart className="h-3 w-3" />
                                    <span className="text-xs">
                                        {filterOptions?.purchaseOrders?.find(po => po.id.toString() === purchaseOrderFilter)?.po_number || 'PO'}
                                    </span>
                                    <button
                                        onClick={() => handlePurchaseOrderChange('all')}
                                        className="ml-0.5 rounded-sm hover:bg-purple-200 p-0.5"
                                    >
                                        <XCircle className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            
                            {statusFilter !== 'all' && (
                                <Badge 
                                    variant="secondary" 
                                    className="gap-1.5 pl-2 pr-1 py-1 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                                >
                                    <AlertCircle className="h-3 w-3" />
                                    <span className="text-xs capitalize">
                                        {statusFilter.replace('_', ' ')}
                                    </span>
                                    <button
                                        onClick={() => handleStatusChange('all')}
                                        className="ml-0.5 rounded-sm hover:bg-amber-200 p-0.5"
                                    >
                                        <XCircle className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            
                            {searchValue && (
                                <Badge 
                                    variant="secondary" 
                                    className="gap-1.5 pl-2 pr-1 py-1 bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                >
                                    <Search className="h-3 w-3" />
                                    <span className="text-xs max-w-[200px] truncate">
                                        "{searchValue}"
                                    </span>
                                    <button
                                        onClick={() => setSearchValue('')}
                                        className="ml-0.5 rounded-sm hover:bg-slate-200 p-0.5"
                                    >
                                        <XCircle className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            
                            <button
                                onClick={() => {
                                    setVendorFilter('all');
                                    setPurchaseOrderFilter('all');
                                    setStatusFilter('all');
                                    setSearchValue('');
                                    handleFilterChange({ vendor: 'all', purchase_order: 'all', status: 'all', search: '', page: 1 });
                                }}
                                className="text-xs text-slate-500 hover:text-slate-700 underline ml-1"
                            >
                                Clear all
                            </button>
                        </div>
                    )}

                    {/* Filters Row */}
                    <div className="grid grid-cols-4 gap-3">
                        <Select value={vendorFilter} onValueChange={handleVendorChange}>
                            <SelectTrigger className="h-9">
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

                        <Combobox
                            value={purchaseOrderFilter === 'all' ? '' : purchaseOrderFilter.toString()}
                            onValueChange={handlePurchaseOrderChange}
                            placeholder="All Purchase Orders"
                            searchPlaceholder="Search PO..."
                            emptyMessage="No purchase orders found."
                            className="h-9"
                            options={[
                                { value: 'all', label: 'All Purchase Orders' },
                                ...(filterOptions?.purchaseOrders?.map((po) => ({
                                    value: po.id.toString(),
                                    label: `${po.po_number} - ${po.vendor?.name || 'No Vendor'}`
                                })) || [])
                            ]}
                        />

                        <Select value={statusFilter} onValueChange={handleStatusChange}>
                            <SelectTrigger className="h-9">
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
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                type="search"
                                placeholder="Search invoices..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className="h-9 pl-9"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                <div className="h-full grid grid-cols-[380px_1fr] gap-4 p-4">
                    {/* Invoice List */}
                    <Suspense fallback={<DialogLoadingFallback message="Loading invoice list..." />}>
                        <BulkInvoiceList
                            invoices={invoices}
                            selectedInvoices={selectedInvoices}
                            currentInvoiceIndex={currentInvoiceIndex}
                            handleSelectInvoice={handleSelectInvoice}
                            handleFilterChange={handleFilterChange}
                            getStatusConfig={getStatusConfig}
                            formatCurrency={formatCurrency}
                        />
                    </Suspense>

                    {/* Detail Panel */}
                    <Suspense fallback={<DialogLoadingFallback message="Loading invoice details..." />}>
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
                    </Suspense>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <Suspense fallback={<DialogLoadingFallback message="Loading confirmation dialog..." />}>
                <BulkInvoiceConfirmDialog
                    open={showConfirmDialog}
                    onOpenChange={setShowConfirmDialog}
                    bulkAction={bulkAction}
                    actionConfig={actionConfig}
                    reviewNotes={reviewNotes}
                    setReviewNotes={setReviewNotes}
                    onConfirm={confirmBulkAction}
                />
            </Suspense>
        </div>
    );
};

export default BulkInvoiceReview;
