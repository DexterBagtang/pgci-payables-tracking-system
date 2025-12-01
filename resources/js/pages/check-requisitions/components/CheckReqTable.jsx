import React, { useState, useEffect, useRef } from 'react';
import { Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Combobox } from '@/components/ui/combobox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Plus,
    Search,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    X,
    ExternalLink,
    FileText,
    Calendar,
    DollarSign,
    Filter,
    CheckCircle2,
    XCircle,
    Clock,
    TrendingUp,
    Eye,
    AlertCircle,
    Download,
    Briefcase
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import StatusBadge from '@/components/custom/StatusBadge.jsx';
import PaginationServerSide from '@/components/custom/Pagination.jsx';

export default function CheckReqTable({ checkRequisitions, filters, filterOptions, statistics }) {
    const { data } = checkRequisitions;
    const [localFilters, setLocalFilters] = useState({
        search: filters.search || '',
        status: filters.status || 'all',
        purchase_order: filters.purchase_order || 'all',
    });
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc');
    const [activeTab, setActiveTab] = useState(filters.status || 'all');

    const isInitialMount = useRef(true);

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
            sort_by: sortBy,
            sort_order: sortOrder,
            page: 1
        };

        // Remove empty filters
        Object.keys(updatedFilters).forEach(key => {
            if (!updatedFilters[key] || updatedFilters[key] === 'all') {
                delete updatedFilters[key];
            }
        });

        router.get('/check-requisitions', updatedFilters, {
            preserveState: true,
            replace: true,
            only: ['checkRequisitions', 'filters'],
        });
    };

    const handleSort = (column) => {
        let newOrder = 'desc';
        if (sortBy === column) {
            newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        }

        setSortBy(column);
        setSortOrder(newOrder);

        updateFilters({
            ...localFilters,
            sort_by: column,
            sort_order: newOrder,
        });
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        handleFilterChange('status', tab);
    };

    const handlePageChange = ({ page }) => {
        const params = {
            ...localFilters,
            sort_by: sortBy,
            sort_order: sortOrder,
            page: page,
        };

        // Remove empty filters
        Object.keys(params).forEach(key => {
            if (!params[key] || params[key] === 'all') {
                delete params[key];
            }
        });

        router.get('/check-requisitions', params, {
            preserveState: true,
            replace: true,
            only: ['checkRequisitions', 'filters'],
        });
    };

    const getSortIcon = (field) => {
        if (sortBy !== field) return <ArrowUpDown className="h-4 w-4" />;
        return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
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

    return (
        <div className="py-6">
            <div className="mx-auto sm:px-6 lg:px-8">
                {/* Summary Cards - SAP Dashboard Style */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {/* Total Requisitions */}
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Total Requisitions</p>
                                    <p className="text-2xl font-bold">{statistics?.total || 0}</p>
                                </div>
                                <FileText className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Value */}
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Total Value</p>
                                    <p className="text-lg font-bold">{formatCurrency(statistics?.total_value || 0)}</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending */}
                    <Card className="border-l-4 border-l-yellow-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Pending</p>
                                    <p className="text-2xl font-bold">{statistics?.pending || 0}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(statistics?.pending_value || 0)}</p>
                                </div>
                                <Clock className="h-8 w-8 text-yellow-500" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Approved */}
                    <Card className="border-l-4 border-l-emerald-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Approved</p>
                                    <p className="text-2xl font-bold">{statistics?.approved || 0}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(statistics?.approved_value || 0)}</p>
                                </div>
                                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Rejected */}
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Rejected</p>
                                    <p className="text-2xl font-bold">{statistics?.rejected || 0}</p>
                                </div>
                                <XCircle className="h-8 w-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Available Invoices */}
                    <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Available Invoices</p>
                                    <p className="text-2xl font-bold">{statistics?.available_invoices || 0}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(statistics?.available_invoices_value || 0)}</p>
                                </div>
                                <FileText className="h-8 w-8 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-xl">Check Requisition Management</CardTitle>
                                <CardDescription>Payment Request Tracking System</CardDescription>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Button variant="outline" size="sm">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                                <Link href="/check-requisitions/create">
                                    <Button size="sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        New Requisition
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {/* Modern Status Pills Navigation */}
                        <div className="mb-6 space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {[
                                    {
                                        value: 'all',
                                        label: `All Requisitions`,
                                        icon: FileText,
                                        activeClasses: 'border-blue-500 bg-blue-50 shadow-sm',
                                        iconActiveClasses: 'text-blue-600',
                                        textActiveClasses: 'text-blue-700',
                                        indicatorClasses: 'bg-blue-500'
                                    },
                                    {
                                        value: 'pending_approval',
                                        label: `Pending`,
                                        icon: Clock,
                                        activeClasses: 'border-yellow-500 bg-yellow-50 shadow-sm',
                                        iconActiveClasses: 'text-yellow-600',
                                        textActiveClasses: 'text-yellow-700',
                                        indicatorClasses: 'bg-yellow-500'
                                    },
                                    {
                                        value: 'approved',
                                        label: `Approved`,
                                        icon: CheckCircle2,
                                        activeClasses: 'border-green-500 bg-green-50 shadow-sm',
                                        iconActiveClasses: 'text-green-600',
                                        textActiveClasses: 'text-green-700',
                                        indicatorClasses: 'bg-green-500'
                                    },
                                    {
                                        value: 'rejected',
                                        label: `Rejected`,
                                        icon: XCircle,
                                        activeClasses: 'border-red-500 bg-red-50 shadow-sm',
                                        iconActiveClasses: 'text-red-600',
                                        textActiveClasses: 'text-red-700',
                                        indicatorClasses: 'bg-red-500'
                                    },
                                ].map((statusTab) => {
                                    const Icon = statusTab.icon;
                                    const isActive = activeTab === statusTab.value;

                                    return (
                                        <button
                                            key={statusTab.value}
                                            onClick={() => handleTabChange(statusTab.value)}
                                            className={`
                                                group relative flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 transition-all duration-200
                                                ${isActive
                                                    ? statusTab.activeClasses
                                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                                }
                                            `}
                                        >
                                            <Icon className={`h-4 w-4 transition-colors ${
                                                isActive ? statusTab.iconActiveClasses : 'text-gray-500 group-hover:text-gray-700'
                                            }`} />
                                            <span className={`text-sm font-medium transition-colors ${
                                                isActive ? statusTab.textActiveClasses : 'text-gray-700 group-hover:text-gray-900'
                                            }`}>
                                                {statusTab.label}
                                            </span>
                                            {isActive && (
                                                <div className={`absolute -bottom-2 left-1/2 h-1 w-3/4 -translate-x-1/2 rounded-full ${statusTab.indicatorClasses}`} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Active Filters Indicator */}
                        {(localFilters.search || localFilters.purchase_order !== 'all') && (
                            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                                    <AlertCircle className="h-4 w-4" />
                                    Active Filters:
                                </div>
                                {localFilters.search && (
                                    <Badge variant="secondary" className="bg-white border border-blue-200">
                                        <Search className="mr-1 h-3 w-3" />
                                        Search: {localFilters.search}
                                        <button
                                            onClick={() => handleFilterChange('search', '')}
                                            className="ml-1.5 rounded-full hover:bg-gray-200"
                                        >
                                            <XCircle className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )}
                                {localFilters.purchase_order !== 'all' && (
                                    <Badge variant="secondary" className="bg-white border border-blue-200">
                                        <Briefcase className="mr-1 h-3 w-3" />
                                        PO: {localFilters.purchase_order}
                                        <button
                                            onClick={() => handleFilterChange('purchase_order', 'all')}
                                            className="ml-1.5 rounded-full hover:bg-gray-200"
                                        >
                                            <XCircle className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )}
                                <button
                                    onClick={() => {
                                        handleFilterChange('search', '');
                                        handleFilterChange('purchase_order', 'all');
                                    }}
                                    className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        )}

                        {/* Filters */}
                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                            {/* Search Input */}
                            <div className="relative md:col-span-2">
                                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by requisition #, payee, PO, CER, or SI..."
                                    className="pl-8"
                                    value={localFilters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                />
                            </div>

                            {/* Purchase Order Combobox */}
                            <Combobox
                                value={localFilters.purchase_order === 'all' || !localFilters.purchase_order ? '' : localFilters.purchase_order}
                                onValueChange={(value) => handleFilterChange('purchase_order', value === '' ? 'all' : value)}
                                placeholder="All Purchase Orders"
                                searchPlaceholder="Search PO..."
                                emptyMessage="No purchase orders found."
                                options={[
                                    { value: 'all', label: 'All Purchase Orders' },
                                    ...(filterOptions?.purchaseOrders?.map((po) => ({
                                        value: po.po_number,
                                        label: `${po.po_number}${po.vendor?.name ? ' - ' + po.vendor.name : ''}`
                                    })) || [])
                                ]}
                            />
                        </div>

                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead className="font-semibold">
                                            <Button variant="ghost" size="sm" onClick={() => handleSort('requisition_number')} className="h-8">
                                                Requisition # {getSortIcon('requisition_number')}
                                            </Button>
                                        </TableHead>
                                        <TableHead className="font-semibold">Payee Details</TableHead>
                                        <TableHead className="font-semibold">
                                            <Button variant="ghost" size="sm" onClick={() => handleSort('php_amount')} className="h-8">
                                                Amount {getSortIcon('php_amount')}
                                            </Button>
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            <Button variant="ghost" size="sm" onClick={() => handleSort('request_date')} className="h-8">
                                                Request Date {getSortIcon('request_date')}
                                            </Button>
                                        </TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="font-semibold">References</TableHead>
                                        <TableHead className="text-right font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="py-12 text-center">
                                                <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                                                    <FileText className="h-12 w-12" />
                                                    <p className="text-sm font-medium">No check requisitions found</p>
                                                    <p className="text-xs">Try adjusting your filters or search criteria</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        data.map((requisition) => (
                                            <TableRow
                                                key={requisition.id}
                                                onClick={() => router.get(`/check-requisitions/${requisition.id}`)}
                                                className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                            >
                                                {/* Requisition Number */}
                                                <TableCell className="font-medium">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className="flex items-center">
                                                                    <FileText className="mr-2 h-4 w-4 text-blue-600" />
                                                                    <span className="font-semibold text-blue-600">{requisition.requisition_number}</span>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Check Requisition Number</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </TableCell>

                                                {/* Payee */}
                                                <TableCell>
                                                    <div className="flex flex-col space-y-1">
                                                        <span className="font-medium text-sm line-clamp-1" title={requisition.payee_name}>
                                                            {requisition.payee_name}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* Amount */}
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-lg font-bold text-green-700">
                                                            {formatCurrency(requisition.php_amount)}
                                                        </span>
                                                        <span className="text-xs text-gray-500">Payment Amount</span>
                                                    </div>
                                                </TableCell>

                                                {/* Request Date */}
                                                <TableCell>
                                                    <div className="flex items-center text-sm">
                                                        <Calendar className="mr-1 h-4 w-4 text-gray-400" />
                                                        <span className="font-medium">{formatDate(requisition.request_date)}</span>
                                                    </div>
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell>
                                                    <StatusBadge status={requisition.requisition_status} className="text-xs font-medium" />
                                                </TableCell>

                                                {/* References */}
                                                <TableCell>
                                                    <div className="text-xs space-y-1">
                                                        {requisition.po_number && (
                                                            <div className="flex items-center gap-1.5">
                                                                <Badge variant="outline" className="text-xs px-1.5 py-0">PO</Badge>
                                                                <span className="text-gray-700">{requisition.po_number}</span>
                                                            </div>
                                                        )}
                                                        {requisition.cer_number && (
                                                            <div className="flex items-center gap-1.5">
                                                                <Badge variant="outline" className="text-xs px-1.5 py-0">CER</Badge>
                                                                <span className="text-gray-700">{requisition.cer_number}</span>
                                                            </div>
                                                        )}
                                                        {requisition.si_number && (
                                                            <div className="flex items-center gap-1.5">
                                                                <Badge variant="outline" className="text-xs px-1.5 py-0">SI</Badge>
                                                                <span className="text-gray-700">{requisition.si_number}</span>
                                                            </div>
                                                        )}
                                                        {!requisition.po_number && !requisition.cer_number && !requisition.si_number && (
                                                            <span className="text-gray-400 italic">—</span>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* Actions */}
                                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => router.get(`/check-requisitions/${requisition.id}`)}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>View Details</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <PaginationServerSide items={checkRequisitions} onChange={handlePageChange} />

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
