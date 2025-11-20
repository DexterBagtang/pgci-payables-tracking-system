import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Search } from 'lucide-react';

/**
 * Invoice Review Filters Component
 * Displays filter inputs for vendor, PO, status, and search
 * Principle: Single Responsibility - Only handles filter inputs
 */
export default function InvoiceReviewFilters({
    vendorFilter,
    purchaseOrderFilter,
    statusFilter,
    searchValue,
    filterOptions,
    onVendorChange,
    onPurchaseOrderChange,
    onStatusChange,
    onSearchChange
}) {
    const [vendorSearch, setVendorSearch] = useState('');

    return (
        <div className="grid grid-cols-4 gap-3">
            <Select value={vendorFilter} onValueChange={onVendorChange}>
                <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Vendors" />
                </SelectTrigger>
                <SelectContent>
                    <div className="border-b p-2">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search vendor..."
                                value={vendorSearch}
                                onChange={(e) => setVendorSearch(e.target.value)}
                                className="h-8 w-full rounded-md border border-input bg-background px-7 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <SelectItem value="all">All Vendors</SelectItem>
                    {filterOptions?.vendors
                        ?.filter((v) => v.name.toLowerCase().includes(vendorSearch.toLowerCase()))
                        .map((vendor) => (
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
                className="h-9"
                options={[
                    { value: 'all', label: 'All Purchase Orders' },
                    ...(filterOptions?.purchaseOrders?.map((po) => ({
                        value: po.id.toString(),
                        label: `${po.po_number} - ${po.vendor?.name || 'No Vendor'}`
                    })) || [])
                ]}
            />

            <Select value={statusFilter} onValueChange={onStatusChange}>
                <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="received">Files Received</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
            </Select>

            <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                    type="search"
                    placeholder="Search invoices..."
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="h-9 pl-9"
                />
            </div>
        </div>
    );
}
