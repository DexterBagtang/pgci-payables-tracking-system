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
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="border-b border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50 pb-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div className="space-y-2">
                                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                    Check Requisitions
                                </CardTitle>
                                <CardDescription className="text-base flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Manage and track all check requisitions
                                </CardDescription>
                            </div>
                            <Link href={'check-requisitions/create'}>
                                <Button size="lg" className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                                    <Plus className="mr-2 h-5 w-5" />
                                    New Requisition
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-8 px-6">
                        {/* Stats Summary */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-700">Total Requisitions</p>
                                        <p className="text-3xl font-bold text-blue-900 mt-1">{checkRequisitions.total}</p>
                                    </div>
                                    <div className="bg-blue-200 rounded-full p-3">
                                        <FileText className="h-6 w-6 text-blue-700" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-700">Showing Results</p>
                                        <p className="text-3xl font-bold text-green-900 mt-1">{checkRequisitions.data.length}</p>
                                    </div>
                                    <div className="bg-green-200 rounded-full p-3">
                                        <Search className="h-6 w-6 text-green-700" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-purple-700">Active Filters</p>
                                        <p className="text-3xl font-bold text-purple-900 mt-1">
                                            {[search, status && status !== 'all', sortBy !== 'created_at'].filter(Boolean).length}
                                        </p>
                                    </div>
                                    <div className="bg-purple-200 rounded-full p-3">
                                        <Filter className="h-6 w-6 text-purple-700" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters Section */}
                        <div className="bg-slate-50 rounded-xl p-6 mb-6 border border-slate-200">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1">
                                        <div className="relative group">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                            <Input
                                                placeholder="Search by requisition number, payee, PO, CER, or SI..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className="pl-11 h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-white shadow-sm"
                                            />
                                            {search && (
                                                <button
                                                    onClick={() => setSearch('')}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    <X className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <Select value={status || 'all'} onValueChange={setStatus}>
                                        <SelectTrigger className="w-full sm:w-[220px] h-12 border-slate-300 bg-white shadow-sm">
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
                                        <SelectTrigger className="w-full sm:w-[220px] h-12 border-slate-300 bg-white shadow-sm">
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
                                            className="h-12 border-slate-300 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200"
                                        >
                                            <X className="mr-2 h-5 w-5" />
                                            Clear All
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Table Section */}
                        <div className="rounded-xl border border-slate-200 shadow-lg overflow-hidden bg-white">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gradient-to-r from-slate-100 to-slate-50 hover:from-slate-100 hover:to-slate-50 border-b-2 border-slate-200">
                                        <TableHead
                                            className="cursor-pointer font-bold select-none text-slate-700 hover:text-slate-900 transition-colors"
                                            onClick={() => handleSort('requisition_number')}
                                        >
                                            <div className="flex items-center">
                                                Requisition #
                                                {getSortIcon('requisition_number')}
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-bold text-slate-700">Payee</TableHead>
                                        <TableHead
                                            className="cursor-pointer font-bold select-none text-slate-700 hover:text-slate-900 transition-colors"
                                            onClick={() => handleSort('php_amount')}
                                        >
                                            <div className="flex items-center">
                                                <DollarSign className="h-4 w-4 mr-1" />
                                                Amount
                                                {getSortIcon('php_amount')}
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer font-bold select-none text-slate-700 hover:text-slate-900 transition-colors"
                                            onClick={() => handleSort('requisition_status')}
                                        >
                                            <div className="flex items-center">
                                                Status
                                                {getSortIcon('requisition_status')}
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer font-bold select-none text-slate-700 hover:text-slate-900 transition-colors"
                                            onClick={() => handleSort('request_date')}
                                        >
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                Request Date
                                                {getSortIcon('request_date')}
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-bold text-slate-700">References</TableHead>
                                        <TableHead className="text-right font-bold text-slate-700">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {checkRequisitions.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-16">
                                                <div className="flex flex-col items-center justify-center text-slate-400">
                                                    <div className="bg-slate-100 rounded-full p-6 mb-4">
                                                        <Search className="h-16 w-16 text-slate-300" />
                                                    </div>
                                                    <p className="text-xl font-semibold text-slate-600">No check requisitions found</p>
                                                    <p className="text-sm mt-2">Try adjusting your filters or search terms</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        checkRequisitions.data.map((requisition, index) => (
                                            <TableRow
                                                key={requisition.id}
                                                className="hover:bg-blue-50/50 transition-colors border-b border-slate-100 group"
                                            >
                                                <TableCell className="font-semibold">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1 h-8 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                        <span className="text-blue-600 font-mono">
                                                            {requisition.requisition_number}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-[200px]">
                                                        <p className="truncate font-medium text-slate-700" title={requisition.payee_name}>
                                                            {requisition.payee_name}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-bold text-green-700">
                                                    {formatCurrency(requisition.php_amount)}
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge className="uppercase text-xs font-semibold" status={requisition.requisition_status} />
                                                </TableCell>
                                                <TableCell className="text-slate-600">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-slate-400" />
                                                        {formatDate(requisition.request_date)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm space-y-1.5">
                                                        {requisition.po_number && (
                                                            <div className="flex items-center gap-2 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                                                                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 text-xs font-semibold">PO</Badge>
                                                                <span className="text-slate-700">{requisition.po_number}</span>
                                                            </div>
                                                        )}
                                                        {requisition.cer_number && (
                                                            <div className="flex items-center gap-2 bg-purple-50 px-2 py-1 rounded-md border border-purple-200">
                                                                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 text-xs font-semibold">CER</Badge>
                                                                <span className="text-slate-700">{requisition.cer_number}</span>
                                                            </div>
                                                        )}
                                                        {requisition.si_number && (
                                                            <div className="flex items-center gap-2 bg-teal-50 px-2 py-1 rounded-md border border-teal-200">
                                                                <Badge variant="outline" className="bg-teal-100 text-teal-800 border-teal-300 text-xs font-semibold">SI</Badge>
                                                                <span className="text-slate-700">{requisition.si_number}</span>
                                                            </div>
                                                        )}
                                                        {!requisition.po_number && !requisition.cer_number && !requisition.si_number && (
                                                            <span className="text-slate-400 italic text-xs">No references</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={`check-requisitions/${requisition.id}`}>
                                                        <Button 
                                                            size="sm" 
                                                            className="shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                                                        >
                                                            View
                                                            <ExternalLink className="ml-2 h-4 w-4" />
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
                            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
                                <div className="text-sm text-slate-600 font-medium">
                                    Showing <span className="font-bold text-slate-800 text-base">{checkRequisitions.from || 0}</span> to{' '}
                                    <span className="font-bold text-slate-800 text-base">{checkRequisitions.to || 0}</span> of{' '}
                                    <span className="font-bold text-slate-800 text-base">{checkRequisitions.total}</span> results
                                </div>
                                <div className="flex gap-2">
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
                                                    ? 'shadow-md bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' 
                                                    : 'hover:bg-slate-100 border-slate-300'
                                                }
                                                transition-all duration-200
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
