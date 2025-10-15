import PaginationServerSide from '@/components/custom/Pagination.jsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const InvoicesTable = ({ invoices, filters, filterOptions, user }) => {
    console.log(invoices);
    const [searchValue, setSearchValue] = useState('');
    const [sortField, setSortField] = useState(filters.sort_field);
    const [sortDirection, setSortDirection] = useState(filters.sort_direction);
    const [vendor, setVendor] = useState(filters.vendor || 'all');
    const [project, setProject] = useState(filters.project || 'all');
    const [projectSearch, setProjectSearch] = useState('');
    const [vendorSearch, setVendorSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [activeTab, setActiveTab] = useState('all');

    const invoiceStatuses = ['all', 'pending', 'received', 'approved', 'rejected', 'pending_disbursement'];

    // SAP-like status configuration
    /*const getStatusConfig = (status) => {
        const configs = {
            pending: {
                color: 'bg-amber-50 text-amber-700 border-amber-200',
                icon: <Clock className="mr-1 h-3 w-3" />,
                label: 'Pending Review',
                sapCode: 'A',
            },
            received: {
                color: 'bg-blue-50 text-blue-700 border-blue-200',
                icon: <Receipt className="mr-1 h-3 w-3" />,
                label: 'Received',
                sapCode: 'B',
            },
            approved: {
                color: 'bg-green-50 text-green-700 border-green-200',
                icon: <CheckCircle2 className="mr-1 h-3 w-3" />,
                label: 'Approved',
                sapCode: 'C',
            },
            rejected: {
                color: 'bg-red-50 text-red-700 border-red-200',
                icon: <XCircle className="mr-1 h-3 w-3" />,
                label: 'Rejected',
                sapCode: 'D',
            },
            pending_disbursement: {
                color: 'bg-purple-50 text-purple-700 border-purple-200',
                icon: <DollarSign className="mr-1 h-3 w-3" />,
                label: 'Pending Disbursement',
                sapCode: 'E',
            },
        };
        return configs[status] || configs.pending;
    };*/

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

    // Calculate summary statistics
    const calculateSummary = () => {
        const data = invoices.data || [];
        return {
            total: data.length,
            totalAmount: data.reduce((sum, inv) => sum + parseFloat(inv.invoice_amount || 0), 0),
            pending: data.filter((inv) => inv.invoice_status === 'pending').length,
            approved: data.filter((inv) => inv.invoice_status === 'approved').length,
            pendingDisbursement: data.filter((inv) => inv.invoice_status === 'pending_disbursement').length,
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
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Total Invoices</p>
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
                                    <p className="text-xs font-medium text-gray-500">Total Amount</p>
                                    <p className="text-lg font-bold">{formatCurrency(summary.totalAmount)}</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Pending Review</p>
                                    <p className="text-2xl font-bold">{summary.pending}</p>
                                </div>
                                <Clock className="h-8 w-8 text-amber-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">For Disbursement</p>
                                    <p className="text-2xl font-bold">{summary.pendingDisbursement}</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Overdue</p>
                                    <p className="text-2xl font-bold">{summary.overdue}</p>
                                </div>
                                <AlertCircle className="h-8 w-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

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
                        {/* Status Tabs - SAP Style */}
                        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-4">
                            <TabsList className="grid w-full grid-cols-6">
                                <TabsTrigger value="all" className="text-xs">
                                    All ({summary.total})
                                </TabsTrigger>
                                <TabsTrigger value="pending" className="text-xs">
                                    Pending ({summary.pending})
                                </TabsTrigger>
                                <TabsTrigger value="received" className="text-xs">
                                    Received
                                </TabsTrigger>
                                <TabsTrigger value="approved" className="text-xs">
                                    Approved ({summary.approved})
                                </TabsTrigger>
                                <TabsTrigger value="pending_disbursement" className="text-xs">
                                    For Disbursement ({summary.pendingDisbursement})
                                </TabsTrigger>
                                <TabsTrigger value="rejected" className="text-xs">
                                    Rejected
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
