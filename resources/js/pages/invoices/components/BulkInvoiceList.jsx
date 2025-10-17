import PaginationServerSide from '@/components/custom/Pagination.jsx';
import StatusBadge from '@/components/custom/StatusBadge.jsx';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Building2, Inbox, DollarSign, Calendar } from 'lucide-react';

export default function BulkInvoiceList({
    invoices,
    selectedInvoices,
    currentInvoiceIndex,
    handleSelectInvoice,
    handleFilterChange,
    getStatusConfig,
    formatCurrency,
}) {
    const hasInvoices = invoices?.data?.length > 0;

    return (
        <div className="space-y-2">
            <Card className="border-0 shadow-lg">
                <CardHeader className="border-b bg-gradient-to-r from-slate-50 via-white to-slate-50 p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-blue-100 p-1.5">
                                <Building2 className="h-3.5 w-3.5 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold text-slate-900">Invoice List</CardTitle>
                                <p className="text-[10px] text-slate-500">Select to review</p>
                            </div>
                        </div>
                        <Badge 
                            variant="secondary" 
                            className="bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 text-xs"
                        >
                            {invoices.data.length}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {hasInvoices ? (
                        <ScrollArea className="h-[calc(100vh-280px)]">
                            <div className="space-y-1.5 p-2.5">
                                {invoices.data.map((invoice, index) => {
                                    const isSelected = selectedInvoices.has(invoice.id);
                                    const isCurrent = currentInvoiceIndex === index;
                                    const hasFiles = invoice.files_received_at !== null;
                                    const statusConfig = getStatusConfig(invoice.invoice_status, hasFiles);

                                    return (
                                        <div
                                            key={invoice.id}
                                            className={`group relative cursor-pointer rounded-lg border-2 p-2 transition-all duration-150 ${
                                                isCurrent
                                                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-sm scale-[1.01]'
                                                    : isSelected
                                                      ? 'border-blue-300 bg-gradient-to-br from-blue-50/60 to-white'
                                                      : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                                            }`}
                                            onClick={() => handleSelectInvoice(invoice.id, index)}
                                        >
                                            {/* Selection indicator line */}
                                            {(isSelected || isCurrent) && (
                                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-blue-600 rounded-l-lg" />
                                            )}
                                            
                                            <div className="flex items-start gap-2">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => handleSelectInvoice(invoice.id, index)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="mt-0.5 h-4 w-4 border-2 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                />
                                                <div className="flex-1 space-y-1.5 overflow-hidden min-w-0">
                                                    {/* Header Row */}
                                                    <div className="flex items-start justify-between gap-1.5">
                                                        <span className="truncate font-mono text-xs font-bold text-slate-900 leading-tight">
                                                            {invoice.si_number}
                                                        </span>
                                                        <StatusBadge status={invoice.invoice_status} size="xs" />
                                                    </div>

                                                    {/* Vendor Row */}
                                                    <div className="flex items-center gap-1 text-[10px] text-slate-600">
                                                        <Building2 className="h-3 w-3 shrink-0 text-slate-400" />
                                                        <span className="truncate font-medium leading-tight">
                                                            {invoice.purchase_order?.vendor?.name}
                                                        </span>
                                                    </div>

                                                    {/* Amount and Date Row - Compact Side by Side */}
                                                    <div className="flex items-center justify-between gap-1.5">
                                                        {/* Amount */}
                                                        <div className={`flex items-center gap-1 rounded px-1.5 py-0.5 ${
                                                            isCurrent 
                                                                ? 'bg-emerald-100 border border-emerald-200'
                                                                : 'bg-emerald-50 border border-emerald-100'
                                                        }`}>
                                                            <DollarSign className="h-2.5 w-2.5 text-emerald-700" />
                                                            <span className="text-[10px] font-bold text-emerald-700 leading-tight">
                                                                {formatCurrency(invoice.invoice_amount).replace('PHP', '₱').replace('.00', '')}
                                                            </span>
                                                        </div>

                                                        {/* Date */}
                                                        {invoice.si_date && (
                                                            <div className="flex items-center gap-0.5 text-[9px] text-slate-500">
                                                                <Calendar className="h-2.5 w-2.5" />
                                                                <span className="font-medium leading-tight">
                                                                    {new Date(invoice.si_date).toLocaleDateString('en-US', { 
                                                                        month: 'short', 
                                                                        day: 'numeric'
                                                                    })}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                            <div className="rounded-full bg-slate-100 p-4 mb-3">
                                <Inbox className="h-8 w-8 text-slate-400" />
                            </div>
                            <p className="text-sm font-semibold text-slate-700 mb-1">No invoices found</p>
                            <p className="text-xs text-slate-500">Try adjusting your filters</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {hasInvoices && <PaginationServerSide items={invoices} onChange={handleFilterChange} />}
        </div>
    );
}
