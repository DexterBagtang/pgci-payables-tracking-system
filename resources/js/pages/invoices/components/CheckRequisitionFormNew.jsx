import { router, useForm } from '@inertiajs/react';
import { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from 'react';
import { toast } from 'sonner';
import DialogLoadingFallback from '@/components/custom/DialogLoadingFallback';
import { formatCurrency, numberToWords } from '@/components/custom/helpers.jsx';
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

// Import presentational components
import CheckReqHeader from './check-requisition/CheckReqHeader';
import CheckReqActiveFilters from './check-requisition/CheckReqActiveFilters';
import CheckReqFilters from './check-requisition/CheckReqFilters';
import CheckReqFormDetails from './check-requisition/CheckReqFormDetails';

// Lazy load heavy components
const CheckRequisitionInvoiceList = lazy(() => import('./CheckRequisitionInvoiceList.jsx'));

/**
 * Check Requisition Form Component
 * Follows invoice review module design patterns
 */
const CheckRequisitionFormNew = ({ invoices, filters, filterOptions }) => {
    const [selectedInvoices, setSelectedInvoices] = useState(new Set());
    const [selectedAmounts, setSelectedAmounts] = useState(new Map());
    const [currentInvoiceIndex, setCurrentInvoiceIndex] = useState(0);
    const [currentInvoice, setCurrentInvoice] = useState(invoices.data[0] || null);
    const [accumulatedInvoices, setAccumulatedInvoices] = useState(invoices.data || []);
    const [totalInvoicesCount, setTotalInvoicesCount] = useState(invoices.total || 0);
    const [searchValue, setSearchValue] = useState(filters.search || '');
    const [vendorFilter, setVendorFilter] = useState(filters.vendor || 'all');
    const [purchaseOrderFilter, setPurchaseOrderFilter] = useState(filters.purchase_order || 'all');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        request_date: new Date().toISOString().split("T")[0],
        payee_name: "",
        purpose: "",
        po_number: "",
        cer_number: "",
        si_number: "",
        account_charge: "2502",
        service_line_dist: "test",
        php_amount: 0,
        amount_in_words: "",
        requested_by: "KA. USONA / JL. MADERAZO",
        reviewed_by: "JS ORDONEZ / MR ULIT/ JB LABAY",
        approved_by: "CHRISTOPHER S. BAUTISTA / WILLY N. OCIER",
        invoice_ids: [],
    });

    const isInitialMount = useRef(true);
    const prevSelectionRef = useRef(new Set());

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

        router.get('/check-requisitions/create', updatedFilters, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page) => {
                // Update total count when filters change
                if (page.props.invoices?.total !== undefined) {
                    setTotalInvoicesCount(page.props.invoices.total);
                }
                
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
                newAmounts.set(invoiceId, invoiceObject.invoice_amount);
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
            newSelectedAmounts.set(invoice.id, invoice.invoice_amount);
        });

        setSelectedInvoices(newSelectedInvoices);
        setSelectedAmounts(newSelectedAmounts);
        toast.success(`Selected all ${accumulatedInvoices.length} loaded invoices`);
    }, [accumulatedInvoices]);

    // Callback to receive accumulated invoices and total count from CheckRequisitionInvoiceList
    const handleInvoicesUpdate = useCallback((updatedInvoices, totalCount) => {
        setAccumulatedInvoices(prevInvoices => {
            // Only update if the count or content actually changed
            if (prevInvoices.length !== updatedInvoices.length || 
                !updatedInvoices.every((inv, idx) => prevInvoices[idx]?.id === inv.id)) {
                return updatedInvoices;
            }
            return prevInvoices;
        });
        
        // Update total count if provided
        if (totalCount !== undefined) {
            setTotalInvoicesCount(totalCount);
        }
    }, [])

    // Helper function to get vendor name from either PO or direct invoice
    const getVendorName = useCallback((invoice) => {
        if (invoice.invoice_type === 'direct') {
            return invoice.direct_vendor?.name || '';
        }
        return invoice.purchase_order?.vendor?.name || '';
    }, []);

    // Helper function to get project CER from either PO or direct invoice
    const getProjectCER = useCallback((invoice) => {
        if (invoice.invoice_type === 'direct') {
            return invoice.direct_project?.cer_number || '';
        }
        return invoice.purchase_order?.project?.cer_number || '';
    }, []);

    // Populate form fields when invoice selection changes
    useEffect(() => {
        if (selectedInvoices.size === 0) return;

        const selectionChanged =
            prevSelectionRef.current.size !== selectedInvoices.size ||
            ![...selectedInvoices].every(id => prevSelectionRef.current.has(id));

        if (!selectionChanged) return;

        prevSelectionRef.current = new Set(selectedInvoices);

        const selectedInvs = accumulatedInvoices.filter((inv) =>
            selectedInvoices.has(inv.id)
        ) || [];

        const firstInvoice = selectedInvs[0];

        // Get unique vendors from both PO and direct invoices
        const uniqueVendors = new Set(
            selectedInvs.map((inv) => getVendorName(inv)).filter(Boolean)
        );

        const payeeName = uniqueVendors.size === 1
            ? getVendorName(firstInvoice) || ""
            : "Multiple Vendors";

        const siNumbersFormatted = formatSINumbers(selectedInvs);

        // Get PO number (only for PO-based invoices)
        const poNumber = firstInvoice?.invoice_type === 'purchase_order'
            ? firstInvoice?.purchase_order?.po_number || ""
            : "";

        setData({
            ...data,
            php_amount: selectedTotal,
            amount_in_words: numberToWords(selectedTotal) || "",
            payee_name: payeeName,
            po_number: poNumber,
            cer_number: getProjectCER(firstInvoice) || "",
            si_number: siNumbersFormatted,
            purpose: `Payment for Invoice(s) ${siNumbersFormatted}`,
            invoice_ids: Array.from(selectedInvoices),
        });
    }, [selectedInvoices, accumulatedInvoices, selectedTotal, getVendorName, getProjectCER]);

    const handleSubmit = useCallback(() => {
        if (selectedInvoices.size === 0) {
            toast.error("Please select at least one invoice");
            return;
        }

        setShowConfirmDialog(true);
    }, [selectedInvoices]);

    const confirmSubmit = useCallback(() => {
        setShowConfirmDialog(false);

        post("/check-requisitions", {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Check requisition created successfully!");
                setSelectedInvoices(new Set());
                setSelectedAmounts(new Map());
                reset();
            },
            onError: (errors) => {
                const errorMessages = Object.values(errors);
                if (errorMessages.length > 0) {
                    errorMessages.forEach(error => toast.error(error));
                } else {
                    toast.error("Submission failed");
                }
            },
        });
    }, [post, reset]);

    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
            {/* Sticky Header Bar */}
            <div className="bg-white border-b shadow-sm flex-shrink-0">
                <div className="px-4 py-2">
                    {/* Header with Action Buttons */}
                    <CheckReqHeader
                        selectedCount={selectedInvoices.size}
                        selectedTotal={selectedTotal}
                        totalInvoices={totalInvoicesCount}
                        loadedCount={accumulatedInvoices.length}
                        formatCurrency={formatCurrency}
                        onSubmit={handleSubmit}
                        onClearSelection={handleClearSelection}
                        onSelectAll={handleSelectAll}
                        processing={processing}
                        hasSelection={selectedInvoices.size > 0}
                    />

                    {/* Active Filters */}
                    <CheckReqActiveFilters
                        vendorFilter={vendorFilter}
                        purchaseOrderFilter={purchaseOrderFilter}
                        searchValue={searchValue}
                        filterOptions={filterOptions}
                        onRemoveVendor={() => handleVendorChange('all')}
                        onRemovePurchaseOrder={() => handlePurchaseOrderChange('all')}
                        onRemoveSearch={() => setSearchValue('')}
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
                                invoices={invoices}
                                selectedInvoices={selectedInvoices}
                                currentInvoiceIndex={currentInvoiceIndex}
                                handleSelectInvoice={handleSelectInvoice}
                                formatCurrency={formatCurrency}
                                filters={filters}
                                onInvoicesUpdate={handleInvoicesUpdate}
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
                        <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            <p>Are you sure you want to submit this check requisition?</p>
                            <div className="mt-4 space-y-2 text-sm">
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
                            {processing ? "Submitting..." : "Confirm & Submit"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default CheckRequisitionFormNew;
