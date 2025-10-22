import PaginationServerSide from '@/components/custom/Pagination.jsx';
import StatusBadge from '@/components/custom/StatusBadge.jsx';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Building2, Inbox, DollarSign, Calendar, FileText } from 'lucide-react';

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
        <div className="flex flex-col h-full">
            <Card className="flex-1 flex flex-col shadow-sm border-slate-200">
                <CardHeader className="border-b bg-white px-4 py-3 space-y-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-sm text-slate-900">Invoices</span>
                        </div>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 font-semibold">
                            {invoices.data.length}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 p-0 overflow-hidden">
                    {hasInvoices ? (
                        <>
                            <ScrollArea className="h-[calc(100vh-280px)]">
                                <div className="p-3 space-y-2">
                                    {invoices.data.map((invoice, index) => {
                                        const isSelected = selectedInvoices.has(invoice.id);
                                        const isCurrent = currentInvoiceIndex === index;

                                        return (
                                            <div
                                                key={invoice.id}
                                                className={`
                                                    group relative cursor-pointer rounded-lg border transition-all duration-150
                                                    ${isCurrent 
                                                        ? 'border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500/20' 
                                                        : isSelected
                                                            ? 'border-blue-300 bg-blue-50/50'
                                                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                                                    }
                                                `}
                                                onClick={() => handleSelectInvoice(invoice.id, index)}
                                            >
                                                <div className="p-3">
                                                    <div className="flex items-start gap-3">
                                                        {/* Checkbox */}
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() => handleSelectInvoice(invoice.id, index)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="mt-0.5 h-4 w-4 border-2 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                        />

                                                        <div className="flex-1 min-w-0 space-y-2">
                                                            {/* Invoice Number & Status */}
                                                            <div className="flex items-start justify-between gap-2">
                                                                <span className="font-mono text-sm font-bold text-slate-900 truncate">
                                                                    {invoice.si_number}
                                                                </span>
                                                                <StatusBadge status={invoice.invoice_status} size="xs" />
                                                            </div>

                                                            {/* Vendor */}
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                                <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                                <span className="truncate font-medium">
                                                                    {invoice.purchase_order?.vendor?.name}
                                                                </span>
                                                            </div>

                                                            {/* Amount & Date Row */}
                                                            <div className="flex items-center justify-between gap-2 pt-1">
                                                                {/* Amount */}
                                                                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded px-2 py-1">
                                                                    <DollarSign className="h-3 w-3 text-emerald-600" />
                                                                    <span className="text-xs font-bold text-emerald-700">
                                                                        {formatCurrency(invoice.invoice_amount).replace('PHP', '₱')}
                                                                    </span>
                                                                </div>

                                                                {/* Date */}
                                                                {invoice.si_date && (
                                                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                                                        <Calendar className="h-3 w-3" />
                                                                        <span>
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

                                                {/* Active Indicator */}
                                                {isCurrent && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-lg" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>

                            {/* Pagination */}
                            <div className="border-t p-3">
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
