import { router } from '@inertiajs/react';
import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { toast } from 'sonner';
import DialogLoadingFallback from '@/components/custom/DialogLoadingFallback';

// Import custom hook
import { useInvoiceFormatters } from '../hooks/useInvoiceFormatters';

// Import presentational components
import InvoiceReviewHeader from './bulk-review/InvoiceReviewHeader';
import InvoiceActiveFilters from './bulk-review/InvoiceActiveFilters';
import InvoiceReviewFilters from './bulk-review/InvoiceReviewFilters';

// Lazy load heavy components
const BulkInvoiceList = lazy(() => import('@/pages/invoices/components/BulkInvoiceList.jsx'));
const BulkInvoiceDetails = lazy(() => import('@/pages/invoices/components/BulkInvoicesDetails.jsx'));
const BulkInvoiceConfirmDialog = lazy(() => import('@/pages/invoices/components/BulkInvoiceConfirmDialog.jsx'));

/**
 * Main Bulk Invoice Review Component
 * Follows "Thinking in React" principles:
 * 1. Component Composition - Breaks down into smaller, focused components
 * 2. Custom Hooks - Extracts formatting logic
 * 3. Single Responsibility - Each sub-component has one job
 * 4. Data Flow - Props down, events up
 */
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
    const [reviewNotes, setReviewNotes] = useState('');

    // Custom hook for formatting utilities
    const { formatCurrency, formatDate, getStatusConfig } = useInvoiceFormatters();

    const selectedTotal = useMemo(() => {
        return Array.from(selectedAmounts.values()).reduce((sum, amount) => {
            return sum + parseFloat(amount || 0);
        }, 0);
    }, [selectedAmounts]);

    // Get currency from first selected invoice
    const selectedCurrency = useMemo(() => {
        if (selectedInvoices.size === 0) return 'PHP';
        const firstSelectedId = Array.from(selectedInvoices)[0];
        const invoice = invoices.data.find(inv => inv.id === firstSelectedId);
        return invoice?.currency || 'PHP';
    }, [selectedInvoices, invoices.data]);

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

    const handleSearchChange = (value) => {
        setSearchValue(value);
    };

    const handleClearFilters = () => {
        setVendorFilter('all');
        setPurchaseOrderFilter('all');
        setStatusFilter('all');
        setSearchValue('');
        handleFilterChange({ vendor: 'all', purchase_order: 'all', status: 'all', search: '', page: 1 });
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
                    description: `Mark files as received for ${selectedInvoices.size} invoice(s)? Total: ${formatCurrency(selectedTotal, selectedCurrency)}`,
                };
            case 'approve':
                return {
                    title: 'Approve Invoices',
                    description: `Approve ${selectedInvoices.size} invoice(s) for payment? Total: ${formatCurrency(selectedTotal, selectedCurrency)}`,
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
                    {/* Header with Action Buttons */}
                    <InvoiceReviewHeader
                        selectedCount={selectedInvoices.size}
                        selectedTotal={selectedTotal}
                        selectedCurrency={selectedCurrency}
                        formatCurrency={formatCurrency}
                        onMarkReceived={() => handleBulkAction('mark-received')}
                        onApprove={() => handleBulkAction('approve')}
                        onReject={() => handleBulkAction('reject')}
                    />

                    {/* Active Filters */}
                    <InvoiceActiveFilters
                        vendorFilter={vendorFilter}
                        purchaseOrderFilter={purchaseOrderFilter}
                        statusFilter={statusFilter}
                        searchValue={searchValue}
                        filterOptions={filterOptions}
                        onRemoveVendor={() => handleVendorChange('all')}
                        onRemovePurchaseOrder={() => handlePurchaseOrderChange('all')}
                        onRemoveStatus={() => handleStatusChange('all')}
                        onRemoveSearch={() => setSearchValue('')}
                        onClearAll={handleClearFilters}
                    />

                    {/* Filters Row */}
                    <InvoiceReviewFilters
                        vendorFilter={vendorFilter}
                        purchaseOrderFilter={purchaseOrderFilter}
                        statusFilter={statusFilter}
                        searchValue={searchValue}
                        filterOptions={filterOptions}
                        onVendorChange={handleVendorChange}
                        onPurchaseOrderChange={handlePurchaseOrderChange}
                        onStatusChange={handleStatusChange}
                        onSearchChange={handleSearchChange}
                    />
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
