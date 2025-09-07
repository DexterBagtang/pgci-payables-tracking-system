import React, {useEffect, useState} from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {Badge} from '@/components/ui/badge';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {
    Calendar,
    FileText,
    DollarSign,
    Building2,
    Clock,
    AlertCircle,
    CheckCircle2,
    Eye,
    Edit,
    ChevronDown,
    ChevronUp,
    Filter, ArrowUpDown, ArrowUp, ArrowDown, Plus, Search, FoldersIcon
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Input} from "@/components/ui/input";
import {Link, router} from '@inertiajs/react'
import {differenceInDays, formatDate as formatDateTime} from "date-fns";
import PaginationServerSide from "@/components/custom/Pagination.jsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.js";

const InvoicesTable = ({invoices, filters, filterOptions}) => {
    const [searchValue, setSearchValue] = useState('');
    const [sortField, setSortField] = useState(filters.sort_field);
    const [sortDirection, setSortDirection] = useState(filters.sort_direction);
    const [vendor, setVendor] = useState(filters.vendor || 'all');
    const [project, setProject] = useState(filters.project || 'all');
    const [projectSearch, setProjectSearch] = useState('');
    const [vendorSearch, setVendorSearch] = useState('');
    const [statusFilter,setStatusFilter] = useState('')

    const invoiceStatuses = ['all','received', 'under_review', 'approved', 'rejected', 'paid', 'overdue']

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
                return <Clock className="w-3 h-3 mr-1"/>;
            case 'approved':
                return <CheckCircle2 className="w-3 h-3 mr-1"/>;
            case 'processing':
                return <FileText className="w-3 h-3 mr-1"/>;
            case 'rejected':
                return <AlertCircle className="w-3 h-3 mr-1"/>;
            default:
                return <FileText className="w-3 h-3 mr-1"/>;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Intl.DateTimeFormat('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
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
                handleFilterChange({search: searchValue, page: 1});
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchValue]);

    const handleFilterChange = (newFilters) => {
        const updatedFilters = {
            ...filters,
            ...newFilters
        }

        // Remove empty filters
        Object.keys(updatedFilters).forEach(key => {
            if (!updatedFilters[key]) {
                delete updatedFilters[key];
            }
        });

        router.get('/invoices', updatedFilters, {
            preserveState: true,
            preserveScroll: true,
        })
    }

    const handleSort = (field) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';

        setSortField(field);
        setSortDirection(newDirection);

        handleFilterChange({
            sort_field: field,
            sort_direction: newDirection,
            page: 1
        });
    }

    const getSortIcon = (field) => {
        if (sortField !== field) return <ArrowUpDown className="h-4 w-4"/>;
        return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4"/> : <ArrowDown className="h-4 w-4"/>;
    };

    const handleVendorChange = (value) => {
        setVendor(value);
        setVendorSearch('');
        handleFilterChange({vendor: value, page: 1});
    };

    const handleProjectChange = (value) => {
        setProject(value);
        setProjectSearch('');
        handleFilterChange({project: value});
    };
    const handleStatusChange = (status) => {
        setStatusFilter(status)
        handleFilterChange({status: status});
    };
    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
                    <p className="text-gray-600 mt-1">Manage and track all supplier invoices</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Link href="/invoices/create" prefetch>
                        <Button size="sm">
                            <Plus className="w-4 h-4 mr-2"/>
                            New Invoice
                        </Button>
                    </Link>

                </div>
            </div>

            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="text-lg">All Invoices</CardTitle>

                        <div className="flex flex-col gap-3 md:flex-row md:items-center">
                            {/* Search Input */}
                            <div className="relative md:col-span-2">
                                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground"/>
                                <Input
                                    type="search"
                                    placeholder="Search by project title, CER, vendor name, PO number, SI number..."
                                    value={searchValue}
                                    onChange={e => setSearchValue(e.target.value)}
                                    className="pl-8 w-full"
                                />
                            </div>

                            {/* Vendor Select */}
                            <Select value={vendor} onValueChange={handleVendorChange}>
                                <SelectTrigger className="w-full md:w-44">
                                    <SelectValue placeholder="Vendor"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Search inside dropdown */}
                                    <div className="p-2 border-b">
                                        <div className="relative">
                                            <Search
                                                className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground"/>
                                            <input
                                                type="text"
                                                placeholder="Search vendor..."
                                                value={vendorSearch}
                                                onChange={(e) => setVendorSearch(e.target.value)}
                                                className="h-8 w-full rounded-md border border-input bg-background px-7 text-xs
                  placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-ring focus-visible:ring-offset-2"
                                                onClick={(e) => e.stopPropagation()}
                                                onKeyDown={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                    <SelectItem value="all">All Vendors</SelectItem>
                                    {filterOptions.vendors
                                        .filter(v => v.name.toLowerCase().includes(vendorSearch.toLowerCase()))
                                        .map(v => (
                                            <SelectItem key={v.id} value={v.id}>
                                                {v.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>

                            {/* Project Select */}
                            <Select value={project} onValueChange={handleProjectChange}>
                                <SelectTrigger className="w-full md:w-44 truncate">
                                    <SelectValue placeholder="Project"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Search inside dropdown */}
                                    <div className="p-2 border-b">
                                        <div className="relative">
                                            <Search
                                                className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground"/>
                                            <input
                                                type="text"
                                                placeholder="Search project..."
                                                value={projectSearch}
                                                onChange={(e) => setProjectSearch(e.target.value)}
                                                className="h-8 w-full rounded-md border border-input bg-background px-7 text-xs
                  placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-ring focus-visible:ring-offset-2"
                                                onClick={(e) => e.stopPropagation()}
                                                onKeyDown={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                    <SelectItem value="all">All Projects</SelectItem>
                                    {filterOptions.projects
                                        .filter(p => p.project_title.toLowerCase().includes(projectSearch.toLowerCase()))
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
                                        <Filter className="w-4 h-4 mr-2"/>
                                        Filter
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                    {invoiceStatuses.map((status) =>
                                        <DropdownMenuCheckboxItem
                                            key={status}
                                            checked={status === statusFilter}
                                            onClick={() => handleStatusChange(status)}
                                            className="capitalize"
                                        >
                                            {status.replace('_',' ')}
                                        </DropdownMenuCheckboxItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>


                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort('si_number')}
                                    >
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
                                                <span className="text-sm text-gray-500 mt-1">
                                                PO: {invoice.purchase_order.po_number}
                                              </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <div className="flex items-center">
                                                    <Building2 className="w-4 h-4 mr-1 text-gray-500"/>
                                                    <span
                                                        className="font-medium">{invoice.purchase_order.vendor.name}</span>
                                                    <Badge variant="outline" className="ml-2 text-xs">
                                                        {invoice.purchase_order.vendor.category}
                                                    </Badge>
                                                </div>
                                                <div className="mt-1 text-sm">
                                                    <div>{invoice.purchase_order.project.project_title}</div>
                                                    <div
                                                        className="text-gray-500">CER: {invoice.purchase_order.project.cer_number}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="w-[254px]">
                                            <div className="grid text-sm gap-x-2 gap-y-1"
                                                 style={{gridTemplateColumns: "auto 1fr"}}>
                                                <span className="text-gray-500">Invoice:</span>
                                                <span>{formatDate(invoice.si_date)}</span>

                                                <span className="text-gray-500">Received:</span>
                                                <span>{formatDate(invoice.received_date)}</span>

                                                <span className="text-gray-500">Due:</span>
                                                <span
                                                    className={isOverdue(invoice.due_date, invoice.invoice_status) ? "text-red-600 font-medium" : ""}>
                                                {formatDate(invoice.due_date)}
                                                    {isOverdue(invoice.due_date, invoice.invoice_status) && (
                                                        <AlertCircle className="w-3 h-3 inline ml-1"/>
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
                                                <Badge
                                                    className={`${getStatusColor(invoice.invoice_status)} capitalize justify-center`}>
                                                    {getStatusIcon(invoice.invoice_status)}
                                                    {invoice.invoice_status}
                                                </Badge>
                                                {isOverdue(invoice.due_date, invoice.invoice_status) && (
                                                    <Badge variant="destructive"
                                                           className="mt-1 text-xs justify-center">
                                                        <AlertCircle className="w-3 h-3 mr-1"/>
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
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => router.get(`invoices/${invoice.id}`)}
                                                    size="icon">
                                                    <Eye className="w-4 h-4"/>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => router.get(`/invoices/${invoice.id}/edit`)}
                                                >
                                                    <Edit className="w-4 h-4"/>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <FoldersIcon/> No invoices found.
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                            }
                        </TableBody>
                    </Table>
                    <PaginationServerSide items={invoices} onChange={handleFilterChange}/>
                </CardContent>
            </Card>
        </div>
    );
};

export default InvoicesTable;
