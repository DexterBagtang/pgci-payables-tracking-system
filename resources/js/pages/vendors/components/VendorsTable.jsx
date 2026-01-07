import { useState, useEffect, lazy, Suspense } from 'react';
import { router } from '@inertiajs/react';
import { usePermissions } from '@/hooks/use-permissions';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Search,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Users,
    Plus,
    X
} from 'lucide-react';
import DialogLoadingFallback from '@/components/custom/DialogLoadingFallback.jsx';
import PaginationServerSide from '@/components/custom/Pagination.jsx';
import VendorStats from './VendorStats';
import BulkActionsBar from './BulkActionsBar';
import VendorFilters from './VendorFilters';
import VendorRow from './VendorRow';

// Lazy load dialog components
const AddVendorDialog = lazy(() => import('@/pages/vendors/components/AddVendorDialog.jsx'));
const EditVendorDialog = lazy(() => import('@/pages/vendors/components/EditVendorDialog.jsx'));

export default function VendorsTable({ vendors, filters = {}, stats = {} }) {
    const { canWrite } = usePermissions();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [sortField, setSortField] = useState(filters.sort_field || '');
    const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'asc');
    const [selectedVendors, setSelectedVendors] = useState([]);

    // State for managing the single edit dialog
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== filters.search) {
                handleFilterChange({ search: searchTerm, page: 1 });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Clear selection when data changes
    useEffect(() => {
        setSelectedVendors([]);
    }, [vendors.data]);

    const handleFilterChange = (newFilters) => {
        const updatedFilters = {
            ...filters,
            ...newFilters
        };

        // Remove empty filters
        Object.keys(updatedFilters).forEach(key => {
            if (!updatedFilters[key]) {
                delete updatedFilters[key];
            }
        });

        router.get('/vendors', updatedFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSort = (field) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(newDirection);

        handleFilterChange({
            sort_field: field,
            sort_direction: newDirection,
            page: 1
        });
    };

    const getSortIcon = (field) => {
        if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
        return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    };

    // Selection handlers
    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedVendors(vendors.data.map(v => v.id));
        } else {
            setSelectedVendors([]);
        }
    };

    const handleSelectVendor = (vendorId) => {
        setSelectedVendors(prev =>
            prev.includes(vendorId)
                ? prev.filter(id => id !== vendorId)
                : [...prev, vendorId]
        );
    };

    // Bulk actions
    const handleBulkActivate = () => {
        if (selectedVendors.length === 0) return;

        router.post('/vendors/bulk-activate', {
            vendor_ids: selectedVendors
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setSelectedVendors([]);
            }
        });
    };

    const handleBulkDeactivate = () => {
        if (selectedVendors.length === 0) return;

        router.post('/vendors/bulk-deactivate', {
            vendor_ids: selectedVendors
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setSelectedVendors([]);
            }
        });
    };

    const handleBulkDelete = () => {
        if (selectedVendors.length === 0) return;

        if (confirm(`Are you sure you want to delete ${selectedVendors.length} vendor(s)? This action cannot be undone.`)) {
            router.post('/vendors/bulk-delete', {
                vendor_ids: selectedVendors
            }, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedVendors([]);
                }
            });
        }
    };

    // Handle edit vendor click
    const handleEditVendor = (vendor) => {
        setSelectedVendor(vendor);
        setEditDialogOpen(true);
    };

    // Handle edit dialog close
    const handleEditDialogClose = () => {
        setEditDialogOpen(false);
        setSelectedVendor(null);
    };

    // Handle successful edit
    const handleEditSuccess = () => {
        handleEditDialogClose();
    };

    const isAllSelected = vendors.data?.length > 0 && selectedVendors.length === vendors.data.length;
    const isSomeSelected = selectedVendors.length > 0 && selectedVendors.length < vendors.data?.length;

    return (
        <>
            {/* Stats Cards */}
            <VendorStats stats={stats} />

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Vendors Management
                        </CardTitle>

                        {canWrite('vendors') && (
                            <Suspense fallback={<DialogLoadingFallback message="Loading form..." />}>
                                <AddVendorDialog
                                    trigger={
                                        <Button className="gap-2">
                                            <Plus className="h-4 w-4" />
                                            Add Vendor
                                    </Button>
                                }
                            />
                        </Suspense>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Bulk Actions Bar */}
                    <BulkActionsBar
                        selectedCount={selectedVendors.length}
                        onActivate={handleBulkActivate}
                        onDeactivate={handleBulkDeactivate}
                        onDelete={handleBulkDelete}
                    />

                    {/* Active Filters Display */}
                    {(searchTerm || sortField || filters.status || filters.category) && (
                        <div className="mb-3 flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                <Search className="h-3.5 w-3.5" />
                                <span className="font-medium">Active Filters:</span>
                            </div>

                            {searchTerm && (
                                <Badge
                                    variant="secondary"
                                    className="gap-1.5 pl-2 pr-1 py-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                >
                                    <Search className="h-3 w-3" />
                                    <span className="text-xs max-w-[200px] truncate">
                                        "{searchTerm}"
                                    </span>
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="ml-0.5 rounded-sm hover:bg-blue-200 p-0.5"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}

                            {filters.status && (
                                <Badge
                                    variant="secondary"
                                    className="gap-1.5 pl-2 pr-1 py-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                >
                                    <span className="text-xs">
                                        Status: {filters.status.split(',').map(s => s === '1' ? 'Active' : 'Inactive').join(', ')}
                                    </span>
                                    <button
                                        onClick={() => handleFilterChange({ status: '', page: 1 })}
                                        className="ml-0.5 rounded-sm hover:bg-green-200 p-0.5"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}

                            {filters.category && (
                                <Badge
                                    variant="secondary"
                                    className="gap-1.5 pl-2 pr-1 py-1 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                                >
                                    <span className="text-xs capitalize">
                                        Category: {filters.category.split(',').join(', ')}
                                    </span>
                                    <button
                                        onClick={() => handleFilterChange({ category: '', page: 1 })}
                                        className="ml-0.5 rounded-sm hover:bg-purple-200 p-0.5"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}

                            {sortField && (
                                <Badge
                                    variant="secondary"
                                    className="gap-1.5 pl-2 pr-1 py-1 bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                                >
                                    {sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                    <span className="text-xs capitalize">
                                        {sortField.replace('_', ' ')} ({sortDirection})
                                    </span>
                                    <button
                                        onClick={() => {
                                            setSortField('');
                                            setSortDirection('asc');
                                            handleFilterChange({ sort_field: '', sort_direction: '', page: 1 });
                                        }}
                                        className="ml-0.5 rounded-sm hover:bg-orange-200 p-0.5"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}

                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSortField('');
                                    setSortDirection('asc');
                                    handleFilterChange({
                                        search: '',
                                        sort_field: '',
                                        sort_direction: '',
                                        status: '',
                                        category: '',
                                        page: 1
                                    });
                                }}
                                className="text-xs text-slate-500 hover:text-slate-700 underline ml-1"
                            >
                                Clear all
                            </button>
                        </div>
                    )}

                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search vendors by name, email, or category..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <VendorFilters
                            filters={filters}
                            onFilterChange={handleFilterChange}
                        />
                    </div>

                    {/* Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={isAllSelected}
                                            onCheckedChange={handleSelectAll}
                                            aria-label="Select all vendors"
                                            className={isSomeSelected ? "data-[state=checked]:bg-blue-500" : ""}
                                        />
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('name')}
                                            className="h-auto p-0 font-semibold hover:bg-transparent"
                                        >
                                            Name {getSortIcon('name')}
                                        </Button>
                                    </TableHead>
                                    <TableHead>Contact Person</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead className="w-[200px]">Address</TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('category')}
                                            className="h-auto p-0 font-semibold hover:bg-transparent"
                                        >
                                            Category {getSortIcon('category')}
                                        </Button>
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('purchase_orders_count')}
                                            className="h-auto p-0 font-semibold hover:bg-transparent"
                                        >
                                            Purchase Orders {getSortIcon('purchase_orders_count')}
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('invoices_count')}
                                            className="h-auto p-0 font-semibold hover:bg-transparent"
                                        >
                                            Invoices {getSortIcon('invoices_count')}
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('created_at')}
                                            className="h-auto p-0 font-semibold hover:bg-transparent"
                                        >
                                            Date Created {getSortIcon('created_at')}
                                        </Button>
                                    </TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vendors.data?.length > 0 ? (
                                    vendors.data.map((vendor) => (
                                        <VendorRow
                                            key={vendor.id}
                                            vendor={vendor}
                                            isSelected={selectedVendors.includes(vendor.id)}
                                            onSelect={handleSelectVendor}
                                            onEdit={handleEditVendor}
                                        />
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={11} className="text-center py-8">
                                            <div className="flex flex-col items-center gap-2">
                                                <Users className="h-8 w-8 text-muted-foreground" />
                                                <p className="text-muted-foreground">
                                                    {searchTerm ? 'No vendors found matching your search.' : 'No vendors found.'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <PaginationServerSide items={vendors} onChange={handleFilterChange} />
                </CardContent>
            </Card>

            {/* Single Edit Dialog Instance */}
            {selectedVendor && (
                <Suspense fallback={<DialogLoadingFallback message="Loading form..." />}>
                    <EditVendorDialog
                        key={selectedVendor.id}
                        vendor={selectedVendor}
                        isOpen={editDialogOpen}
                        onOpenChange={setEditDialogOpen}
                        onSuccess={handleEditSuccess}
                    />
                </Suspense>
            )}
        </>
    );
}
