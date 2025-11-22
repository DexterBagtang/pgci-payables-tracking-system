import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

export default function CheckReqFilters({
    vendorFilter,
    searchValue,
    filterOptions,
    onVendorChange,
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
