import { useState, useEffect, lazy, Suspense } from 'react';
import { router, usePage } from '@inertiajs/react';

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
import {
    Search,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Users,
    Plus,
    MoreVertical,
    Edit,
    Mail,
    MapPin,
    Phone, Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
const AddVendorDialog = lazy(() => import('@/pages/vendors/components/AddVendorDialog.jsx'));
const EditVendorDialog = lazy(() => import('@/pages/vendors/components/EditVendorDialog.jsx'));
import PaginationServerSide from '@/components/custom/Pagination.jsx';

export default function VendorsTable({ vendors, filters = {} }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [sortField, setSortField] = useState(filters.sort_field || '');
    const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'asc');

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
        console.log('Vendor edited successfully!');
        handleEditDialogClose();
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Vendors Management
                        </CardTitle>

                        <Suspense fallback={<Button className="gap-2" disabled><Plus className="h-4 w-4" />Add Vendor</Button>}>
                            <AddVendorDialog
                                trigger={
                                    <Button className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Add Vendor
                                    </Button>
                                }
                                onSuccess={() => {
                                    // Optional: Add any additional logic after successful vendor creation
                                    console.log('Vendor added successfully!');
                                }}
                            />
                        </Suspense>

                    </div>
                </CardHeader>
                <CardContent>
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
                        {(searchTerm || sortField) && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm('');
                                    setSortField('');
                                    setSortDirection('asc');
                                    handleFilterChange({ search: '', sort_field: '', sort_direction: '', page: 1 });
                                }}
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>

                    {/* Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('name')}
                                            className="h-auto p-0 font-semibold hover:bg-transparent"
                                        >
                                            Name {getSortIcon('name')}
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        Contact Person
                                    </TableHead>
                                    <TableHead>
                                        Contact
                                    </TableHead>
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
                                    <TableHead>
                                        Status
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
                                            vendor={vendor}
                                            key={vendor.id}
                                            onEdit={handleEditVendor}
                                        />
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8">
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
                <Suspense fallback={null}>
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

function VendorRow({ vendor, onEdit }) {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getCategoryColor = (category) => {
        const colors = {
            'sap': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700',
            'manual': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700',
        };
        return colors[category?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
    };

    const getStatusVariant = (isActive) => {
        return isActive ? 'default' : 'outline';
    };

    const getStatusColor = (isActive) => {
        return isActive ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700' : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
    };

    return (
        <TableRow className="group transition-all hover:bg-muted/30 border-b border-gray-100 dark:border-gray-800">
            <TableCell className="py-4 pl-4 pr-3">
                <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center mr-3">
                        <span className="font-medium text-blue-700 dark:text-blue-300">
                            {vendor.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <div
                            className="font-semibold text-gray-900 dark:text-gray-100 hover:underline hover:cursor-pointer"
                            onClick={()=>router.get(`/vendors/${vendor.id}`)}
                        >
                            {vendor.name}
                        </div>
                    </div>
                </div>
            </TableCell>
            <TableCell>{vendor.contact_person}</TableCell>
            <TableCell className="px-3 py-4 text-xs">
                {vendor.email ? (
                    <a
                        href={`mailto:${vendor.email}`}
                        className="text-blue-600 transition-colors hover:text-blue-800 hover:underline flex items-center"
                    >
                        <Mail className="h-3.5 w-3.5 mr-1.5" />
                        {vendor.email}
                    </a>
                ) : (
                    <span className="text-muted-foreground flex items-center">
                        <Mail className="h-3.5 w-3.5 mr-1.5 opacity-50" />
                        ---
                    </span>
                )}
                {vendor.phone ? (
                    <a
                        className="text-blue-600 transition-colors hover:text-blue-800 hover:underline flex items-center"
                    >
                        <Phone className="h-3.5 w-3.5 mr-1.5" />
                        {vendor.phone}
                    </a>
                ) : (
                    <span className="text-muted-foreground flex items-center">
                        <Phone className="h-3.5 w-3.5 mr-1.5 opacity-50" />
                        ---
                    </span>
                )}
            </TableCell>
            <TableCell className="px-3 py-4 max-w-[200px]">
                {vendor.address ? (
                    <div className="flex items-start">
                        <MapPin className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
                        <span className="truncate" title={vendor.address}>
                            {vendor.address}
                        </span>
                    </div>
                ) : (
                    <span className="text-muted-foreground">---</span>
                )}
            </TableCell>

            <TableCell className="px-3 py-4">
                <Badge
                    variant="secondary"
                    className={`rounded-md border ${getCategoryColor(vendor.category)} px-2.5 py-1 text-xs font-medium`}
                >
                    {vendor.category || 'Uncategorized'}
                </Badge>
            </TableCell>
            <TableCell className="px-3 py-4">
                <div className="flex items-center">
                    <Badge
                        variant={getStatusVariant(vendor.is_active)}
                        className={`rounded-full border ${getStatusColor(vendor.is_active)} py-1 px-2.5 text-xs font-medium flex items-center`}
                    >
                        <div className={`h-2 w-2 rounded-full mr-1.5 ${vendor.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        {vendor.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
            </TableCell>
            <TableCell className="px-3 py-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                    {formatDate(vendor.created_at)}
                </div>
            </TableCell>
            <TableCell className="px-3 py-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(vendor)}
                    className="rounded-full h-8 w-8 p-0"
                    aria-label={`Edit ${vendor.name}`}
                >
                    <Edit className="h-4 w-4" />
                </Button>
            </TableCell>
        </TableRow>
    );
}
