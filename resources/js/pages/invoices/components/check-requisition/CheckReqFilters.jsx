import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Search } from 'lucide-react';

export default function CheckReqFilters({
    vendorFilter,
    purchaseOrderFilter,
    searchValue,
    filterOptions,
    onVendorChange,
    onPurchaseOrderChange,
    onSearchChange,
}) {
    return (
        <div className="flex items-center gap-2">
            <Select value={vendorFilter} onValueChange={onVendorChange}>
                <SelectTrigger className="h-8 w-48 text-xs border-slate-200">
                    <SelectValue placeholder="All Vendors" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Vendors</SelectItem>
                    {filterOptions?.vendors?.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id.toString()}>
                            {vendor.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Combobox
                value={purchaseOrderFilter === 'all' ? '' : purchaseOrderFilter.toString()}
                onValueChange={onPurchaseOrderChange}
                placeholder="All Purchase Orders"
                searchPlaceholder="Search PO..."
                emptyMessage="No purchase orders found."
                className="h-8 w-56 text-xs"
                options={[
                    { value: 'all', label: 'All Purchase Orders' },
                    ...(filterOptions?.purchaseOrders?.map((po) => ({
                        value: po.id.toString(),
                        label: `${po.po_number}${po.vendor?.name ? ' - ' + po.vendor.name : ''}`
                    })) || [])
                ]}
            />

            <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                    type="search"
                    placeholder="Search invoices or vendors..."
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-8 h-8 text-xs"
                />
            </div>
        </div>
    );
}
