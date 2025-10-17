import React, { useState, useEffect, useRef } from 'react';
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
import { Plus, Search, ArrowUpDown, ArrowUp, ArrowDown, X, ExternalLink, FileText, Calendar, DollarSign, Filter } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { getStatusBadge } from '@/components/custom/helpers.jsx';
import StatusBadge from '@/components/custom/StatusBadge.jsx';

export default function CheckReqTable({ checkRequisitions, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc');

    const isInitialMount = useRef(true);

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            applyFilters(search, status, sortBy, sortOrder);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [search]);

    // Apply filters immediately for status and sort
    useEffect(() => {
        if (filters.status !== null || filters.sort_by !== 'created_at') {
            applyFilters(search, status, sortBy, sortOrder);
        }
    }, [status, sortBy, sortOrder]);

    const applyFilters = (searchValue, statusValue, sortByValue, sortOrderValue) => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

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
            return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground opacity-50" />;
        }
        return sortOrder === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4 text-primary" />
        ) : (
            <ArrowDown className="ml-2 h-4 w-4 text-primary" />
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
        <div className="py-8">
            <div className="sm:px-6 lg:px-8">
                <Card className="border border-gray-200 shadow-sm">
                    <CardHeader className="border-b bg-white pb-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl font-semibold text-gray-900">
                                    Check Requisitions
                                </CardTitle>
                                <CardDescription className="text-sm text-gray-500">
                                    Manage and track all check requisitions
                                </CardDescription>
                            </div>
                            <Link href={'check-requisitions/create'}>
                                <Button size="default" className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Requisition
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6">
                        {/* Filters Section */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="Search by requisition number, payee, PO, CER, or SI..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className="pl-10 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                                            />
                                            {search && (
                                                <button
                                                    onClick={() => setSearch('')}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <Select value={status || 'all'} onValueChange={setStatus}>
                                        <SelectTrigger className="w-full sm:w-[200px] h-10 border-gray-300 bg-white">
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
                                        <SelectTrigger className="w-full sm:w-[200px] h-10 border-gray-300 bg-white">
                                            <SelectValue placeholder="Sort by" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="created_at-desc">Newest First</SelectItem>
                                            <SelectItem value="created_at-asc">Oldest First</SelectItem>
                                            <SelectItem value="php_amount-desc">Amount: High to Low</SelectItem>
                                            <SelectItem value="php_amount-asc">Amount: Low to High</SelectItem>
                                            <SelectItem value="request_date-desc">Request Date: Newest</SelectItem>
                                            <SelectItem value="request_date-asc">Request Date: Oldest</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {hasActiveFilters && (
                                        <Button 
                                            onClick={handleReset} 
                                            variant="outline" 
                                            className="h-10 border-gray-300 hover:bg-gray-100"
                                        >
                                            <X className="mr-2 h-4 w-4" />
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Results Summary */}
                        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                            <div>
                                Showing <span className="font-medium text-gray-900">{checkRequisitions.from || 0}</span> to{' '}
                                <span className="font-medium text-gray-900">{checkRequisitions.to || 0}</span> of{' '}
                                <span className="font-medium text-gray-900">{checkRequisitions.total}</span> requisitions
                            </div>
                        </div>

                        {/* Table Section */}
                        <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
                                        <TableHead
                                            className="cursor-pointer font-semibold select-none text-gray-700 hover:text-gray-900"
                                            onClick={() => handleSort('requisition_number')}
                                        >
                                            <div className="flex items-center">
                                                Requisition #
                                                {getSortIcon('requisition_number')}
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-semibold text-gray-700">Payee</TableHead>
                                        <TableHead
                                            className="cursor-pointer font-semibold select-none text-gray-700 hover:text-gray-900"
                                            onClick={() => handleSort('php_amount')}
                                        >
                                            <div className="flex items-center">
                                                Amount
                                                {getSortIcon('php_amount')}
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer font-semibold select-none text-gray-700 hover:text-gray-900"
                                            onClick={() => handleSort('requisition_status')}
                                        >
                                            <div className="flex items-center">
                                                Status
                                                {getSortIcon('requisition_status')}
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer font-semibold select-none text-gray-700 hover:text-gray-900"
                                            onClick={() => handleSort('request_date')}
                                        >
                                            <div className="flex items-center">
                                                Request Date
                                                {getSortIcon('request_date')}
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-semibold text-gray-700">References</TableHead>
                                        <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {checkRequisitions.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-12">
                                                <div className="flex flex-col items-center justify-center text-gray-400">
                                                    <div className="bg-gray-100 rounded-full p-4 mb-3">
                                                        <Search className="h-10 w-10 text-gray-400" />
                                                    </div>
                                                    <p className="text-base font-medium text-gray-600">No check requisitions found</p>
                                                    <p className="text-sm mt-1 text-gray-500">Try adjusting your filters or search terms</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        checkRequisitions.data.map((requisition, index) => (
                                            <TableRow
                                                key={requisition.id}
                                                className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                                            >
                                                <TableCell className="font-medium text-blue-600">
                                                    {requisition.requisition_number}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-[200px]">
                                                        <p className="truncate text-gray-900" title={requisition.payee_name}>
                                                            {requisition.payee_name}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-semibold text-gray-900">
                                                    {formatCurrency(requisition.php_amount)}
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge status={requisition.requisition_status} />
                                                </TableCell>
                                                <TableCell className="text-gray-600">
                                                    {formatDate(requisition.request_date)}
                                                </TableCell>
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
                                                <TableCell className="text-right">
                                                    <Link href={`check-requisitions/${requisition.id}`}>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            className="border-gray-300 hover:bg-gray-100"
                                                        >
                                                            View
                                                            <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination Section */}
                        {checkRequisitions.links && (
                            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                                <div className="text-sm text-gray-600">
                                    Page {checkRequisitions.current_page} of {checkRequisitions.last_page}
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
                                            className={`
                                                ${link.active 
                                                    ? 'bg-blue-600 hover:bg-blue-700' 
                                                    : 'border-gray-300 hover:bg-gray-100'
                                                }
                                            `}
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
