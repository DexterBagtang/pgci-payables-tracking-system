import { Filter, X, Building2, Search as SearchIcon } from 'lucide-react';

export default function CheckReqActiveFilters({
    vendorFilter,
    searchValue,
    filterOptions,
    onRemoveVendor,
    onRemoveSearch,
    onClearAll,
}) {
    const hasActiveFilters = vendorFilter !== 'all' || searchValue;

    if (!hasActiveFilters) return null;

    return (
        <div className="flex items-center gap-2 flex-wrap mb-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Filter className="h-3.5 w-3.5" />
                <span className="font-medium">Active Filters:</span>
            </div>

            {vendorFilter !== 'all' && (
                <span className="inline-flex items-center gap-1.5 h-6 pl-2 pr-1 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors">
                    <Building2 className="h-3 w-3" />
                    <span className="text-xs">
                        {filterOptions?.vendors?.find(v => v.id.toString() === vendorFilter)?.name || 'Vendor'}
                    </span>
                    <button
                        onClick={onRemoveVendor}
                        className="ml-0.5 rounded-sm hover:bg-blue-200 p-0.5 transition-colors"
                        type="button"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </span>
            )}

            {searchValue && (
                <span className="inline-flex items-center gap-1.5 h-6 pl-2 pr-1 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors">
                    <SearchIcon className="h-3 w-3" />
                    <span className="text-xs max-w-[200px] truncate">
                        "{searchValue}"
                    </span>
                    <button
                        onClick={onRemoveSearch}
                        className="ml-0.5 rounded-sm hover:bg-slate-200 p-0.5 transition-colors"
                        type="button"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </span>
            )}

            <button
                onClick={onClearAll}
                className="text-xs text-slate-500 hover:text-slate-700 underline ml-1"
                type="button"
            >
                Clear all
            </button>
        </div>
    );
}
