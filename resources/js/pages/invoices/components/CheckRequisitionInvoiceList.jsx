import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, Inbox, DollarSign, Calendar, FileText, Loader2, Package } from 'lucide-react';
import { memo, useCallback, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { route } from 'ziggy-js';

/**
 * Helper function to get vendor name from either PO or direct invoice
 */
const getVendorName = (invoice) => {
    if (invoice.invoice_type === 'direct') {
        return invoice.direct_vendor?.name || 'Unknown Vendor';
    }
    return invoice.purchase_order?.vendor?.name || 'Unknown Vendor';
};

/**
 * Memoized invoice row component for check requisition
 */
const InvoiceRow = memo(function InvoiceRow({
    invoice,
    index,
    isSelected,
    isCurrent,
    isOriginal,
    onSelect,
    formatCurrency,
}) {
    const [isCheckedLocal, setIsCheckedLocal] = useState(isSelected);
    const vendorName = getVendorName(invoice);

    useEffect(() => {
        setIsCheckedLocal(isSelected);
    }, [isSelected]);

    const handleClick = useCallback(() => {
        setIsCheckedLocal(prev => !prev);
        onSelect(invoice.id, index, invoice);
    }, [invoice, index, onSelect]);

    const handleCheckboxChange = useCallback(() => {
        setIsCheckedLocal(prev => !prev);
        onSelect(invoice.id, index, invoice);
    }, [invoice, index, onSelect]);

    return (
        <div className="px-1 py-0.5">
            <div
                className={`group relative cursor-pointer rounded-md flex items-center transition-all duration-200
                    ${isCurrent
                        ? 'bg-gradient-to-r from-blue-50 to-blue-50/50 shadow-sm ring-1 ring-blue-200/60'
                        : isCheckedLocal
                            ? 'bg-gradient-to-r from-blue-50/40 to-transparent ring-1 ring-blue-100/50'
                            : 'hover:bg-slate-50/80 hover:shadow-sm hover:ring-1 hover:ring-slate-200/50'
                    }
                `}
                onClick={handleClick}
            >
                {/* Checkbox */}
                <div className="px-1.5">
                    <Checkbox
                        checked={isCheckedLocal}
                        onCheckedChange={handleCheckboxChange}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 border-slate-300 transition-all duration-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:scale-105 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 py-1.5 pr-1">
                    {/* Line 1 — SI + Amount */}
                    <div className="flex items-center justify-between leading-tight mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span
                                className="font-mono text-[11.5px] font-bold text-slate-900 truncate tracking-tight"
                                title={invoice.si_number}
                            >
                                {invoice.si_number}
                            </span>
                            <span className="inline-flex items-center text-[9px] h-4 px-1.5 font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                                Approved
                            </span>
                            {isOriginal && (
                                <span className="inline-flex items-center text-[9px] h-4 px-1.5 font-semibold bg-blue-100 text-blue-700 border border-blue-300 rounded">
                                    Current
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-2">
                            <DollarSign className="h-3 w-3 text-emerald-600/70" />
                            <span className="text-[11.5px] font-bold text-emerald-700 whitespace-nowrap tabular-nums">
                                {formatCurrency(invoice.invoice_amount, invoice.currency)}
                            </span>
                        </div>
                    </div>

                    {/* Line 2 — Vendor + Date */}
                    <div className="flex items-center justify-between text-[10px] leading-tight">
                        <span
                            className="truncate flex items-center gap-1 text-slate-600 font-medium"
                            title={vendorName}
                        >
                            <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">{vendorName}</span>
                        </span>

                        {invoice.si_date && (
                            <span className="flex items-center gap-1 whitespace-nowrap text-slate-500 ml-2">
                                <Calendar className="h-3 w-3 text-slate-400" />
                                {new Date(invoice.si_date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </span>
                        )}
                    </div>

                    {/* Line 3 — PO Number (if exists) or Direct Invoice indicator */}
                    {invoice.invoice_type === 'purchase_order' && invoice.purchase_order?.po_number ? (
                        <div className="mt-0.5">
                            <span className="text-[9px] text-slate-500 flex items-center gap-1">
                                <Package className="h-2.5 w-2.5" />
                                PO: {invoice.purchase_order.po_number}
                            </span>
                        </div>
                    ) : invoice.invoice_type === 'direct' ? (
                        <div className="mt-0.5">
                            <span className="text-[9px] text-orange-600 flex items-center gap-1">
                                <FileText className="h-2.5 w-2.5" />
                                Direct Invoice
                            </span>
                        </div>
                    ) : null}
                </div>

                {/* Left Active Indicator */}
                {isCurrent && (
                    <div className="absolute left-0 top-1 bottom-1 w-1 bg-gradient-to-b from-blue-600 to-blue-500 rounded-r-full shadow-sm" />
                )}
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.invoice.id === nextProps.invoice.id &&
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.isCurrent === nextProps.isCurrent &&
        prevProps.isOriginal === nextProps.isOriginal
    );
});

/**
 * Check Requisition Invoice List Component with Infinite Scroll
 */
export default function CheckRequisitionInvoiceList({
    invoices,
    selectedInvoices,
    currentInvoiceIndex,
    handleSelectInvoice,
    formatCurrency,
    filters,
    onInvoicesUpdate,
    originalInvoiceIds = new Set(),
    isEdit = false,
    apiEndpoint = null,
}) {
    const [accumulatedInvoices, setAccumulatedInvoices] = useState(invoices.data || []);
    const [currentPage, setCurrentPage] = useState(invoices.current_page || 1);
    const [hasMore, setHasMore] = useState(invoices.current_page < invoices.last_page);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [totalInvoices, setTotalInvoices] = useState(invoices.total || 0);

    // Store original invoices to always include them in edit mode
    const originalInvoicesRef = useRef(new Map());

    const sentinelRef = useRef(null);
    const scrollContainerRef = useRef(null);

    // Store original invoices on first render in edit mode
    useEffect(() => {
        if (isEdit && originalInvoiceIds.size > 0 && originalInvoicesRef.current.size === 0) {
            const initialInvoices = invoices.data || [];
            initialInvoices.forEach(invoice => {
                if (originalInvoiceIds.has(invoice.id)) {
                    originalInvoicesRef.current.set(invoice.id, invoice);
                }
            });
        }
    }, [isEdit, originalInvoiceIds, invoices.data]);

    // Reset accumulated data when initial invoices change (filter change)
    useEffect(() => {
        const newInvoices = invoices.data || [];

        // In edit mode, always include original invoices even if they don't match filters
        let combinedInvoices = newInvoices;
        if (isEdit && originalInvoicesRef.current.size > 0) {
            // Create a map to avoid duplicates
            const invoiceMap = new Map();

            // Add original invoices first (they'll appear at the top)
            Array.from(originalInvoicesRef.current.values()).forEach(inv => {
                invoiceMap.set(inv.id, inv);
            });

            // Add new invoices (won't duplicate originals)
            newInvoices.forEach(inv => {
                if (!invoiceMap.has(inv.id)) {
                    invoiceMap.set(inv.id, inv);
                }
            });

            combinedInvoices = Array.from(invoiceMap.values());
        }

        setAccumulatedInvoices(combinedInvoices);
        setCurrentPage(invoices.current_page || 1);
        setHasMore(invoices.current_page < invoices.last_page);
        setTotalInvoices(invoices.total || 0);
        setLoadError(null);

        if (onInvoicesUpdate) {
            onInvoicesUpdate(combinedInvoices, invoices.total || 0);
        }
    }, [invoices.data, invoices.current_page, invoices.last_page, invoices.total, onInvoicesUpdate, isEdit]);

    // Load more invoices
    const loadMore = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        setLoadError(null);

        try {
            const nextPage = currentPage + 1;
            const endpoint = apiEndpoint || route('check-requisitions.create-api');
            const response = await axios.get(endpoint, {
                params: {
                    ...filters,
                    page: nextPage,
                },
            });

            const newInvoices = response.data.invoices.data || [];
            const lastPage = response.data.invoices.last_page;
            const total = response.data.invoices.total || 0;

            const updatedInvoices = [...accumulatedInvoices, ...newInvoices];

            setAccumulatedInvoices(updatedInvoices);
            setCurrentPage(nextPage);
            setHasMore(nextPage < lastPage);
            setTotalInvoices(total);

            if (onInvoicesUpdate) {
                onInvoicesUpdate(updatedInvoices, total);
            }
        } catch (error) {
            console.error('Failed to load more invoices:', error);
            setLoadError('Failed to load more invoices. Please try again.');
        } finally {
            setIsLoadingMore(false);
        }
    }, [currentPage, filters, hasMore, isLoadingMore, accumulatedInvoices, onInvoicesUpdate, apiEndpoint]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                    loadMore();
                }
            },
            {
                root: scrollContainerRef.current,
                threshold: 0.1,
                rootMargin: '100px',
            }
        );

        const sentinel = sentinelRef.current;
        if (sentinel) {
            observer.observe(sentinel);
        }

        return () => {
            if (sentinel) {
                observer.unobserve(sentinel);
            }
        };
    }, [hasMore, isLoadingMore, loadMore]);

    const hasInvoices = accumulatedInvoices.length > 0;

    return (
        <Card className="flex flex-col h-full shadow-sm border-slate-200">
            <CardHeader className="border-b bg-white px-2 py-1.5 space-y-0 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <FileText className="h-3 w-3 text-blue-600" />
                        <span className="font-semibold text-xs text-slate-900">Approved Invoices</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {hasMore ? (
                            <>
                                <span className="text-[10px] text-slate-500">
                                    {accumulatedInvoices.length} / {totalInvoices}
                                </span>
                                <span className="inline-flex items-center bg-amber-50 text-amber-700 font-semibold text-[10px] h-4 px-1.5 border border-amber-200 rounded">
                                    Loading...
                                </span>
                            </>
                        ) : (
                            <span className="inline-flex items-center bg-blue-50 text-blue-700 font-semibold text-[10px] h-4 px-1.5 border border-blue-100 rounded">
                                {totalInvoices}
                            </span>
                        )}
                    </div>
                </div>
            </CardHeader>

            {hasInvoices ? (
                <>
                    <div className="flex-1 relative">
                        <div
                            ref={scrollContainerRef}
                            className="absolute inset-0 overflow-y-auto overflow-x-hidden"
                        >
                            <div className="px-1.5 py-1">
                                {accumulatedInvoices.map((invoice, index) => (
                                    <InvoiceRow
                                        key={invoice.id}
                                        invoice={invoice}
                                        index={index}
                                        isSelected={selectedInvoices.has(invoice.id)}
                                        isCurrent={currentInvoiceIndex === index}
                                        isOriginal={isEdit && originalInvoiceIds.has(invoice.id)}
                                        onSelect={handleSelectInvoice}
                                        formatCurrency={formatCurrency}
                                    />
                                ))}

                                {/* Loading Indicator */}
                                {isLoadingMore && (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                        <span className="ml-2 text-sm text-slate-600">Loading more invoices...</span>
                                    </div>
                                )}

                                {/* Error Message */}
                                {loadError && (
                                    <div className="flex flex-col items-center justify-center py-4 px-4">
                                        <p className="text-sm text-red-600 mb-2">{loadError}</p>
                                    </div>
                                )}

                                {/* End of List Message */}
                                {!hasMore && !isLoadingMore && accumulatedInvoices.length > 0 && (
                                    <div className="flex items-center justify-center py-3">
                                        <span className="text-xs text-slate-500">
                                            ✓ All {totalInvoices} invoices loaded
                                        </span>
                                    </div>
                                )}

                                {/* Sentinel element for intersection observer */}
                                {hasMore && <div ref={sentinelRef} className="h-4" />}
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="rounded-full bg-slate-100 p-4 mb-3">
                        <Inbox className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">No approved invoices found</p>
                    <p className="text-xs text-slate-500">Try adjusting your filters</p>
                </CardContent>
            )}
        </Card>
    );
}
