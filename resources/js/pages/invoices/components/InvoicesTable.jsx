import PaginationServerSide from '@/components/custom/Pagination.jsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link, router } from '@inertiajs/react';
import { differenceInDays, formatDate as formatDateTime } from 'date-fns';
import {
    AlertCircle,
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Building2,
    CheckCircle2,
    Clock,
    DollarSign,
    Download,
    Edit,
    Eye,
    FileCheck,
    FileText,
    Filter,
    FoldersIcon,
    Plus,
    Receipt,
    Search,
    TrendingUp,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import StatusBadge, { AgingBadge, OverdueBadge } from '@/components/custom/StatusBadge.jsx';
import InvoiceSummaryCards from './InvoiceSummaryCards.jsx';

const InvoicesTable = ({ invoices, filters, filterOptions, statusCounts, currentPageTotal }) => {
    const [searchValue, setSearchValue] = useState('');
    const [sortField, setSortField] = useState(filters.sort_field);
    const [sortDirection, setSortDirection] = useState(filters.sort_direction);
    const [vendor, setVendor] = useState(filters.vendor || 'all');
    const [project, setProject] = useState(filters.project || 'all');
    const [purchaseOrder, setPurchaseOrder] = useState(filters.purchase_order || 'all');
    const [projectSearch, setProjectSearch] = useState('');
    const [vendorSearch, setVendorSearch] = useState('');
    const [purchaseOrderSearch, setPurchaseOrderSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [activeTab, setActiveTab] = useState('all');

    const invoiceStatuses = ['all', 'pending', 'received', 'approved', 'rejected', 'pending_disbursement'];


    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Intl.DateTimeFormat('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(new Date(dateString));
    };

    const isOverdue = (dueDate, status) => {
        if (!dueDate) return false;
        const today = new Date();
        const due = new Date(dueDate);
        return due < today && status !== 'approved' && status !== 'pending_disbursement';
    };

    const calculateAgingDays = (receivedDate) => {
        if (!receivedDate) return 0;
        return differenceInDays(new Date(), new Date(receivedDate));
    };

    const getAgingBadgeColor = (days) => {
        if (days <= 7) return 'bg-green-50 text-green-700 border-green-200';
        if (days <= 14) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        if (days <= 30) return 'bg-orange-50 text-orange-700 border-orange-200';
        return 'bg-red-50 text-red-700 border-red-200';
    };

    // Calculate summary statistics using backend-provided counts
    const calculateSummary = () => {
        const data = invoices.data || [];
        return {
            total: statusCounts?.all || 0,
            totalAmount: currentPageTotal || 0, // Amount for current page only
            pending: statusCounts?.pending || 0,
            received: statusCounts?.received || 0,
            approved: statusCounts?.approved || 0,
            rejected: statusCounts?.rejected || 0,
            pendingDisbursement: statusCounts?.pending_disbursement || 0,
            overdue: data.filter((inv) => isOverdue(inv.due_date, inv.invoice_status)).length,
        };
    };

    const summary = calculateSummary();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchValue !== filters.search) {
                handleFilterChange({ search: searchValue, page: 1 });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchValue]);

    const handleFilterChange = (newFilters) => {
        const updatedFilters = {
            ...filters,
            ...newFilters,
        };

        // Remove empty filters
        Object.keys(updatedFilters).forEach((key) => {
            if (!updatedFilters[key] || updatedFilters[key] === 'all') {
                delete updatedFilters[key];
            }
        });

        router.get('/invoices', updatedFilters, {
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
            page: 1,
        });
    };

    const getSortIcon = (field) => {
        if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
        return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    };

    const handleVendorChange = (value) => {
        setVendor(value);
        setVendorSearch('');
        handleFilterChange({ vendor: value === 'all' ? null : value, page: 1 });
    };

    const handleProjectChange = (value) => {
        setProject(value);
        setProjectSearch('');
        handleFilterChange({ project: value === 'all' ? null : value, page: 1 });
    };

    const handlePurchaseOrderChange = (value) => {
        setPurchaseOrder(value);
        setPurchaseOrderSearch('');
        handleFilterChange({ purchase_order: value === 'all' ? null : value, page: 1 });
    };

    const handleStatusChange = (status) => {
        setStatusFilter(status);
        handleFilterChange({ status: status === 'all' ? null : status, page: 1 });
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        handleStatusChange(tab);
    };

    return (
        <div className="py-6">
            <div className="mx-auto sm:px-6 lg:px-8">
                {/* Summary Cards - SAP Dashboard Style */}
                <InvoiceSummaryCards summary={summary} formatCurrency={formatCurrency} />

                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-xl">Invoice Management</CardTitle>
                                <CardDescription>AP Invoice Processing & Tracking System</CardDescription>
                            </div>
                            <div className="flex items-center space-x-3">
                                {/*<Button variant="outline" size="sm">*/}
                                {/*    <Download className="mr-2 h-4 w-4" />*/}
                                {/*    Export*/}
                                {/*</Button>*/}
                                <Link href="/invoices/create" prefetch>
                                    <Button size="sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Invoice
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {/* Modern Status Filter Pills */}
                        <div className="mb-6 space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {[
                                    {
                                        value: 'all',
                                        label: 'All Invoices',
                                        icon: FileText,
                                        activeClasses: 'border-blue-500 bg-blue-50 shadow-sm',
                                        iconActiveClasses: 'text-blue-600',
                                        textActiveClasses: 'text-blue-700',
                                        indicatorClasses: 'bg-blue-500'
                                    },
                                    {
                                        value: 'pending',
                                        label: 'Pending',
                                        icon: Clock,
                                        activeClasses: 'border-amber-500 bg-amber-50 shadow-sm',
                                        iconActiveClasses: 'text-amber-600',
                                        textActiveClasses: 'text-amber-700',
                                        indicatorClasses: 'bg-amber-500'
                                    },
                                    {
                                        value: 'received',
                                        label: 'Received',
                                        icon: Receipt,
                                        activeClasses: 'border-sky-500 bg-sky-50 shadow-sm',
                                        iconActiveClasses: 'text-sky-600',
                                        textActiveClasses: 'text-sky-700',
                                        indicatorClasses: 'bg-sky-500'
                                    },
                                    {
                                        value: 'approved',
                                        label: 'Approved',
                                        icon: CheckCircle2,
                                        activeClasses: 'border-green-500 bg-green-50 shadow-sm',
                                        iconActiveClasses: 'text-green-600',
                                        textActiveClasses: 'text-green-700',
                                        indicatorClasses: 'bg-green-500'
                                    },
                                    {
                                        value: 'pending_disbursement',
                                        label: 'For Disbursement',
                                        icon: DollarSign,
                                        activeClasses: 'border-purple-500 bg-purple-50 shadow-sm',
                                        iconActiveClasses: 'text-purple-600',
                                        textActiveClasses: 'text-purple-700',
                                        indicatorClasses: 'bg-purple-500'
                                    },
                                    {
                                        value: 'rejected',
                                        label: 'Rejected',
                                        icon: XCircle,
                                        activeClasses: 'border-red-500 bg-red-50 shadow-sm',
                                        iconActiveClasses: 'text-red-600',
                                        textActiveClasses: 'text-red-700',
                                        indicatorClasses: 'bg-red-500'
                                    },
                                ].map((status) => {
                                    const Icon = status.icon;
                                    const isActive = activeTab === status.value;

                                    return (
                                        <button
                                            key={status.value}
                                            onClick={() => handleTabChange(status.value)}
                                            className={`
                                                group relative flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 transition-all duration-200
                                                ${isActive
                                                    ? status.activeClasses
                                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                                }
                                            `}
                                        >
                                            <Icon className={`h-4 w-4 transition-colors ${
                                                isActive ? status.iconActiveClasses : 'text-gray-500 group-hover:text-gray-700'
                                            }`} />
                                            <span className={`text-sm font-medium transition-colors ${
                                                isActive ? status.textActiveClasses : 'text-gray-700 group-hover:text-gray-900'
                                            }`}>
                                                {status.label}
                                            </span>
                                            {isActive && (
                                                <div className={`absolute -bottom-2 left-1/2 h-1 w-3/4 -translate-x-1/2 rounded-full ${status.indicatorClasses}`} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Active Filters Indicator */}
                        {(searchValue || vendor !== 'all' || project !== 'all' || purchaseOrder !== 'all' || statusFilter !== 'all') && (
                            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                                    <Filter className="h-4 w-4" />
                                    Active Filters:
                                </div>
                                {searchValue && (
                                    <Badge variant="secondary" className="bg-white border border-blue-200">
                                        <Search className="mr-1 h-3 w-3" />
                                        Search: {searchValue}
                                        <button
                                            onClick={() => setSearchValue('')}
                                            className="ml-1.5 rounded-full hover:bg-gray-200"
                                        >
                                            <XCircle className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )}
                                {vendor !== 'all' && (
                                    <Badge variant="secondary" className="bg-white border border-blue-200">
                                        <Building2 className="mr-1 h-3 w-3" />
                                        Vendor: {filterOptions.vendors.find(v => v.id.toString() === vendor)?.name}
                                        <button
                                            onClick={() => handleVendorChange('all')}
                                            className="ml-1.5 rounded-full hover:bg-gray-200"
                                        >
                                            <XCircle className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )}
                                {project !== 'all' && (
                                    <Badge variant="secondary" className="bg-white border border-blue-200">
                                        <FoldersIcon className="mr-1 h-3 w-3" />
                                        Project: {filterOptions.projects.find(p => p.id.toString() === project)?.project_title}
                                        <button
                                            onClick={() => handleProjectChange('all')}
                                            className="ml-1.5 rounded-full hover:bg-gray-200"
                                        >
                                            <XCircle className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )}
                                {purchaseOrder !== 'all' && (
                                    <Badge variant="secondary" className="bg-white border border-blue-200">
                                        <FileText className="mr-1 h-3 w-3" />
                                        PO: {filterOptions.purchaseOrders.find(po => po.id.toString() === purchaseOrder)?.po_number}
                                        <button
                                            onClick={() => handlePurchaseOrderChange('all')}
                                            className="ml-1.5 rounded-full hover:bg-gray-200"
                                        >
                                            <XCircle className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )}
                                {statusFilter !== 'all' && (
                                    <Badge variant="secondary" className="bg-white border border-blue-200">
                                        <Filter className="mr-1 h-3 w-3" />
                                        Status: {statusFilter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        <button
                                            onClick={() => handleStatusChange('all')}
                                            className="ml-1.5 rounded-full hover:bg-gray-200"
                                        >
                                            <XCircle className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )}
                                <button
                                    onClick={() => {
                                        // Make a single navigation request with only sort params preserved
                                        // Don't use preserveState so component fully resets
                                        router.get('/invoices', {
                                            sort_field: sortField,
                                            sort_direction: sortDirection,
                                        }, {
                                            preserveScroll: true,
                                        });
                                    }}
                                    className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        )}

                        {/* Filters */}
                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search invoice number, PO, vendor, project..."
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    className="w-full pl-8"
                                />
                            </div>

                            {/* Vendor Select */}
                            <Select value={vendor} onValueChange={handleVendorChange}>
                                <SelectTrigger>
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
                                                className="h-8 w-full rounded-md border border-input bg-background px-7 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                onClick={(e) => e.stopPropagation()}
                                                onKeyDown={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                    <SelectItem value="all">All Vendors</SelectItem>
                                    {filterOptions.vendors
                                        .filter((v) => v.name.toLowerCase().includes(vendorSearch.toLowerCase()))
                                        .map((v) => (
                                            <SelectItem key={v.id} value={v.id.toString()}>
                                                {v.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>

                            {/* Purchase Order Select */}
                            <Select value={purchaseOrder} onValueChange={handlePurchaseOrderChange}>
                                <SelectTrigger className="w-full truncate">
                                    <SelectValue placeholder="All Purchase Orders" />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="border-b p-2">
                                        <div className="relative">
                                            <Search className="absolute top-1/2 left-2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                                            <input
                                                type="text"
                                                placeholder="Search PO..."
                                                value={purchaseOrderSearch}
                                                onChange={(e) => setPurchaseOrderSearch(e.target.value)}
                                                className="h-8 w-full rounded-md border border-input bg-background px-7 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                onClick={(e) => e.stopPropagation()}
                                                onKeyDown={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                    <SelectItem value="all">All Purchase Orders</SelectItem>
                                    {filterOptions.purchaseOrders
                                        .filter((po) => po.po_number.toLowerCase().includes(purchaseOrderSearch.toLowerCase()))
                                        .map((po) => (
                                            <SelectItem key={po.id} value={po.id.toString()}>
                                                <div className="flex items-center gap-2">
                                                    <span>{po.po_number}</span>
                                                    {po.vendor && (
                                                        <span className="text-xs text-muted-foreground">({po.vendor.name})</span>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>

                            {/* Project Select */}
                            <Select value={project} onValueChange={handleProjectChange}>
                                <SelectTrigger className="w-full truncate">
                                    <SelectValue placeholder="All Projects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="border-b p-2">
                                        <div className="relative">
                                            <Search className="absolute top-1/2 left-2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
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
                                        .filter((p) => p.project_title.toLowerCase().includes(projectSearch.toLowerCase()))
                                        .map((p) => (
                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                {p.project_title}
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
                                            <Button variant="ghost" size="sm" onClick={() => handleSort('si_number')} className="h-8">
                                                Document No. {getSortIcon('si_number')}
                                            </Button>
                                        </TableHead>
                                        <TableHead className="font-semibold">Vendor Details</TableHead>
                                        <TableHead className="font-semibold">
                                            <Button variant="ghost" size="sm" onClick={() => handleSort('invoice_amount')} className="h-8">
                                                Amount {getSortIcon('invoice_amount')}
                                            </Button>
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            <Button variant="ghost" size="sm" onClick={() => handleSort('due_date')} className="h-8">
                                                Payment Terms {getSortIcon('due_date')}
                                            </Button>
                                        </TableHead>
                                        <TableHead className="font-semibold">Status & Aging</TableHead>
                                        <TableHead className="font-semibold">Accounting Info</TableHead>
                                        <TableHead className="text-right font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.data.length > 0 ? (
                                        invoices.data.map((invoice) => {
                                            // const statusConfig = getStatusConfig(invoice.invoice_status);
                                            const agingDays = calculateAgingDays(invoice.si_received_at);
                                            const overdueFlag = isOverdue(invoice.due_date, invoice.invoice_status);

                                            return (
                                                <TableRow key={invoice.id} className="hover:bg-slate-50">
                                                    {/* Document Numbers */}
                                                    <TableCell className="font-medium">
                                                        <div className="flex flex-col space-y-1">
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="flex items-center">
                                                                            <FileText className="mr-2 h-4 w-4 text-blue-600" />
                                                                            <span className="font-semibold text-blue-600">{invoice.si_number}</span>
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Sales Invoice Number</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                            <div className="text-xs text-gray-500">
                                                                <span className="font-medium">PO:</span> {invoice.purchase_order.po_number}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                <span className="font-medium">Date:</span> {formatDate(invoice.si_date)}
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    {/* Vendor & Project */}
                                                    <TableCell>
                                                        <div className="flex flex-col space-y-1">
                                                            <div className="flex items-center">
                                                                <Building2 className="mr-1 h-4 w-4 text-gray-500" />
                                                                <span className="font-medium text-sm mr-1">{invoice.purchase_order.vendor.name}</span>
                                                                <StatusBadge
                                                                    status={invoice.purchase_order.vendor.category}
                                                                    showIcon={false}
                                                                    size="xs"
                                                                    variant="outline"
                                                                />
                                                            </div>
                                                            {/*<Badge variant="outline" className="w-fit text-xs">*/}
                                                            {/*    {invoice.purchase_order.vendor.category}*/}
                                                            {/*</Badge>*/}
                                                            <div className="mt-1 text-xs text-gray-600">
                                                                {invoice.purchase_order.project.project_title}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                CER: {invoice.purchase_order.project.cer_number}
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    {/* Amount */}
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="text-lg font-bold text-green-700">
                                                                {formatCurrency(invoice.invoice_amount)}
                                                            </span>
                                                            <span className="text-xs text-gray-500">Invoice Amount</span>
                                                        </div>
                                                    </TableCell>

                                                    {/* Payment Terms & Due Date */}
                                                    <TableCell>
                                                        <div className="flex flex-col space-y-1 text-sm">
                                                            <div>
                                                                <span className="text-xs text-gray-500">Due Date:</span>
                                                                <div className={`font-medium ${overdueFlag ? 'text-red-600' : 'text-gray-900'}`}>
                                                                    {formatDate(invoice.due_date)}
                                                                    {overdueFlag && <AlertCircle className="ml-1 inline h-3 w-3" />}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span className="text-xs text-gray-500">Received:</span>
                                                                <div className="text-xs">{formatDate(invoice.si_received_at)}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    {/* Status & Aging */}
                                                    {/*<TableCell>*/}
                                                    {/*    <div className="flex flex-col space-y-2">*/}
                                                    {/*        <Badge className={`${statusConfig.color} justify-center text-xs font-medium`}>*/}
                                                    {/*            {statusConfig.icon}*/}
                                                    {/*            {statusConfig.label}*/}
                                                    {/*        </Badge>*/}
                                                    {/*        <Badge variant="outline" className={`${getAgingBadgeColor(agingDays)} justify-center text-xs`}>*/}
                                                    {/*            <Clock className="mr-1 h-3 w-3" />*/}
                                                    {/*            {agingDays}d aging*/}
                                                    {/*        </Badge>*/}
                                                    {/*        {overdueFlag && (*/}
                                                    {/*            <Badge variant="destructive" className="justify-center text-xs">*/}
                                                    {/*                <AlertCircle className="mr-1 h-3 w-3" />*/}
                                                    {/*                {differenceInDays(new Date(), new Date(invoice.due_date))}d overdue*/}
                                                    {/*            </Badge>*/}
                                                    {/*        )}*/}
                                                    {/*    </div>*/}
                                                    {/*</TableCell>*/}
                                                    <TableCell>
                                                        <div className="flex flex-col space-y-2">
                                                            {/* Basic Usage */}
                                                            <StatusBadge
                                                                status={invoice.invoice_status}
                                                                showIcon
                                                                size="default"
                                                            />

                                                            {/* Aging Badge */}
                                                            <AgingBadge
                                                                days={agingDays}
                                                                size="sm"
                                                            />

                                                            {/* Overdue Badge */}
                                                            {overdueFlag && (
                                                                <OverdueBadge
                                                                    daysOverdue={differenceInDays(new Date(), new Date(invoice.due_date))}
                                                                    size="sm"
                                                                />
                                                            )}
                                                        </div>
                                                    </TableCell>

                                                    {/* Accounting/Submission Info */}
                                                    <TableCell>
                                                        <div className="flex flex-col space-y-1 text-xs">
                                                            {invoice.submitted_at && (
                                                                <div>
                                                                    <span className="text-gray-500">Submitted:</span>
                                                                    <div className="font-medium">{formatDate(invoice.submitted_at)}</div>
                                                                </div>
                                                            )}
                                                            {invoice.submitted_to && (
                                                                <div>
                                                                    <span className="text-gray-500">To:</span>
                                                                    <div className="font-medium">{invoice.submitted_to}</div>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <span className="text-gray-500">Created:</span>
                                                                <div>{formatDateTime(invoice.created_at, 'yyyy-MM-dd HH:mm')}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    {/* Actions */}
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end space-x-1">
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8"
                                                                            onClick={() => router.get(`invoices/${invoice.id}`)}
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
                                                                            onClick={() => router.get(`/invoices/${invoice.id}/edit`)}
                                                                        >
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Edit Invoice</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>

                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                            <FileCheck className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Process Invoice</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="py-12 text-center">
                                                <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                                                    <FoldersIcon className="h-12 w-12" />
                                                    <p className="text-sm font-medium">No invoices found</p>
                                                    <p className="text-xs">Try adjusting your filters or search criteria</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <PaginationServerSide items={invoices} onChange={handleFilterChange} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default InvoicesTable;
