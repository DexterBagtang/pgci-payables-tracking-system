import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, Inbox } from "lucide-react";
import PaginationServerSide from '@/components/custom/Pagination.jsx';

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
        <div className="space-y-3">
            <Card className="border-0 shadow-sm">
                <CardHeader className="p-3 pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold">Invoices</CardTitle>
                        <Badge variant="secondary">{invoices.data.length}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {hasInvoices ? (
                        <ScrollArea className="h-[calc(100vh-280px)]">
                            <div className="space-y-1.5 p-3">
                                {invoices.data.map((invoice, index) => {
                                    const isSelected = selectedInvoices.has(invoice.id);
                                    const isCurrent = currentInvoiceIndex === index;
                                    const hasFiles = invoice.files_received_at !== null;
                                    const statusConfig = getStatusConfig(
                                        invoice.invoice_status,
                                        hasFiles
                                    );

                                    return (
                                        <div
                                            key={invoice.id}
                                            className={`group cursor-pointer rounded-lg border-2 p-2.5 transition-all ${
                                                isCurrent
                                                    ? "border-blue-500 bg-blue-50 shadow-sm"
                                                    : isSelected
                                                        ? "border-blue-300 bg-blue-50/50"
                                                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                                            }`}
                                            onClick={() => handleSelectInvoice(invoice.id, index)}
                                        >
                                            <div className="flex items-start gap-2">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() =>
                                                        handleSelectInvoice(invoice.id, index)
                                                    }
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="mt-0.5"
                                                />
                                                <div className="flex-1 space-y-1 overflow-hidden">
                                                    <div className="flex items-center justify-between gap-2">
                            <span className="truncate font-mono text-xs font-bold text-slate-900">
                              {invoice.si_number}
                            </span>
                                                        <Badge
                                                            className={`${statusConfig.variant} flex items-center gap-1 border px-1.5 py-0 text-[10px]`}
                                                        >
                                                            {statusConfig.icon}
                                                            {statusConfig.label}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[11px] text-slate-600">
                                                        <Building2 className="h-3 w-3 shrink-0 text-slate-400" />
                                                        <span className="truncate">
                              {invoice.purchase_order?.vendor?.name}
                            </span>
                                                    </div>
                                                    <div className="text-sm font-bold text-emerald-600">
                                                        {formatCurrency(invoice.invoice_amount)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500">
                            <Inbox className="h-10 w-10 text-slate-400 mb-3" />
                            <p className="text-sm font-medium">No invoices found</p>
                            <p className="text-xs text-slate-400">
                                Try adjusting your filters or check back later.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {hasInvoices && (
                <PaginationServerSide
                    items={invoices}
                    onChange={handleFilterChange}
                />
            )}
        </div>
    );
}
