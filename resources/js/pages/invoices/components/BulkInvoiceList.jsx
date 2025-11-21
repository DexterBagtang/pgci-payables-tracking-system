import StatusBadge from '@/components/custom/StatusBadge.jsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, Inbox, DollarSign, Calendar, FileText, CheckCircle2, XCircle, Package, Loader2 } from 'lucide-react';
import { memo, useCallback, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { route } from 'ziggy-js';

/**
 * Memoized invoice row component to prevent unnecessary re-renders
 * Only re-renders when its specific props change
 */
const InvoiceRow = memo(function InvoiceRow({
    invoice,
    index,
    isSelected,
    isCurrent,
    onSelect,
    formatCurrency,
    onQuickApprove,
    onQuickReject,
    onQuickMarkReceived,
}) {
    // Optimistic local state for instant UI feedback
    const [isCheckedLocal, setIsCheckedLocal] = useState(isSelected);

    // Sync with parent state
    useEffect(() => {
        setIsCheckedLocal(isSelected);
    }, [isSelected]);

    // Memoize click handlers to prevent recreating functions on every render
    const handleClick = useCallback(() => {
        setIsCheckedLocal(prev => !prev); // Instant visual feedback
        onSelect(invoice.id, index, invoice);
    }, [invoice, index, onSelect]);

    const handleCheckboxChange = useCallback(() => {
        setIsCheckedLocal(prev => !prev); // Instant visual feedback
        onSelect(invoice.id, index, invoice);
    }, [invoice, index, onSelect]);

    const handleQuickApproveClick = useCallback((e) => {
        e.stopPropagation();
        onQuickApprove(invoice.id);
    }, [invoice.id, onQuickApprove]);

    const handleQuickRejectClick = useCallback((e) => {
        e.stopPropagation();
        onQuickReject(invoice.id);
    }, [invoice.id, onQuickReject]);

    const handleQuickMarkReceivedClick = useCallback((e) => {
        e.stopPropagation();
        onQuickMarkReceived(invoice.id);
    }, [invoice.id, onQuickMarkReceived]);

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

                    {/* Line 1 — SI + Status + Amount */}
                    <div className="flex items-center justify-between leading-tight mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span
                                className="font-mono text-[11.5px] font-bold text-slate-900 truncate tracking-tight"
                                title={invoice.si_number}
                            >
                                {invoice.si_number}
                            </span>
                            <div className="scale-95">
                                <StatusBadge status={invoice.invoice_status} size="xs" />
                            </div>
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
                            title={invoice.purchase_order?.vendor?.name}
                        >
                            <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">{invoice.purchase_order?.vendor?.name}</span>
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
                </div>

                {/* Quick Actions — enhanced with colored hover states */}
                <div
                    className={`flex gap-1 items-center pr-1.5 transition-all duration-200
                        ${isCurrent || isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                    `}
                >
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleQuickMarkReceivedClick}
                        className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100 hover:scale-105 transition-all duration-200 rounded"
                        title="Mark as Received (Files)"
                    >
                        <Package className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleQuickApproveClick}
                        className="h-6 w-6 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 hover:scale-105 transition-all duration-200 rounded disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                        disabled={!invoice.files_received_at}
                        title={invoice.files_received_at ? "Approve Invoice" : "Cannot approve - files not received"}
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleQuickRejectClick}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 hover:scale-105 transition-all duration-200 rounded"
                        title="Reject Invoice"
                    >
                        <XCircle className="h-3.5 w-3.5" />
                    </Button>
                </div>

                {/* Left Active Indicator - Enhanced */}
                {isCurrent && (
                    <div className="absolute left-0 top-1 bottom-1 w-1 bg-gradient-to-b from-blue-600 to-blue-500 rounded-r-full shadow-sm" />
                )}
            </div>
        </div>



    );
}, (prevProps, nextProps) => {
    // Custom comparison: only re-render if these specific props change
    return (
        prevProps.invoice.id === nextProps.invoice.id &&
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.isCurrent === nextProps.isCurrent &&
        prevProps.invoice.invoice_status === nextProps.invoice.invoice_status &&
        prevProps.invoice.files_received_at === nextProps.invoice.files_received_at
        // Ignore function props since they're stable with useCallback
    );
});

