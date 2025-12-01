import { router } from '@inertiajs/react';
import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { toast } from 'sonner';
import DialogLoadingFallback from '@/components/custom/DialogLoadingFallback';

// Import custom hook
import { useInvoiceFormatters } from '../hooks/useInvoiceFormatters';

// Import presentational components
import InvoiceReviewHeader from './bulk-review/InvoiceReviewHeader';
import InvoiceActiveFilters from './bulk-review/InvoiceActiveFilters';
import InvoiceReviewFilters from './bulk-review/InvoiceReviewFilters';
import InvoiceFilterPresets from './bulk-review/InvoiceFilterPresets';

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
    const [currentInvoice, setCurrentInvoice] = useState(invoices.data[0] || null);
    const [accumulatedInvoices, setAccumulatedInvoices] = useState(invoices.data || []);
    const [searchValue, setSearchValue] = useState(filters.search || '');
    const [vendorFilter, setVendorFilter] = useState(filters.vendor || 'all');
    const [purchaseOrderFilter, setPurchaseOrderFilter] = useState(filters.purchase_order || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [bulkAction, setBulkAction] = useState(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [reviewedCount, setReviewedCount] = useState(0);
    const [validationIssues, setValidationIssues] = useState([]);

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

    const handleApplyPreset = (presetFilters) => {
        // Update local state
        setVendorFilter(presetFilters.vendor || 'all');
        setPurchaseOrderFilter(presetFilters.purchase_order || 'all');
        setStatusFilter(presetFilters.status || 'all');
        setSearchValue('');

        // Apply filters
        handleFilterChange({ ...presetFilters, page: 1 });
    };

    // Memoize handler to prevent creating new function on every render
    // React 18 automatically batches state updates for better performance
    const handleSelectInvoice = useCallback((invoiceId, index, invoiceObject) => {
        // Update current index immediately for instant UI feedback
        setCurrentInvoiceIndex(index);

        // Store the full invoice object for details panel
        setCurrentInvoice(invoiceObject);

        // Update selection state - React 18 batches these automatically
        setSelectedInvoices((prev) => {
            const newSelected = new Set(prev);
            if (newSelected.has(invoiceId)) {
                newSelected.delete(invoiceId);
            } else {
                newSelected.add(invoiceId);
            }
            return newSelected;
        });

        setSelectedAmounts((prev) => {
            const newAmounts = new Map(prev);
            if (newAmounts.has(invoiceId)) {
                newAmounts.delete(invoiceId);
            } else {
                // Use the invoice amount from the invoice object
                newAmounts.set(invoiceId, invoiceObject.invoice_amount);
            }
            return newAmounts;
        });
    }, []);

    // Smart selection handlers - memoized
    const handleSmartSelect = useCallback((invoiceDataArray) => {
        const newSelected = new Set();
        const newAmounts = new Map();

        invoiceDataArray.forEach(({ id, amount }) => {
            newSelected.add(id);
            newAmounts.set(id, amount);
        });

        setSelectedInvoices(newSelected);
        setSelectedAmounts(newAmounts);

        if (invoiceDataArray.length > 0) {
            toast.success(`Selected ${invoiceDataArray.length} invoice(s)`);
        }
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedInvoices(new Set());
        setSelectedAmounts(new Map());
        toast.info('Selection cleared');
    }, []);

    const handleSelectVisible = useCallback(() => {
        const newSelectedInvoices = new Set();
        const newSelectedAmounts = new Map();

        // Select only the visible invoices from the current page (invoices.data)
        invoices.data.forEach((invoice) => {
            newSelectedInvoices.add(invoice.id);
            newSelectedAmounts.set(invoice.id, invoice.invoice_amount);
        });

        setSelectedInvoices(newSelectedInvoices);
        setSelectedAmounts(newSelectedAmounts);
        toast.success(`Selected ${invoices.data.length} visible invoice(s)`);
    }, [invoices.data]);

    const handleSelectAll = useCallback(() => {
        const newSelectedInvoices = new Set();
        const newSelectedAmounts = new Map();

        accumulatedInvoices.forEach((invoice) => {
            newSelectedInvoices.add(invoice.id);
            newSelectedAmounts.set(invoice.id, invoice.invoice_amount);
        });

        setSelectedInvoices(newSelectedInvoices);
        setSelectedAmounts(newSelectedAmounts);
        toast.success(`Selected all ${accumulatedInvoices.length} loaded invoices`);
    }, [accumulatedInvoices]);

    const handleNavigate = useCallback((direction) => {
        const newIndex = direction === 'prev'
            ? Math.max(0, currentInvoiceIndex - 1)
            : Math.min(accumulatedInvoices.length - 1, currentInvoiceIndex + 1);
        setCurrentInvoiceIndex(newIndex);
        setCurrentInvoice(accumulatedInvoices[newIndex]);
    }, [currentInvoiceIndex, accumulatedInvoices]);

    // Callback to receive accumulated invoices from BulkInvoiceList
    const handleInvoicesUpdate = useCallback((updatedInvoices) => {
        setAccumulatedInvoices(updatedInvoices);
    }, []);

    // Validate selected invoices before approval
    const validateInvoicesForApproval = (invoiceIds) => {
        const issues = [];

        invoiceIds.forEach(id => {
            const invoice = invoices.data.find(inv => inv.id === id);
            if (!invoice) return;

            // Check if files are received
            if (!invoice.files_received_at) {
                issues.push({
                    id: invoice.id,
                    si_number: invoice.si_number,
                    reason: 'Physical files not yet received'
                });
            }

            // Check if invoice has attached files
            if (!invoice.files || invoice.files.length === 0) {
                issues.push({
                    id: invoice.id,
                    si_number: invoice.si_number,
                    reason: 'No supporting documents attached'
                });
            }

            // Check if invoice is already in an approved state
            if (['approved', 'pending_disbursement', 'paid'].includes(invoice.invoice_status)) {
                issues.push({
                    id: invoice.id,
                    si_number: invoice.si_number,
                    reason: `Already ${invoice.invoice_status}`
                });
            }
        });

        return issues;
    };

    const handleBulkAction = useCallback((action) => {
        if (selectedInvoices.size === 0) return;

        // Validate before approval
        if (action === 'approve') {
            const issues = validateInvoicesForApproval(Array.from(selectedInvoices));
            setValidationIssues(issues);
        } else {
            setValidationIssues([]);
        }

        setBulkAction(action);
        setShowConfirmDialog(true);
    }, [selectedInvoices, invoices.data]);

    // Quick action handlers for individual invoices - memoized
    const handleQuickMarkReceived = useCallback((invoiceId) => {
        router.post('/invoice/bulk-mark-received', {
            invoice_ids: [invoiceId],
            notes: 'Quick action: Marked as received',
        }, {
            onSuccess: () => {
                setReviewedCount(prev => prev + 1);
            },
            onError: () => {
                // Errors handled by flash messages
            }
        });
    }, []);

    const handleQuickApprove = useCallback((invoiceId) => {
        const invoice = invoices.data.find(inv => inv.id === invoiceId);

        if (!invoice?.files_received_at) {
            toast.error('Cannot approve: Physical files not yet received');
            return;
        }

        router.post('/invoice/bulk-approve', {
            invoice_ids: [invoiceId],
            notes: 'Quick action: Approved',
        }, {
            onSuccess: () => {
                // toast.success('Invoice approved successfully!');
                setReviewedCount(prev => prev + 1);
            },
            onError: (errors) => {
                const msg = Array.isArray(errors)
                    ? errors[0]
                    : Object.values(errors || {})[0] || 'An unexpected error occurred.';
                toast.error(Array.isArray(msg) ? msg[0] : msg);
            }
        });
    }, [invoices.data]);

    const handleQuickReject = useCallback((invoiceId) => {
        // For reject, we need a reason, so open the dialog with just this invoice
        setSelectedInvoices(new Set([invoiceId]));
        const invoice = invoices.data.find(inv => inv.id === invoiceId);
        setSelectedAmounts(new Map([[invoiceId, invoice.invoice_amount]]));
        setBulkAction('reject');
        setShowConfirmDialog(true);
    }, [invoices.data]);

    const confirmBulkAction = () => {
        const invoiceIds = Array.from(selectedInvoices);

        router.post(`/invoice/bulk-${bulkAction}`, {
            invoice_ids: invoiceIds,
            notes: reviewNotes,
        }, {
            onSuccess: (e) => {
                // toast.success('Invoices marked as received successfully!');
                setReviewedCount(prev => prev + invoiceIds.length);
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

    // currentInvoice is now managed in state and updated when invoice is selected

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
        <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
            {/* Sticky Header Bar */}
            <div className="bg-white border-b shadow-sm flex-shrink-0">
                <div className="px-4 py-2">
                    {/* Header with Action Buttons */}
                    <InvoiceReviewHeader
                        selectedCount={selectedInvoices.size}
                        selectedTotal={selectedTotal}
                        selectedCurrency={selectedCurrency}
                        formatCurrency={formatCurrency}
                        onMarkReceived={() => handleBulkAction('mark-received')}
                        onApprove={() => handleBulkAction('approve')}
                        onReject={() => handleBulkAction('reject')}
                        onSelectVisible={handleSelectVisible}
                        onSelectAll={handleSelectAll}
                        onClearSelection={handleClearSelection}
                        totalInvoices={invoices.total}
                        reviewedCount={reviewedCount}
                        loadedCount={accumulatedInvoices.length}
                        visibleCount={invoices.data.length}
                        hasSelection={selectedInvoices.size > 0}
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

            {/* Main Content - Fixed height grid with scrollable columns */}
            <div className="flex-1 overflow-hidden min-h-0 max-h-full">
                <div className="grid grid-cols-[1fr_2fr] gap-3 p-3 h-full max-h-full">
                    {/* Left Column - Invoice List (Full Height) */}
                    <div className="min-h-0 h-full max-h-full">
                        <Suspense fallback={<DialogLoadingFallback message="Loading invoice list..." />}>
                            <BulkInvoiceList
                                invoices={invoices}
                                selectedInvoices={selectedInvoices}
                                currentInvoiceIndex={currentInvoiceIndex}
                                handleSelectInvoice={handleSelectInvoice}
                                handleFilterChange={handleFilterChange}
                                getStatusConfig={getStatusConfig}
                                formatCurrency={formatCurrency}
                                onQuickApprove={handleQuickApprove}
                                onQuickReject={handleQuickReject}
                                onQuickMarkReceived={handleQuickMarkReceived}
                                filters={filters}
                                onInvoicesUpdate={handleInvoicesUpdate}
                            />
                        </Suspense>
                    </div>

                    {/* Detail Panel - Also scrollable independently */}
                    <div className="min-h-0">
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
                    validationIssues={validationIssues}
                />
            </Suspense>
        </div>
    );
};

export default BulkInvoiceReview;
