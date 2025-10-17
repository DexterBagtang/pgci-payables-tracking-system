import React, { useEffect, useState, Suspense, lazy } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from "@/components/ui/input.js";
import { Button } from "@/components/ui/button.js";
import { Badge } from "@/components/ui/badge.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.js";
import {
    MoreHorizontal,
    Search,
    ArrowUpDown,
    Plus,
    ArrowUp,
    ArrowDown,
    Building2,
    FileText,
    TrendingUp,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Package,
    Download,
    Eye,
    Edit,
    Calendar,
    Briefcase
} from 'lucide-react';
import PaginationServerSide from '@/components/custom/Pagination.jsx';
import { differenceInDays } from 'date-fns';
import StatusBadge from '@/components/custom/StatusBadge.jsx';
import DialogLoadingFallback from '@/components/custom/DialogLoadingFallback.jsx';

// Lazy load dialog components
const AddPurchaseOrderDialog = lazy(() => import('@/pages/purchase-orders/components/AddPurchaseOrderDialog.jsx'));
const EditPurchaseOrderDialog = lazy(() => import('@/pages/purchase-orders/components/EditPurchaseOrderDialog.jsx'));

export default function PurchaseOrderTable({ purchaseOrders, filters, filterOptions }) {
    console.log(filters,filterOptions);
    const { data } = purchaseOrders;
    const [localFilters, setLocalFilters] = useState({
        search: filters.search || '',
        status: filters.status || 'all',
        vendor: filters.vendor || 'all',
        project: filters.project || 'all',
    });

    const [projectSearch, setProjectSearch] = useState('');
    const [vendorSearch, setVendorSearch] = useState('');
    const [sortField, setSortField] = useState(filters.sort_field || 'po_date');
    const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'desc');
    const [activeTab, setActiveTab] = useState(filters.status || 'all');

    const [isCreateOpen, setCreateOpen] = useState(false);
    const [isEditOpen, setEditOpen] = useState(false);
    const [selectedPO, setSelectedPO] = useState(null);

    // SAP-like status configuration
    const getStatusConfig = (status) => {
        const configs = {
            draft: {
                color: 'bg-gray-50 text-gray-700 border-gray-200',
                icon: <FileText className="mr-1 h-3 w-3" />,
                label: 'Draft',
                sapCode: 'A',
            },
            open: {
                color: 'bg-blue-50 text-blue-700 border-blue-200',
                icon: <Package className="mr-1 h-3 w-3" />,
                label: 'Open',
                sapCode: 'B',
            },
            closed: {
                color: 'bg-green-50 text-green-700 border-green-200',
                icon: <CheckCircle2 className="mr-1 h-3 w-3" />,
                label: 'Closed',
                sapCode: 'C',
            },
            cancelled: {
                color: 'bg-red-50 text-red-700 border-red-200',
                icon: <XCircle className="mr-1 h-3 w-3" />,
                label: 'Cancelled',
                sapCode: 'D',
            },
        };
        return configs[status] || configs.draft;
    };

    // Calculate summary statistics
    const calculateSummary = () => {
        return {
            total: data.length,
            totalAmount: data.reduce((sum, po) => sum + parseFloat(po.po_amount || 0), 0),
            draft: data.filter((po) => po.po_status === 'draft').length,
            open: data.filter((po) => po.po_status === 'open').length,
            closed: data.filter((po) => po.po_status === 'closed').length,
            cancelled: data.filter((po) => po.po_status === 'cancelled').length,
        };
    };

    const summary = calculateSummary();

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);

        // Debounce the search input
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
            ...localFilters,
            sort_field: field,
            sort_direction: newDirection,
        });
    };

    const getSortIcon = (field) => {
        if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
        return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    };

    const handlePageChange = ({ page }) => {
        const params = {
            ...localFilters,
            sort_field: sortField,
            sort_direction: sortDirection,
            page: page,
        };

        // Remove empty filters
        Object.keys(params).forEach(key => {
            if (!params[key] || params[key] === 'all') {
                delete params[key];
            }
        });

        router.get('/purchase-orders', params, {
            preserveState: true,
            replace: true,
            only: ['purchaseOrders', 'filters'],
        });
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        handleFilterChange('status', tab);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const calculateDaysUntilDelivery = (deliveryDate) => {
        if (!deliveryDate) return null;
        return differenceInDays(new Date(deliveryDate), new Date());
    };

    const getDeliveryBadgeColor = (days) => {
        if (days === null) return 'bg-gray-50 text-gray-700 border-gray-200';
        if (days < 0) return 'bg-red-50 text-red-700 border-red-200';
        if (days <= 7) return 'bg-orange-50 text-orange-700 border-orange-200';
        if (days <= 30) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        return 'bg-green-50 text-green-700 border-green-200';
    };

    return (
        <div className="py-6">
            <div className="mx-auto sm:px-6 lg:px-8">
                {/* Summary Cards - SAP Dashboard Style */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Total POs</p>
                                    <p className="text-2xl font-bold">{summary.total}</p>
                                </div>
                                <FileText className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Total Value</p>
                                    <p className="text-lg font-bold">{formatCurrency(summary.totalAmount)}</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-gray-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Draft</p>
                                    <p className="text-2xl font-bold">{summary.draft}</p>
                                </div>
                                <FileText className="h-8 w-8 text-gray-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Open</p>
                                    <p className="text-2xl font-bold">{summary.open}</p>
                                </div>
                                <Package className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Closed</p>
                                    <p className="text-2xl font-bold">{summary.closed}</p>
                                </div>
                                <CheckCircle2 className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-xl">Purchase Order Management</CardTitle>
                                <CardDescription>Procurement & Vendor Order Tracking System</CardDescription>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Button variant="outline" size="sm">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                                {/*<Button asChild size="sm">*/}
                                {/*    <Link href='/purchase-orders/create' prefetch>*/}
                                {/*        <Plus className="mr-2 h-4 w-4" />*/}
                                {/*        Create PO*/}
                                {/*    </Link>*/}
                                {/*</Button>*/}

                                <Button onClick={()=>setCreateOpen(true)} size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create PO
                                </Button>

                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {/* Status Tabs - SAP Style */}
                        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-4">
                            <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="all" className="text-xs">
                                    All ({summary.total})
                                </TabsTrigger>
                                <TabsTrigger value="draft" className="text-xs">
                                    Draft ({summary.draft})
                                </TabsTrigger>
                                <TabsTrigger value="open" className="text-xs">
                                    Open ({summary.open})
                                </TabsTrigger>
                                <TabsTrigger value="closed" className="text-xs">
                                    Closed ({summary.closed})
                                </TabsTrigger>
                                <TabsTrigger value="cancelled" className="text-xs">
                                    Cancelled ({summary.cancelled})
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {/* Filters */}
                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                            {/* Search Input */}
                            <div className="relative md:col-span-2">
                                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search PO number, vendor, project..."
                                    className="pl-8"
                                    value={localFilters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                />
                            </div>

                            {/* Vendor Select */}
                            <Select value={localFilters.vendor} onValueChange={(value) => handleFilterChange('vendor', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Vendors" />
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
                                                className="h-8 w-full rounded-md border border-input bg-background px-7 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                                            <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                                {vendor.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>

                            {/* Project Select */}
                            <Select value={localFilters.project} onValueChange={(value) => handleFilterChange('project', value)}>
                                <SelectTrigger className="truncate">
                                    <SelectValue placeholder="All Projects" />
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
                                                className="h-8 w-full rounded-md border border-input bg-background px-7 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                                            <SelectItem key={project.id} value={project.id.toString()}>
                                                {project.project_title}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead className="font-semibold">
                                            <Button variant="ghost" size="sm" onClick={() => handleSort('po_number')} className="h-8">
                                                PO Number {getSortIcon('po_number')}
                                            </Button>
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            <Button variant="ghost" size="sm" onClick={() => handleSort('vendor.name')} className="h-8">
                                                Vendor Details {getSortIcon('vendor.name')}
                                            </Button>
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            <Button variant="ghost" size="sm" onClick={() => handleSort('project.project_title')} className="h-8">
                                                Project {getSortIcon('project.project_title')}
                                            </Button>
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            <Button variant="ghost" size="sm" onClick={() => handleSort('po_amount')} className="h-8">
                                                PO Amount {getSortIcon('po_amount')}
                                            </Button>
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            <Button variant="ghost" size="sm" onClick={() => handleSort('po_date')} className="h-8">
                                                Dates {getSortIcon('po_date')}
                                            </Button>
                                        </TableHead>
                                        <TableHead className="font-semibold">Status & Delivery</TableHead>
                                        <TableHead className="font-semibold">Created By</TableHead>
                                        <TableHead className="text-right font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="py-12 text-center">
                                                <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                                                    <Package className="h-12 w-12" />
                                                    <p className="text-sm font-medium">No purchase orders found</p>
                                                    <p className="text-xs">Try adjusting your filters or search criteria</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        data.map((po) => {
                                            const statusConfig = getStatusConfig(po.po_status);
                                            const daysUntilDelivery = calculateDaysUntilDelivery(po.expected_delivery_date);

                                            return (
                                                <TableRow
                                                    key={po.id}
                                                    onClick={() => router.get(`/purchase-orders/${po.id}`)}
                                                    className="cursor-pointer hover:bg-slate-50"
                                                >
                                                    {/* PO Number */}
                                                    <TableCell className="font-medium">
                                                        <div className="flex flex-col space-y-1">
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="flex items-center">
                                                                            <Briefcase className="mr-2 h-4 w-4 text-blue-600" />
                                                                            <span className="font-semibold text-blue-600">{po.po_number}</span>
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Purchase Order Number</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                            {po.payment_term && (
                                                                <span className="text-xs text-gray-500">
                                                                    Terms: {po.payment_term}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>

                                                    {/* Vendor */}
                                                    <TableCell>
                                                        <div className="flex flex-col space-y-1">
                                                            <div className="flex items-center">
                                                                <Building2 className="mr-1 h-4 w-4 text-gray-500" />
                                                                <span className="font-medium text-sm">{po.vendor?.name}</span>
                                                            </div>
                                                            {po.vendor?.category && (
                                                                <Badge variant="outline" className="w-fit text-xs">
                                                                    {po.vendor.category}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>

                                                    {/* Project */}
                                                    <TableCell className="max-w-[280px]">
                                                        <div className="flex flex-col space-y-1">
                                                            <span className="line-clamp-1 font-medium text-sm">
                                                                {po.project?.project_title}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                CER: {po.project?.cer_number}
                                                            </span>
                                                        </div>
                                                    </TableCell>

                                                    {/* Amount */}
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="text-lg font-bold text-green-700">
                                                                {formatCurrency(po.po_amount)}
                                                            </span>
                                                            <span className="text-xs text-gray-500">PO Value</span>
                                                        </div>
                                                    </TableCell>

                                                    {/* Dates */}
                                                    <TableCell>
                                                        <div className="flex flex-col space-y-1 text-sm">
                                                            <div>
                                                                <span className="text-xs text-gray-500">PO Date:</span>
                                                                <div className="font-medium">{formatDate(po.po_date)}</div>
                                                            </div>
                                                            {po.expected_delivery_date && (
                                                                <div>
                                                                    <span className="text-xs text-gray-500">Expected:</span>
                                                                    <div className="text-xs">{formatDate(po.expected_delivery_date)}</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>

                                                    {/* Status & Delivery */}
                                                    <TableCell>
                                                        <div className="flex flex-col space-y-2">
                                                            <StatusBadge status={po.po_status} className="text-xs font-medium"  />
                                                            {/*{daysUntilDelivery !== null && po.po_status !== 'closed' && po.po_status !== 'cancelled' && (*/}
                                                            {/*    <Badge*/}
                                                            {/*        variant="outline"*/}
                                                            {/*        className={`${getDeliveryBadgeColor(daysUntilDelivery)} justify-center text-xs`}*/}
                                                            {/*    >*/}
                                                            {/*        <Calendar className="mr-1 h-3 w-3" />*/}
                                                            {/*        {daysUntilDelivery < 0*/}
                                                            {/*            ? `${Math.abs(daysUntilDelivery)}d overdue`*/}
                                                            {/*            : `${daysUntilDelivery}d until delivery`}*/}
                                                            {/*    </Badge>*/}
                                                            {/*)}*/}
                                                        </div>
                                                    </TableCell>

                                                    {/* Creator */}
                                                    <TableCell>
                                                        <div className="flex flex-col space-y-1 text-xs">
                                                            <div className="font-medium">{po.creator?.name}</div>
                                                            <div className="text-gray-500">{formatDate(po.created_at)}</div>
                                                        </div>
                                                    </TableCell>

                                                    {/* Actions */}
                                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex justify-end space-x-1">
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8"
                                                                            onClick={() => router.get(`/purchase-orders/${po.id}`)}
                                                                        >
                                                                            <Eye className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>View Details</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>

                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setSelectedPO(po);
                                                                                setEditOpen(true);
                                                                            }}
                                                                        >
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Edit PO</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>

                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                                        <span className="sr-only">Open menu</span>
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem>
                                                                        Download PDF
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        Print PO
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem className="text-red-600">
                                                                        Cancel PO
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <PaginationServerSide items={purchaseOrders} onChange={handlePageChange} />
                    </CardContent>
                </Card>

                <Suspense fallback={<DialogLoadingFallback message="Loading form..." />}>
                    <AddPurchaseOrderDialog
                        open={isCreateOpen}
                        onOpenChange={setCreateOpen}
                        vendors={filterOptions.vendors}
                        projects={filterOptions.projects}
                    />
                </Suspense>

                {selectedPO && (
                    <Suspense fallback={<DialogLoadingFallback message="Loading form..." />}>
                        <EditPurchaseOrderDialog
                            open={isEditOpen}
                            onOpenChange={setEditOpen}
                            purchaseOrder={selectedPO}
                            vendors={filterOptions.vendors}
                            projects={filterOptions.projects}
                        />
                    </Suspense>
                )}


            </div>
        </div>
    );
}
