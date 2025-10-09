import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
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
import { Plus, Search, ArrowUpDown, ArrowUp, ArrowDown, X, LinkIcon, Link2, ExternalLink } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export default function CheckReqTable({ checkRequisitions, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc');

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            applyFilters(search, status, sortBy, sortOrder);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [search]);

    // Apply filters immediately for status and sort
    useEffect(() => {
        if (filters.status !== undefined || filters.sort_by !== undefined) {
            applyFilters(search, status, sortBy, sortOrder);
        }
    }, [status, sortBy, sortOrder]);

    const applyFilters = (searchValue, statusValue, sortByValue, sortOrderValue) => {
        router.get(
            '/check-requisitions',
            {
                search: searchValue || undefined,
                status: statusValue && statusValue !== 'all' ? statusValue : undefined,
                sort_by: sortByValue,
                sort_order: sortOrderValue,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const handleSort = (column) => {
        const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newOrder);
    };

    const handleReset = () => {
        setSearch('');
        setStatus('all');
        setSortBy('created_at');
        setSortOrder('desc');
        router.get('/check-requisitions');
    };

    const getSortIcon = (column) => {
        if (sortBy !== column) {
            return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
        }
        return sortOrder === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
            <ArrowDown className="ml-2 h-4 w-4" />
        );
    };

    const getStatusBadge = (status) => {
        const config = {
            pending: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
            approved: { variant: 'default', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
            processed: { variant: 'default', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
            rejected: { variant: 'destructive', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
        };

        const statusConfig = config[status] || config.pending;

        return (
            <Badge variant={statusConfig.variant} className={statusConfig.className}>
                {status?.toUpperCase()}
            </Badge>
        );
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const hasActiveFilters = search || (status && status !== 'all');

    return (
        <div className="py-6">
            <div className="sm:px-6 lg:px-8">
                <Card className="shadow-sm">
                    <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-2xl font-bold">Check Requisitions</CardTitle>
                                <CardDescription className="mt-1">
                                    Manage and track all check requisitions
                                </CardDescription>
                            </div>
                            <Link href={'check-requisitions/create'}>
                                <Button className="shadow-sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Requisition
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 mb-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by requisition number, payee, PO, CER, or SI..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-10 h-10"
                                        />
                                        {search && (
                                            <button
                                                onClick={() => setSearch('')}
                                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <Select value={status || 'all'} onValueChange={setStatus}>
                                    <SelectTrigger className="w-full sm:w-[200px] h-10">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="processed">Processed</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={`${sortBy}-${sortOrder}`}
                                    onValueChange={(value) => {
                                        const [col, order] = value.split('-');
                                        setSortBy(col);
                                        setSortOrder(order);
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-[200px] h-10">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="created_at-desc">Newest First</SelectItem>
                                        <SelectItem value="created_at-asc">Oldest First</SelectItem>
                                        <SelectItem value="php_amount-desc">
                                            Amount: High to Low
                                        </SelectItem>
                                        <SelectItem value="php_amount-asc">
                                            Amount: Low to High
                                        </SelectItem>
                                        <SelectItem value="request_date-desc">
                                            Request Date: Newest
                                        </SelectItem>
                                        <SelectItem value="request_date-asc">
                                            Request Date: Oldest
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                {hasActiveFilters && (
                                    <Button onClick={handleReset} variant="outline" className="h-10">
                                        <X className="mr-2 h-4 w-4" />
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="rounded-lg border shadow-sm overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                                        <TableHead
                                            className="cursor-pointer font-semibold select-none"
                                            onClick={() => handleSort('requisition_number')}
                                        >
                                            <div className="flex items-center">
                                                Requisition #
                                                {getSortIcon('requisition_number')}
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-semibold">Payee</TableHead>
                                        <TableHead
                                            className="cursor-pointer font-semibold select-none"
                                            onClick={() => handleSort('php_amount')}
                                        >
                                            <div className="flex items-center">
                                                Amount
                                                {getSortIcon('php_amount')}
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer font-semibold select-none"
                                            onClick={() => handleSort('requisition_status')}
                                        >
                                            <div className="flex items-center">
                                                Status
                                                {getSortIcon('requisition_status')}
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer font-semibold select-none"
                                            onClick={() => handleSort('request_date')}
                                        >
                                            <div className="flex items-center">
                                                Request Date
                                                {getSortIcon('request_date')}
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-semibold">References</TableHead>
                                        <TableHead className="text-right font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {checkRequisitions.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-12">
                                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                    <Search className="h-12 w-12 mb-4 opacity-20" />
                                                    <p className="text-lg font-medium">No check requisitions found</p>
                                                    <p className="text-sm mt-1">Try adjusting your filters</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        checkRequisitions.data.map((requisition, index) => (
                                            <TableRow
                                                key={requisition.id}
                                                className="hover:bg-slate-50 transition-colors"
                                            >
                                                <TableCell className="font-medium">
                                                    <span className="text-blue-600">
                                                        {requisition.requisition_number}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-[200px] truncate" title={requisition.payee_name}>
                                                        {requisition.payee_name}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    {formatCurrency(requisition.php_amount)}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(requisition.requisition_status)}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {formatDate(requisition.request_date)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm space-y-1">
                                                        {requisition.po_number && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-medium text-muted-foreground">PO:</span>
                                                                <span>{requisition.po_number}</span>
                                                            </div>
                                                        )}
                                                        {requisition.cer_number && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-medium text-muted-foreground">CER:</span>
                                                                <span>{requisition.cer_number}</span>
                                                            </div>
                                                        )}
                                                        {requisition.si_number && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-medium text-muted-foreground">SI:</span>
                                                                <span>{requisition.si_number}</span>
                                                            </div>
                                                        )}
                                                        {!requisition.po_number && !requisition.cer_number && !requisition.si_number && (
                                                            <span className="text-muted-foreground italic">No references</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={`check-requisitions/${requisition.id}`}>
                                                        <Button  size="sm">
                                                            View <ExternalLink />
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {checkRequisitions.links && (
                            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing <span className="font-medium">{checkRequisitions.from || 0}</span> to{' '}
                                    <span className="font-medium">{checkRequisitions.to || 0}</span> of{' '}
                                    <span className="font-medium">{checkRequisitions.total}</span> results
                                </div>
                                <div className="flex gap-1">
                                    {checkRequisitions.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() =>
                                                link.url &&
                                                router.visit(link.url, {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                })
                                            }
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={link.active ? 'shadow-sm' : ''}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
