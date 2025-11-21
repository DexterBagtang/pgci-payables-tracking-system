import PaginationServerSide from '@/components/custom/Pagination.jsx';
import StatusBadge from '@/components/custom/StatusBadge.jsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Building2, Inbox, DollarSign, Calendar, FileText, CheckCircle2, XCircle, Package } from 'lucide-react';
import { memo, useCallback } from 'react';

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
    // Memoize click handlers to prevent recreating functions on every render
    const handleClick = useCallback(() => {
        onSelect(invoice.id, index);
    }, [invoice.id, index, onSelect]);

    const handleCheckboxChange = useCallback(() => {
        onSelect(invoice.id, index);
    }, [invoice.id, index, onSelect]);

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
        <div className="px-1.5 py-1">
            <div
                className={`
                    group relative cursor-pointer rounded border transition-all duration-100
                    ${isCurrent
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : isSelected
                            ? 'border-blue-300 bg-blue-50/50'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }
                `}
                onClick={handleClick}
            >
                <div className="p-1.5">
                    <div className="flex items-start gap-1.5">
                        {/* Checkbox */}
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={handleCheckboxChange}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-0.5 h-3 w-3 border data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />

                        <div className="flex-1 min-w-0 space-y-1">
                            {/* Invoice Number & Status */}
                            <div className="flex items-start justify-between gap-1">
                                <span className="font-mono text-[11px] font-bold text-slate-900 truncate leading-tight">
                                    {invoice.si_number}
                                </span>
                                <StatusBadge status={invoice.invoice_status} size="xs" />
                            </div>

                            {/* Vendor */}
                            <div className="flex items-center gap-1 text-[10px] text-slate-600">
                                <Building2 className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                                <span className="truncate font-medium">
                                    {invoice.purchase_order?.vendor?.name}
                                </span>
                            </div>

                            {/* Amount & Date Row */}
                            <div className="flex items-center justify-between gap-1">
                                {/* Amount */}
                                <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
                                    <DollarSign className="h-2.5 w-2.5 text-emerald-600" />
                                    <span className="text-[10px] font-bold text-emerald-700">
                                        {formatCurrency(invoice.invoice_amount, invoice.currency)}
                                    </span>
                                </div>

                                {/* Date */}
                                {invoice.si_date && (
                                    <div className="flex items-center gap-0.5 text-[10px] text-slate-500">
                                        <Calendar className="h-2.5 w-2.5" />
                                        <span>
                                            {new Date(invoice.si_date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Quick Actions - Show on hover or when current */}
                            <div className={`flex gap-0.5 mt-1 transition-opacity ${isCurrent || isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleQuickMarkReceivedClick}
                                    className="h-5 px-1 text-[10px] hover:bg-blue-100 hover:text-blue-700"
                                    title="Mark as received"
                                >
                                    <Package className="h-2.5 w-2.5 mr-0.5" />
                                    Recv
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleQuickApproveClick}
                                    className="h-5 px-1 text-[10px] hover:bg-emerald-100 hover:text-emerald-700"
                                    title="Quick approve"
                                    disabled={!invoice.files_received_at}
                                >
                                    <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                                    Appr
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleQuickRejectClick}
                                    className="h-5 px-1 text-[10px] hover:bg-red-100 hover:text-red-700"
                                    title="Quick reject"
                                >
                                    <XCircle className="h-2.5 w-2.5 mr-0.5" />
                                    Rej
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Indicator */}
                {isCurrent && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-600 rounded-l" />
                )}
            </div>
        </div>
    );
});

/**
 * Bulk Invoice List Component
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
}) {
    const hasInvoices = invoices?.data?.length > 0;

    // Wrap handlers in useCallback to maintain referential equality across renders
    const handleSelect = useCallback((invoiceId, index) => {
        handleSelectInvoice(invoiceId, index);
    }, [handleSelectInvoice]);

    const handleQuickApproveCallback = useCallback((invoiceId) => {
        onQuickApprove(invoiceId);
    }, [onQuickApprove]);

    const handleQuickRejectCallback = useCallback((invoiceId) => {
        onQuickReject(invoiceId);
    }, [onQuickReject]);

    const handleQuickMarkReceivedCallback = useCallback((invoiceId) => {
        onQuickMarkReceived(invoiceId);
    }, [onQuickMarkReceived]);

    return (
        <div className="flex flex-col h-full">
            <Card className="flex-1 flex flex-col shadow-sm border-slate-200">
                <CardHeader className="border-b bg-white px-2 py-1.5 space-y-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <FileText className="h-3 w-3 text-blue-600" />
                            <span className="font-semibold text-xs text-slate-900">Invoices</span>
                        </div>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 font-semibold text-[10px] h-4 px-1.5">
                            {invoices.data.length}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                    {hasInvoices ? (
                        <>
                            {/* Standard Scrolling List - Optimized with React.memo */}
                            <ScrollArea className="flex-1">
                                <div className="py-1">
                                    {invoices.data.map((invoice, index) => (
                                        <InvoiceRow
                                            key={invoice.id}
                                            invoice={invoice}
                                            index={index}
                                            isSelected={selectedInvoices.has(invoice.id)}
                                            isCurrent={currentInvoiceIndex === index}
                                            onSelect={handleSelect}
                                            formatCurrency={formatCurrency}
                                            onQuickApprove={handleQuickApproveCallback}
                                            onQuickReject={handleQuickRejectCallback}
                                            onQuickMarkReceived={handleQuickMarkReceivedCallback}
                                        />
                                    ))}
                                </div>
                            </ScrollArea>

                            {/* Pagination */}
                            <div className="border-t p-1.5">
                                <PaginationServerSide items={invoices} onChange={handleFilterChange} />
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="rounded-full bg-slate-100 p-4 mb-3">
                                <Inbox className="h-8 w-8 text-slate-400" />
                            </div>
                            <p className="text-sm font-semibold text-slate-700 mb-1">No invoices found</p>
                            <p className="text-xs text-slate-500">Try adjusting your filters</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
