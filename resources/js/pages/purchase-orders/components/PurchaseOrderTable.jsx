import React, { useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table.js";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.js";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.js";
import { Input } from "@/components/ui/input.js";
import { Button } from "@/components/ui/button.js";
import { Badge } from "@/components/ui/badge.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.js";
import { MoreHorizontal, Search, ArrowUpDown, Plus } from 'lucide-react';
import PaginationServerSide from '@/components/custom/Pagination.jsx';
import { toast } from 'sonner';


export default function PurchaseOrderTable({ purchaseOrders, filters, filterOptions }) {
    const { data } = purchaseOrders;
    const [localFilters, setLocalFilters] = useState({
        search: filters.search || '',
        status: filters.status || 'all',
        vendor: filters.vendor || 'all',
        project: filters.project || 'all',
    });

    const [projectSearch, setProjectSearch] = useState('')
    const [vendorSearch, setVendorSearch] = useState('')


    const [sortField, setSortField] = useState(filters.sort_field || 'po_date');
    const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'desc');


    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);

        // Debounce the search input to avoid too many requests
        if (key === 'search') {
            clearTimeout(window.searchTimeout);
            window.searchTimeout = setTimeout(() => {
                updateFilters(newFilters);
            }, 500);
        } else {
            updateFilters(newFilters);
        }
    };

    const updateFilters = (newFilters) => {
        const updatedFilters = {
            ...filters,
            ...newFilters,
            sort_field: sortField,
            sort_direction: sortDirection,
            page: 1
        };

        // Remove empty filters
        Object.keys(updatedFilters).forEach(key => {
            if (!updatedFilters[key] || updatedFilters[key] === 'all') {
                delete updatedFilters[key];
            }
        });

        router.get('/purchase-orders', updatedFilters, {
            preserveState: true,
            replace: true,
            only: ['purchaseOrders', 'filters'],
        });
    };


    const handleSort = (field) => {
        let newDirection = 'desc';
        if (sortField === field) {
            newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        }

        setSortField(field);
        setSortDirection(newDirection);

        updateFilters({
            sort_field: field,
            sort_direction: newDirection,
            page: 1
        });
    };



    const handlePageChange = ({ page }) => {
        const params = new URLSearchParams({
            ...localFilters,
            sort_field: sortField,
            sort_direction: sortDirection,
            page: page,
        });

        router.get(`/purchase-orders?${params.toString()}`, {}, {
            preserveState: true,
            replace: true,
            only: ['purchaseOrders', 'filters'],
        });
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            search: '',
            status: 'all',
            vendor: 'all',
            project: 'all',
        };

        setLocalFilters(clearedFilters);
        setSortField('po_date');
        setSortDirection('desc');

        router.get('/purchase-orders', {}, {
            preserveState: true,
            replace: true,
        });
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'draft': return 'secondary';
            case 'open': return 'default';
            case 'payable': return 'outline';
            case 'closed': return 'success';
            case 'cancelled': return 'destructive';
            default: return 'outline';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };
    const getActiveFilters = () => {
        const active = [];

        if (localFilters.search) active.push({ key: 'search', label: `Search: "${localFilters.search}"` });

        if (localFilters.status !== 'all') active.push({ key: 'status', label: `Status: ${localFilters.status}` });

        if (localFilters.vendor !== 'all') {
            const vendor = filterOptions.vendors.find(v => v.id === localFilters.vendor);
            active.push({ key: 'vendor', label: `Vendor: ${vendor?.name || localFilters.vendor}` });
        }
        if (localFilters.project !== 'all') {
            const project = filterOptions.projects.find(p => p.id === localFilters.project);
            active.push({ key: 'project', label: `Project: ${project?.project_title || localFilters.project}` });
        }

        return active;
    };

    const removeFilter = (key) => {
        const newFilters = { ...localFilters };
        if (key === 'search') newFilters.search = '';
        else newFilters[key] = 'all';

        setLocalFilters(newFilters);
        updateFilters(newFilters);
    };

    const isFiltered = localFilters.search !== '' || localFilters.status !== 'all' || localFilters.vendor !== 'all' || localFilters.project !== 'all';

    return (
        <div className="py-6">
            <div className="mx-auto sm:px-6 lg:px-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Purchase Orders</CardTitle>
                                <CardDescription>Manage and review all purchase orders</CardDescription>
                            </div>
                            <Button asChild>
                                <Link href='/purchase-orders/create' prefetch>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create New PO
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Filters */}
                        <div className="space-y-4 mb-4">
                            {/* Main Filters Row */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                                <div className="relative md:col-span-2">
                                    <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search PO, vendor..."
                                        className="pl-8"
                                        value={localFilters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                    />
                                </div>

                                <Select value={localFilters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem type="text" value="search" placeholder="Search Projects" />
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        {filterOptions.statuses.map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={localFilters.vendor} onValueChange={(value) => handleFilterChange('vendor', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Vendor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="p-2 border-b">
                                            <div className="relative">
                                                <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    placeholder="Search vendor..."
                                                    value={vendorSearch}
                                                    onChange={(e) => setVendorSearch(e.target.value)}
                                                    className="h-8 w-full rounded-md border border-input bg-background px-7 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                    onClick={(e) => e.stopPropagation()}
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </div>
                                        <SelectItem value="all">All Vendors</SelectItem>
                                        {filterOptions.vendors
                                            .filter(vendor =>
                                                vendor.name.toLowerCase().includes(vendorSearch.toLowerCase())
                                            )
                                            .map((vendor) => (
                                            <SelectItem key={vendor.id} value={vendor.id}>
                                                {vendor.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={localFilters.project} onValueChange={(value) => handleFilterChange('project', value)}>
                                    <SelectTrigger className="truncate">
                                        <SelectValue placeholder="Project" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="p-2 border-b">
                                            <div className="relative">
                                                <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    placeholder="Search project..."
                                                    value={projectSearch}
                                                    onChange={(e) => setProjectSearch(e.target.value)}
                                                    className="h-8 w-full rounded-md border border-input bg-background px-7 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                    onClick={(e) => e.stopPropagation()}
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </div>
                                        <SelectItem value="all">All Projects</SelectItem>
                                        {filterOptions.projects
                                            .filter(project =>
                                                project.project_title.toLowerCase().includes(projectSearch.toLowerCase())
                                            )
                                            .map((project) => (
                                                <SelectItem key={project.id} value={project.id}>
                                                    {project.project_title}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Active Filters & Clear Button */}
                            {isFiltered && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Active filters:</span>
                                    {getActiveFilters().map((filter) => (
                                        <Badge key={filter.key} variant="secondary" className="gap-1">
                                            {filter.label}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-4 w-4 p-0 hover:bg-red-200 hover:text-destructive-foreground"
                                                onClick={() => removeFilter(filter.key)}
                                            >
                                                ×
                                            </Button>
                                        </Badge>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleClearFilters}
                                        className="ml-2"
                                    >
                                        Clear all
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[140px] cursor-pointer" onClick={() => handleSort('po_number')}>
                                            <div className="flex items-center">
                                                PO Number
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer" onClick={() => handleSort('project.project_title')}>
                                            <div className="flex items-center">
                                                Project
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer" onClick={() => handleSort('vendor.name')}>
                                            <div className="flex items-center">
                                                Vendor
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </div>
                                        </TableHead>

                                        <TableHead className="cursor-pointer text-right" onClick={() => handleSort('po_amount')}>
                                            <div className="flex items-center justify-end">
                                                Amount
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer" onClick={() => handleSort('po_status')}>
                                            <div className="flex items-center">
                                                Status
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer" onClick={() => handleSort('po_date')}>
                                            <div className="flex items-center">
                                                PO Date
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer" onClick={() => handleSort('created_at')}>
                                            <div className="flex items-center">
                                                Created By
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-24 text-center">
                                                No purchase orders found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        data.map((po) => (
                                            <TableRow key={po.id} onClick={()=> router.get(`/purchase-orders/${po.id}`)} className="cursor-pointer">
                                                <TableCell className="font-medium">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold">{po.po_number}</span>
                                                        {/*<span className="text-xs text-muted-foreground">*/}
                                                        {/*    Terms: {po.payment_term || 'N/A'}*/}
                                                        {/*</span>*/}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-[300px]">
                                                    <div className="flex flex-col">
                                                        <span className="line-clamp-1 font-medium">{po.project?.project_title}</span>
                                                        <span className="text-xs text-muted-foreground">CER: {po.project?.cer_number}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span>{po.vendor?.name}</span>
                                                        <span className="text-xs text-muted-foreground">{po.vendor?.category}</span>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-semibold">{formatCurrency(po.po_amount)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusVariant(po.po_status)}>{po.po_status.replace('_', ' ')}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span>{formatDate(po.po_date)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-xs">
                                                        <div>{po.creator?.name}</div>
                                                        <div>{formatDate(po.created_at)}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/purchase-orders/${po.id}`}>View details</Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/purchase-orders/${po.id}/edit`}>Edit PO</Link>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <PaginationServerSide items={purchaseOrders} onChange={handlePageChange} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
