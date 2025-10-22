import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Filter, X } from 'lucide-react';

export default function VendorFilters({ filters, onFilterChange }) {
    const statusOptions = [
        { label: 'Active', value: '1' },
        { label: 'Inactive', value: '0' }
    ];

    const categoryOptions = [
        { label: 'SAP', value: 'sap' },
        { label: 'Manual', value: 'manual' }
    ];

    const handleStatusToggle = (value) => {
        const currentStatus = filters.status ? filters.status.split(',') : [];
        const newStatus = currentStatus.includes(value)
            ? currentStatus.filter(s => s !== value)
            : [...currentStatus, value];
        
        onFilterChange({ 
            status: newStatus.length > 0 ? newStatus.join(',') : '',
            page: 1 
        });
    };

    const handleCategoryToggle = (value) => {
        const currentCategory = filters.category ? filters.category.split(',') : [];
        const newCategory = currentCategory.includes(value)
            ? currentCategory.filter(c => c !== value)
            : [...currentCategory, value];
        
        onFilterChange({ 
            category: newCategory.length > 0 ? newCategory.join(',') : '',
            page: 1 
        });
    };

    const clearFilters = () => {
        onFilterChange({ status: '', category: '', page: 1 });
    };

    const activeFiltersCount = 
        (filters.status ? filters.status.split(',').length : 0) +
        (filters.category ? filters.category.split(',').length : 0);

    return (
        <div className="flex items-center gap-3">
            {/* Status Filter */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Status
                        {filters.status && (
                            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                                {filters.status.split(',').length}
                            </Badge>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {statusOptions.map(option => (
                        <DropdownMenuCheckboxItem
                            key={option.value}
                            checked={filters.status?.split(',').includes(option.value)}
                            onCheckedChange={() => handleStatusToggle(option.value)}
                        >
                            {option.label}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Category Filter */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Category
                        {filters.category && (
                            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                                {filters.category.split(',').length}
                            </Badge>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {categoryOptions.map(option => (
                        <DropdownMenuCheckboxItem
                            key={option.value}
                            checked={filters.category?.split(',').includes(option.value)}
                            onCheckedChange={() => handleCategoryToggle(option.value)}
                        >
                            {option.label}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear Filters Button */}
            {activeFiltersCount > 0 && (
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="gap-2 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                    Clear ({activeFiltersCount})
                </Button>
            )}
        </div>
    );
}
