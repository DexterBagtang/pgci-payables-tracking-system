import PaginationServerSide from '@/components/custom/Pagination.jsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
    Edit,
    Eye,
    FileText,
    Filter,
    FoldersIcon,
    Plus,
    Search,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const InvoicesTable = ({ invoices, filters, filterOptions }) => {
    const [searchValue, setSearchValue] = useState('');
    const [sortField, setSortField] = useState(filters.sort_field);
    const [sortDirection, setSortDirection] = useState(filters.sort_direction);
    const [vendor, setVendor] = useState(filters.vendor || 'all');
    const [project, setProject] = useState(filters.project || 'all');
    const [projectSearch, setProjectSearch] = useState('');
    const [vendorSearch, setVendorSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const invoiceStatuses = ['all','pending', 'received', 'under_review', 'approved', 'rejected', 'paid', 'overdue'];

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'processing':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock className="mr-1 h-3 w-3" />;
            case 'approved':
                return <CheckCircle2 className="mr-1 h-3 w-3" />;
            case 'processing':
                return <FileText className="mr-1 h-3 w-3" />;
            case 'rejected':
                return <AlertCircle className="mr-1 h-3 w-3" />;
            default:
                return <FileText className="mr-1 h-3 w-3" />;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Intl.DateTimeFormat('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(new Date(dateString));
    };

    const isOverdue = (dueDate, status) => {
        const today = new Date();
        const due = new Date(dueDate);
        return due < today && status !== 'approved';
    };

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
            if (!updatedFilters[key]) {
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
        handleFilterChange({ vendor: value, page: 1 });
    };

    const handleProjectChange = (value) => {
        setProject(value);
        setProjectSearch('');
        handleFilterChange({ project: value });
    };
    const handleStatusChange = (status) => {
        setStatusFilter(status);
        handleFilterChange({ status: status });
    };
    return (
        <div className="py-6">
            <div className="mx-auto sm:px-6 lg:px-8">
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>All Invoices</CardTitle>
                                <CardDescription>Manage and track all supplier invoices</CardDescription>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Link href="/invoices/create" prefetch>
                                    <Button size="sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        New Invoice
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-5">
                            {/* Search Input */}
                            <div className="relative md:col-span-2">
                                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by project title, CER, vendor name, PO number, SI number..."
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    className="w-full pl-8"
                                />
                            </div>

                            {/* Vendor Select */}
                            <Select value={vendor} onValueChange={handleVendorChange}>
                                <SelectTrigger className="">
                                    <SelectValue placeholder="Vendor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Search inside dropdown */}
                                    <div className="border-b p-2">
                                        <div className="relative">
                                            <Search className="absolute top-1/2 left-2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                                            <input
                                                type="text"
                                                placeholder="Search vendor..."
                                                value={vendorSearch}
                                                onChange={(e) => setVendorSearch(e.target.value)}
                                                className="h-8 w-full rounded-md border border-input bg-background px-7 text-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                                onClick={(e) => e.stopPropagation()}
                                                onKeyDown={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                    <SelectItem value="all">All Vendors</SelectItem>
                                    {filterOptions.vendors
                                        .filter((v) => v.name.toLowerCase().includes(vendorSearch.toLowerCase()))
                                        .map((v) => (
                                            <SelectItem key={v.id} value={v.id}>
                                                {v.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>

                            {/* Project Select */}
                            <Select value={project} onValueChange={handleProjectChange}>
                                <SelectTrigger className="w-full truncate">
                                    <SelectValue placeholder="Project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Search inside dropdown */}
                                    <div className="border-b p-2">
                                        <div className="relative">
                                            <Search className="absolute top-1/2 left-2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                                            <input
                                                type="text"
                                                placeholder="Search project..."
                                                value={projectSearch}
                                                onChange={(e) => setProjectSearch(e.target.value)}
                                                className="h-8 w-full rounded-md border border-input bg-background px-7 text-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                                onClick={(e) => e.stopPropagation()}
                                                onKeyDown={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                    <SelectItem value="all">All Projects</SelectItem>
                                    {filterOptions.projects
                                        .filter((p) => p.project_title.toLowerCase().includes(projectSearch.toLowerCase()))
                                        .map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.project_title}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>

                            {/* Filter Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="shrink-0">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Filter
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                    {invoiceStatuses.map((status) => (
                                        <DropdownMenuCheckboxItem
                                            key={status}
                                            checked={status === statusFilter}
                                            onClick={() => handleStatusChange(status)}
                                            className="capitalize"
                                        >
                                            {status.replace('_', ' ')}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort('si_number')}>
                                            Invoice & PO {getSortIcon('si_number')}
                                        </Button>
                                    </TableHead>
                                    <TableHead className="w-[260px]">Vendor & Project</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Amounts</TableHead>
                                    <TableHead>Payment & Submission</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort('created_at')}>
                                            Date Created {getSortIcon('created_at')}
                                        </Button>
                                    </TableHead>

                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.data.length > 0 ? (
                                    invoices.data.map((invoice) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{invoice.si_number}</span>
                                                    <span className="mt-1 text-sm text-gray-500">PO: {invoice.purchase_order.po_number}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center">
                                                        <Building2 className="mr-1 h-4 w-4 text-gray-500" />
                                                        <span className="font-medium">{invoice.purchase_order.vendor.name}</span>
                                                        <Badge variant="outline" className="ml-2 text-xs">
                                                            {invoice.purchase_order.vendor.category}
                                                        </Badge>
                                                    </div>
                                                    <div className="mt-1 text-sm">
                                                        <div>{invoice.purchase_order.project.project_title}</div>
                                                        <div className="text-gray-500">CER: {invoice.purchase_order.project.cer_number}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="w-[254px]">
                                                <div className="grid gap-x-2 gap-y-1 text-sm" style={{ gridTemplateColumns: 'auto 1fr' }}>
                                                    <span className="text-gray-500">Invoice:</span>
                                                    <span>{formatDate(invoice.si_date)}</span>

                                                    <span className="text-gray-500">Received:</span>
                                                    <span>{formatDate(invoice.si_received_at)}</span>

                                                    <span className="text-gray-500">Due:</span>
                                                    <span className={isOverdue(invoice.due_date, invoice.invoice_status) ? 'font-medium text-red-600' : ''}>
                                                {formatDate(invoice.due_date)}
                                                        {isOverdue(invoice.due_date, invoice.invoice_status) && (
                                                            <AlertCircle className="ml-1 inline h-3 w-3" />
                                                        )}
                                            </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span>{formatCurrency(invoice.invoice_amount)}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col space-y-1 text-sm">
                                                    <div>
                                                        <div className="text-gray-500">Date Submitted:</div>
                                                        <div>{invoice.submitted_at}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-gray-500">Submitted To:</div>
                                                        <div>{invoice.submitted_to}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <Badge className={`${getStatusColor(invoice.invoice_status)} justify-center capitalize`}>
                                                        {getStatusIcon(invoice.invoice_status)}
                                                        {invoice.invoice_status}
                                                    </Badge>
                                                    {isOverdue(invoice.due_date, invoice.invoice_status) && (
                                                        <Badge variant="destructive" className="mt-1 justify-center text-xs">
                                                            <AlertCircle className="mr-1 h-3 w-3" />
                                                            {differenceInDays(new Date(), invoice.due_date)}d Overdue
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>{formatDateTime(invoice.created_at, 'yyyy-MM-dd')}</div>
                                                <div>{formatDateTime(invoice.created_at, 'hh:mm a')}</div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Button variant="ghost" onClick={() => router.get(`invoices/${invoice.id}`)} size="icon">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => router.get(`/invoices/${invoice.id}/edit`)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="py-6 text-center text-gray-500">
                                            <div className="flex items-center justify-center gap-2">
                                                <FoldersIcon /> No invoices found.
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <PaginationServerSide items={invoices} onChange={handleFilterChange} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default InvoicesTable;