/**
 * Bulk Invoice List Component with Infinite Scroll
 * Optimized with React.memo and useCallback to prevent unnecessary re-renders
 */
export default function BulkInvoiceList({
    invoices,
    selectedInvoices,
    currentInvoiceIndex,
    handleSelectInvoice,
    handleFilterChange,
    getStatusConfig,
    formatCurrency,
    onQuickApprove,
    onQuickReject,
    onQuickMarkReceived,
    filters,
    onInvoicesUpdate,
}) {
    // Infinite scroll state management
    const [accumulatedInvoices, setAccumulatedInvoices] = useState(invoices.data || []);
    const [currentPage, setCurrentPage] = useState(invoices.current_page || 1);
    const [hasMore, setHasMore] = useState(invoices.current_page < invoices.last_page);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [loadError, setLoadError] = useState(null);

    const sentinelRef = useRef(null);
    const scrollContainerRef = useRef(null);

    // Reset accumulated data when initial invoices change (filter change)
    useEffect(() => {
        const newInvoices = invoices.data || [];
        setAccumulatedInvoices(newInvoices);
        setCurrentPage(invoices.current_page || 1);
        setHasMore(invoices.current_page < invoices.last_page);
        setLoadError(null);

        // Notify parent of the accumulated invoices
        if (onInvoicesUpdate) {
            onInvoicesUpdate(newInvoices);
        }
    }, [invoices.data, invoices.current_page, invoices.last_page, onInvoicesUpdate]);

    // Load more invoices
    const loadMore = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        setLoadError(null);

        try {
            const nextPage = currentPage + 1;
            const response = await axios.get(route('invoices.bulk-review-api'), {
                params: {
                    ...filters,
                    page: nextPage,
                },
            });

            // API returns data in response.data.invoices
            const newInvoices = response.data.invoices.data || [];
            const lastPage = response.data.invoices.last_page;

            const updatedInvoices = [...accumulatedInvoices, ...newInvoices];
            setAccumulatedInvoices(updatedInvoices);
            setCurrentPage(nextPage);
            setHasMore(nextPage < lastPage);

            // Notify parent of the updated accumulated invoices
            if (onInvoicesUpdate) {
                onInvoicesUpdate(updatedInvoices);
            }
        } catch (error) {
            console.error('Failed to load more invoices:', error);
            setLoadError('Failed to load more invoices. Please try again.');
        } finally {
            setIsLoadingMore(false);
        }
    }, [currentPage, filters, hasMore, isLoadingMore, accumulatedInvoices, onInvoicesUpdate]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                // When sentinel becomes visible and we have more data
                if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                    loadMore();
                }
            },
            {
                root: scrollContainerRef.current,
                threshold: 0.1,
                rootMargin: '100px', // Start loading 100px before reaching bottom
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
                        <span className="font-semibold text-xs text-slate-900">Invoices</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 font-semibold text-[10px] h-4 px-1.5">
                        {accumulatedInvoices.length}
                    </Badge>
                </div>
            </CardHeader>

            {hasInvoices ? (
                <>
                    {/* Scrollable Invoice List with Infinite Scroll */}
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
                                        onSelect={handleSelectInvoice}
                                        formatCurrency={formatCurrency}
                                        onQuickApprove={onQuickApprove}
                                        onQuickReject={onQuickReject}
                                        onQuickMarkReceived={onQuickMarkReceived}
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
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={loadMore}
                                            className="text-xs"
                                        >
                                            Try Again
                                        </Button>
                                    </div>
                                )}

                                {/* End of List Message */}
                                {!hasMore && !isLoadingMore && accumulatedInvoices.length > 0 && (
                                    <div className="flex items-center justify-center py-3">
                                        <span className="text-xs text-slate-500">
                                            All invoices loaded ({accumulatedInvoices.length} total)
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
                    <p className="text-sm font-semibold text-slate-700 mb-1">No invoices found</p>
                    <p className="text-xs text-slate-500">Try adjusting your filters</p>
                </CardContent>
            )}
        </Card>
    );
}
