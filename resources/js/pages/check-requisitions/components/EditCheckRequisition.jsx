import { router, useForm } from '@inertiajs/react';
import { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from 'react';
import { toast } from 'sonner';
import DialogLoadingFallback from '@/components/custom/DialogLoadingFallback';
import { formatCurrency, numberToWords } from '@/components/custom/helpers.jsx';
import { route } from 'ziggy-js';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

// Import presentational components from create form
import CheckReqHeader from '@/pages/invoices/components/check-requisition/CheckReqHeader';
import CheckReqActiveFilters from '@/pages/invoices/components/check-requisition/CheckReqActiveFilters';
import CheckReqFilters from '@/pages/invoices/components/check-requisition/CheckReqFilters';
import CheckReqFormDetails from '@/pages/invoices/components/check-requisition/CheckReqFormDetails';

// Lazy load heavy components
const CheckRequisitionInvoiceList = lazy(() => import('@/pages/invoices/components/CheckRequisitionInvoiceList.jsx'));

/**
 * Edit Check Requisition Component
 * Aligned with create form design patterns
 */
const EditCheckRequisition = ({ checkRequisition, currentInvoices, availableInvoices, filters, filterOptions }) => {
    // Initialize with current invoice IDs
    const [selectedInvoices, setSelectedInvoices] = useState(new Set(currentInvoices?.map((inv) => inv.id) || []));
    const [selectedAmounts, setSelectedAmounts] = useState(() => {
        const initialAmounts = new Map();
        currentInvoices?.forEach(inv => {
            initialAmounts.set(inv.id, inv.invoice_amount || inv.net_amount);
        });
        return initialAmounts;
    });
    const [currentInvoiceIndex, setCurrentInvoiceIndex] = useState(0);
    const [currentInvoice, setCurrentInvoice] = useState(null);
    const [accumulatedInvoices, setAccumulatedInvoices] = useState(() => {
        // Combine current and available invoices, avoiding duplicates
        const invoiceMap = new Map();
        [...(currentInvoices || []), ...(availableInvoices?.data || [])].forEach((inv) => {
            if (!invoiceMap.has(inv.id)) {
                invoiceMap.set(inv.id, inv);
            }
        });
        return Array.from(invoiceMap.values());
    });
    const [searchValue, setSearchValue] = useState(filters?.search || '');
    const [vendorFilter, setVendorFilter] = useState(filters?.vendor || 'all');
    const [purchaseOrderFilter, setPurchaseOrderFilter] = useState(filters?.purchase_order || 'all');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm({
        request_date: checkRequisition.request_date,
        payee_name: checkRequisition.payee_name,
        purpose: checkRequisition.purpose,
        po_number: checkRequisition.po_number,
        cer_number: checkRequisition.cer_number || '',
        si_number: checkRequisition.si_number,
        account_charge: checkRequisition.account_charge || '2502',
        service_line_dist: checkRequisition.service_line_dist || 'test',
        php_amount: checkRequisition.php_amount,
        amount_in_words: checkRequisition.amount_in_words,
        requested_by: checkRequisition.requested_by,
        reviewed_by: checkRequisition.reviewed_by || 'JS ORDONEZ / MR ULIT/ JB LABAY',
        approved_by: checkRequisition.approved_by || 'CHRISTOPHER S. BAUTISTA / WILLY N. OCIER',
        invoice_ids: currentInvoices?.map((inv) => inv.id) || [],
    });

    const prevSelectionRef = useRef(new Set(selectedInvoices));
    const originalInvoiceIds = useMemo(() => new Set(currentInvoices?.map(inv => inv.id) || []), [currentInvoices]);

    // Calculate total amount from selected invoices
    const selectedTotal = useMemo(() => {
        return Array.from(selectedAmounts.values()).reduce((sum, amount) => {
            return sum + parseFloat(amount || 0);
        }, 0);
    }, [selectedAmounts]);

    // Get full invoice objects for selected IDs
    const selectedInvoicesList = useMemo(() => {
        return accumulatedInvoices.filter((inv) => selectedInvoices.has(inv.id)) || [];
    }, [selectedInvoices, accumulatedInvoices]);

    // Format SI numbers with range support
    const formatSINumbers = (invoicesList) => {
        if (invoicesList.length === 0) return "";
        if (invoicesList.length <= 5) {
            return invoicesList.map((i) => i.si_number).join(", ");
        }

        const siNumbers = invoicesList.map((i) => i.si_number).sort();
        const first = siNumbers[0];
        const last = siNumbers[siNumbers.length - 1];
        return `${first} - ${last} (${siNumbers.length} invoices)`;
    };

    // Debounce search to avoid excessive API calls
    useEffect(() => {
        let isMounted = true;
        const timer = setTimeout(() => {
            if (isMounted && searchValue !== filters.search) {
                handleFilterChange({ search: searchValue, page: 1 });
            }
        }, 500);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [searchValue]);

    // Sync filter states with URL parameters on mount or filter changes
    useEffect(() => {
        if (filters.vendor && filters.vendor !== vendorFilter) {
            setVendorFilter(filters.vendor);
        }
        if (filters.purchase_order && filters.purchase_order !== purchaseOrderFilter) {
            setPurchaseOrderFilter(filters.purchase_order);
        }
    }, [filters]);

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

        router.get(`/check-requisitions/${checkRequisition.id}/edit`, updatedFilters, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                // Maintain selection after filter change
                setSelectedInvoices((prev) => {
                    const newSet = new Set(prev);
                    const newAmounts = new Map(selectedAmounts);
                    availableInvoices?.data?.forEach(inv => {
                        if (!newSet.has(inv.id)) return;
                        if (!availableInvoices.data.find(i => i.id === inv.id)) {
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
        setPurchaseOrderFilter(value);
        handleFilterChange({ purchase_order: value, page: 1 });
    };

    const handleSearchChange = (value) => {
        setSearchValue(value);
    };

    const handleClearFilters = () => {
        setVendorFilter('all');
        setPurchaseOrderFilter('all');
        setSearchValue('');
        handleFilterChange({ vendor: 'all', purchase_order: 'all', search: '', page: 1 });
    };

    const handleSelectInvoice = useCallback((invoiceId, index, invoiceObject) => {
        setCurrentInvoiceIndex(index);
        setCurrentInvoice(invoiceObject);

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
                newAmounts.set(invoiceId, invoiceObject.invoice_amount || invoiceObject.net_amount);
            }
            return newAmounts;
        });
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedInvoices(new Set());
        setSelectedAmounts(new Map());
        toast.info('Selection cleared');
    }, []);

    const handleSelectAll = useCallback(() => {
        const newSelectedInvoices = new Set();
        const newSelectedAmounts = new Map();

        accumulatedInvoices.forEach((invoice) => {
            newSelectedInvoices.add(invoice.id);
            newSelectedAmounts.set(invoice.id, invoice.invoice_amount || invoice.net_amount);
        });

        setSelectedInvoices(newSelectedInvoices);
        setSelectedAmounts(newSelectedAmounts);
        toast.success(`Selected all ${accumulatedInvoices.length} loaded invoices`);
    }, [accumulatedInvoices]);

    // Callback to receive accumulated invoices from CheckRequisitionInvoiceList
    const handleInvoicesUpdate = useCallback((updatedInvoices) => {
        setAccumulatedInvoices(updatedInvoices);
    }, []);

    // Track if there are changes
    const hasChanges = useMemo(() => {
        if (originalInvoiceIds.size !== selectedInvoices.size) return true;

        for (let id of originalInvoiceIds) {
            if (!selectedInvoices.has(id)) return true;
        }

        for (let id of selectedInvoices) {
            if (!originalInvoiceIds.has(id)) return true;
        }

        return (
            data.payee_name !== checkRequisition.payee_name ||
            data.purpose !== checkRequisition.purpose ||
            data.php_amount !== checkRequisition.php_amount ||
            data.request_date !== checkRequisition.request_date ||
            data.account_charge !== checkRequisition.account_charge ||
            data.service_line_dist !== checkRequisition.service_line_dist
        );
    }, [data, selectedInvoices, originalInvoiceIds, checkRequisition]);

    // Update form data when selection changes
    useEffect(() => {
        if (selectedInvoices.size === 0) return;

        const selectionChanged =
            prevSelectionRef.current.size !== selectedInvoices.size ||
            ![...selectedInvoices].every(id => prevSelectionRef.current.has(id));

        if (!selectionChanged) return;

        prevSelectionRef.current = new Set(selectedInvoices);

        // Update invoice_ids in form data
        setData('invoice_ids', Array.from(selectedInvoices));
        setData('php_amount', selectedTotal);
        setData('amount_in_words', numberToWords(selectedTotal) || '');

        const selectedInvs = accumulatedInvoices.filter((inv) =>
            selectedInvoices.has(inv.id)
        ) || [];

        const siNumbersFormatted = formatSINumbers(selectedInvs);
        setData('si_number', siNumbersFormatted);
    }, [selectedInvoices, accumulatedInvoices, selectedTotal]);

    const handleSubmit = useCallback(() => {
        if (selectedInvoices.size === 0) {
            toast.error("Please select at least one invoice");
            return;
        }

        if (!hasChanges) {
            toast.info("No changes detected");
            return;
        }

        setShowConfirmDialog(true);
    }, [selectedInvoices, hasChanges]);

    const confirmSubmit = useCallback(() => {
        setShowConfirmDialog(false);

        put(`/check-requisitions/${checkRequisition.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Check requisition updated successfully!");
            },
            onError: (errors) => {
                const errorMessages = Object.values(errors);
                if (errorMessages.length > 0) {
                    errorMessages.forEach(error => toast.error(error));
                } else {
                    toast.error("Update failed");
                }
            },
        });
    }, [put, checkRequisition.id]);

    // Convert availableInvoices to match the structure expected by CheckRequisitionInvoiceList
    const invoicesPagination = useMemo(() => ({
        data: availableInvoices?.data || [],
        total: availableInvoices?.total || 0,
        current_page: availableInvoices?.current_page || 1,
        last_page: availableInvoices?.last_page || 1,
        per_page: availableInvoices?.per_page || 50,
        from: availableInvoices?.from || 0,
        to: availableInvoices?.to || 0,
    }), [availableInvoices]);

    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
            {/* Sticky Header Bar */}
            <div className="bg-white border-b shadow-sm flex-shrink-0">
                <div className="px-4 py-2">
                    {/* Edit Info Alert */}
                    <Alert className="mb-3 border-blue-200 bg-blue-50">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-xs text-blue-800">
                            Editing <strong>{checkRequisition.requisition_number}</strong>
                            {currentInvoices?.length > 0 && <span className="ml-1">• Currently has {currentInvoices.length} invoice(s) attached</span>}
                            {hasChanges && <span className="ml-1 text-amber-600">• Unsaved changes</span>}
                        </AlertDescription>
                    </Alert>

                    {/* Header with Action Buttons */}
                    <CheckReqHeader
                        selectedCount={selectedInvoices.size}
                        selectedTotal={selectedTotal}
                        totalInvoices={invoicesPagination.total}
                        loadedCount={accumulatedInvoices.length}
                        formatCurrency={formatCurrency}
                        onSubmit={handleSubmit}
                        onClearSelection={handleClearSelection}
                        onSelectAll={handleSelectAll}
                        processing={processing}
                        hasSelection={selectedInvoices.size > 0}
                        isEdit={true}
                        hasChanges={hasChanges}
                        checkRequisitionNumber={checkRequisition.requisition_number}
                    />

                    {/* Active Filters */}
                    <CheckReqActiveFilters
                        vendorFilter={vendorFilter}
                        purchaseOrderFilter={purchaseOrderFilter}
                        searchValue={searchValue}
                        filterOptions={filterOptions}
                        onRemoveVendor={() => handleVendorChange('all')}
                        onRemovePurchaseOrder={() => handlePurchaseOrderChange('all')}
                        onRemoveSearch={() => {
                            setSearchValue('');
                            handleFilterChange({ search: '', page: 1 });
                        }}
                        onClearAll={handleClearFilters}
                    />

                    {/* Filters Row */}
                    <CheckReqFilters
                        vendorFilter={vendorFilter}
                        purchaseOrderFilter={purchaseOrderFilter}
                        searchValue={searchValue}
                        filterOptions={filterOptions}
                        onVendorChange={handleVendorChange}
                        onPurchaseOrderChange={handlePurchaseOrderChange}
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
                            <CheckRequisitionInvoiceList
                                invoices={invoicesPagination}
                                selectedInvoices={selectedInvoices}
                                currentInvoiceIndex={currentInvoiceIndex}
                                handleSelectInvoice={handleSelectInvoice}
                                formatCurrency={formatCurrency}
                                filters={filters}
                                onInvoicesUpdate={handleInvoicesUpdate}
                                originalInvoiceIds={originalInvoiceIds}
                                isEdit={true}
                                apiEndpoint={route('check-requisitions.edit-api', checkRequisition.id)}
                            />
                        </Suspense>
                    </div>

                    {/* Right Column - Form Details */}
                    <div className="min-h-0 h-full">
                        <CheckReqFormDetails
                            data={data}
                            setData={setData}
                            errors={errors}
                        />
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Update</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            <p>Are you sure you want to update this check requisition?</p>
                            <div className="mt-4 space-y-2 text-sm">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Requisition #:</span>
                                    <span>{checkRequisition.requisition_number}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Payee:</span>
                                    <span>{data.payee_name}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Amount:</span>
                                    <span className="font-semibold text-blue-600">{formatCurrency(data.php_amount)}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Invoices:</span>
                                    <span>{selectedInvoices.size} selected</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Date:</span>
                                    <span>{data.request_date}</span>
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmSubmit}
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {processing ? "Updating..." : "Confirm & Update"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default EditCheckRequisition;
