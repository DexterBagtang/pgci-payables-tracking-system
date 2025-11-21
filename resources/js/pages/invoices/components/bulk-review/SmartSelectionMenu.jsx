import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, CheckSquare, Building2, FileCheck, XSquare } from 'lucide-react';

/**
 * Smart Selection Menu Component
 * Provides intelligent bulk selection options
 */
export default function SmartSelectionMenu({
    invoices,
    accumulatedInvoices,
    onSelectInvoices,
    onClearSelection,
    hasSelection
}) {
    // Use accumulated invoices for selections (includes all loaded pages)
    const invoiceList = accumulatedInvoices || invoices.data || [];

    const handleSelectAll = () => {
        const allInvoiceData = invoiceList.map((invoice, index) => ({
            id: invoice.id,
            amount: invoice.invoice_amount,
            index
        }));
        onSelectInvoices(allInvoiceData);
    };

    const handleSelectByStatus = (status) => {
        const filtered = invoiceList
            .map((invoice, index) => ({ invoice, index }))
            .filter(({ invoice }) => invoice.invoice_status === status)
            .map(({ invoice, index }) => ({
                id: invoice.id,
                amount: invoice.invoice_amount,
                index
            }));
        onSelectInvoices(filtered);
    };

    const handleSelectReadyToApprove = () => {
        const filtered = invoiceList
            .map((invoice, index) => ({ invoice, index }))
            .filter(({ invoice }) =>
                invoice.invoice_status === 'received' &&
                invoice.files_received_at &&
                invoice.files?.length > 0
            )
            .map(({ invoice, index }) => ({
                id: invoice.id,
                amount: invoice.invoice_amount,
                index
            }));
        onSelectInvoices(filtered);
    };

    const handleSelectByVendor = (vendorId, vendorName) => {
        const filtered = invoiceList
            .map((invoice, index) => ({ invoice, index }))
            .filter(({ invoice }) => invoice.purchase_order?.vendor?.id === vendorId)
            .map(({ invoice, index }) => ({
                id: invoice.id,
                amount: invoice.invoice_amount,
                index
            }));
        onSelectInvoices(filtered);
    };

    // Get unique vendors from all loaded invoices
    const uniqueVendors = Array.from(
        new Map(
            invoiceList
                .filter(inv => inv.purchase_order?.vendor)
                .map(inv => [
                    inv.purchase_order.vendor.id,
                    inv.purchase_order.vendor
                ])
        ).values()
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-[10px] border border-blue-300 hover:bg-blue-50 hover:border-blue-400"
                >
                    <CheckSquare className="h-3 w-3 mr-1" />
                    Smart Select
                    <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel className="text-xs font-bold text-slate-600 uppercase">
                    Quick Selection
                </DropdownMenuLabel>

                <DropdownMenuItem onClick={handleSelectAll} className="cursor-pointer">
                    <CheckSquare className="mr-2 h-4 w-4 text-blue-600" />
                    <div>
                        <div className="font-semibold">Select All Loaded</div>
                        <div className="text-xs text-slate-500">
                            {invoiceList.length} invoices
                        </div>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleSelectReadyToApprove} className="cursor-pointer">
                    <FileCheck className="mr-2 h-4 w-4 text-emerald-600" />
                    <div>
                        <div className="font-semibold">Ready to Approve</div>
                        <div className="text-xs text-slate-500">
                            Files received & attached
                        </div>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="text-xs font-bold text-slate-600 uppercase">
                    By Status
                </DropdownMenuLabel>

                <DropdownMenuItem
                    onClick={() => handleSelectByStatus('received')}
                    className="cursor-pointer"
                >
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                    <span>All Received</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => handleSelectByStatus('pending')}
                    className="cursor-pointer"
                >
                    <div className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
                    <span>All Pending</span>
                </DropdownMenuItem>

                {uniqueVendors.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs font-bold text-slate-600 uppercase">
                            By Vendor (All Loaded)
                        </DropdownMenuLabel>

                        {uniqueVendors.slice(0, 5).map(vendor => (
                            <DropdownMenuItem
                                key={vendor.id}
                                onClick={() => handleSelectByVendor(vendor.id, vendor.name)}
                                className="cursor-pointer"
                            >
                                <Building2 className="mr-2 h-3.5 w-3.5 text-slate-500" />
                                <span className="truncate text-sm">{vendor.name}</span>
                            </DropdownMenuItem>
                        ))}

                        {uniqueVendors.length > 5 && (
                            <div className="px-2 py-1.5 text-xs text-slate-500">
                                +{uniqueVendors.length - 5} more vendors
                            </div>
                        )}
                    </>
                )}

                {hasSelection && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={onClearSelection}
                            className="cursor-pointer text-red-600 focus:text-red-600"
                        >
                            <XSquare className="mr-2 h-4 w-4" />
                            Clear Selection
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
