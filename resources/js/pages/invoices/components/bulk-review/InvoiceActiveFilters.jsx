import { Badge } from '@/components/ui/badge';
import { Building2, ShoppingCart, AlertCircle, Search, Filter, XCircle } from 'lucide-react';

/**
 * Active Filters Display Component
 * Shows currently active filters as removable badges
 * Principle: Single Responsibility - Only handles active filters display
 */
export default function InvoiceActiveFilters({
    vendorFilter,
    purchaseOrderFilter,
    statusFilter,
    searchValue,
    filterOptions,
    onRemoveVendor,
    onRemovePurchaseOrder,
    onRemoveStatus,
    onRemoveSearch,
    onClearAll
}) {
    const hasActiveFilters = vendorFilter !== 'all' ||
                            purchaseOrderFilter !== 'all' ||
                            statusFilter !== 'all' ||
                            searchValue;

    if (!hasActiveFilters) return null;

    return (
        <div className="flex items-center gap-2 flex-wrap mb-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Filter className="h-3.5 w-3.5" />
                <span className="font-medium">Active Filters:</span>
            </div>

            {vendorFilter !== 'all' && (
                <Badge
                    variant="secondary"
                    className="gap-1.5 pl-2 pr-1 py-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                >
                    <Building2 className="h-3 w-3" />
                    <span className="text-xs">
                        {filterOptions?.vendors?.find(v => v.id.toString() === vendorFilter)?.name || 'Vendor'}
                    </span>
                    <button
                        onClick={onRemoveVendor}
                        className="ml-0.5 rounded-sm hover:bg-blue-200 p-0.5"
                    >
                        <XCircle className="h-3 w-3" />
                    </button>
                </Badge>
            )}

            {purchaseOrderFilter !== 'all' && (
                <Badge
                    variant="secondary"
                    className="gap-1.5 pl-2 pr-1 py-1 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                >
                    <ShoppingCart className="h-3 w-3" />
                    <span className="text-xs">
                        {filterOptions?.purchaseOrders?.find(po => po.id.toString() === purchaseOrderFilter)?.po_number || 'PO'}
                    </span>
                    <button
                        onClick={onRemovePurchaseOrder}
                        className="ml-0.5 rounded-sm hover:bg-purple-200 p-0.5"
                    >
                        <XCircle className="h-3 w-3" />
                    </button>
                </Badge>
            )}

            {statusFilter !== 'all' && (
                <Badge
                    variant="secondary"
                    className="gap-1.5 pl-2 pr-1 py-1 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                >
                    <AlertCircle className="h-3 w-3" />
                    <span className="text-xs capitalize">
                        {statusFilter.replace('_', ' ')}
                    </span>
                    <button
                        onClick={onRemoveStatus}
                        className="ml-0.5 rounded-sm hover:bg-amber-200 p-0.5"
                    >
                        <XCircle className="h-3 w-3" />
                    </button>
                </Badge>
            )}

            {searchValue && (
                <Badge
                    variant="secondary"
                    className="gap-1.5 pl-2 pr-1 py-1 bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                >
                    <Search className="h-3 w-3" />
                    <span className="text-xs max-w-[200px] truncate">
                        "{searchValue}"
                    </span>
                    <button
                        onClick={onRemoveSearch}
                        className="ml-0.5 rounded-sm hover:bg-slate-200 p-0.5"
                    >
                        <XCircle className="h-3 w-3" />
                    </button>
                </Badge>
            )}

            <button
                onClick={onClearAll}
                className="text-xs text-slate-500 hover:text-slate-700 underline ml-1"
            >
                Clear all
            </button>
        </div>
    );
}
