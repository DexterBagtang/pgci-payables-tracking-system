import React, { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Search,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Eye,
    Calendar,
    FileText,
    CheckCircle2,
} from 'lucide-react';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import PaginationServerSide from '@/components/custom/Pagination.jsx';

export default function DisbursementsTable({ disbursements, filters }) {
    const { data } = disbursements;
    const [localFilters, setLocalFilters] = useState({
        search: filters.search || '',
    });
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc');

    // Calculate summary statistics
    const calculateSummary = () => {
        const released = data.filter((d) => d.date_check_released_to_vendor !== null).length;
        const pending = data.filter((d) => d.date_check_released_to_vendor === null).length;

        return {
            total: data.length,
            released,
            pending,
        };
    };

    const summary = calculateSummary();

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);

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

        Object.keys(updatedFilters).forEach(key => {
            if (!updatedFilters[key]) {
                delete updatedFilters[key];
            }
        });

        router.get('/disbursements', updatedFilters, {
            preserveState: true,
            replace: true,
            only: ['disbursements', 'filters'],
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

    const handlePageChange = ({ page }) => {
        const params = {
            ...localFilters,
            sort_by: sortBy,
            sort_order: sortOrder,
            page: page,
        };

        Object.keys(params).forEach(key => {
            if (!params[key]) {
                delete params[key];
            }
        });

        router.get('/disbursements', params, {
            preserveState: true,
            replace: true,
            only: ['disbursements', 'filters'],
        });
    };

    const getSortIcon = (field) => {
        if (sortBy !== field) return <ArrowUpDown className="h-4 w-4" />;
        return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
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
                {/* Summary Cards */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Total Disbursements</p>
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
                                    <p className="text-xs font-medium text-gray-500">Released</p>
                                    <p className="text-2xl font-bold">{summary.released}</p>
                                </div>
                                <CheckCircle2 className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-yellow-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Pending Release</p>
                                    <p className="text-2xl font-bold">{summary.pending}</p>
                                </div>
                                <Calendar className="h-8 w-8 text-yellow-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Card */}
                <Card>
                    <div className="p-6">
                        {/* Header with Create Button */}
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Disbursements</h2>
                            <Link href="/disbursements/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Disbursement
                                </Button>
                            </Link>
                        </div>

                        {/* Search Bar */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Search by check voucher number or remarks..."
                                    value={localFilters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <button
                                                onClick={() => handleSort('check_voucher_number')}
                                                className="flex items-center gap-2 hover:text-gray-900"
                                            >
                                                Check Voucher Number
                                                {getSortIcon('check_voucher_number')}
                                            </button>
                                        </TableHead>
                                        <TableHead>Check Requisitions</TableHead>
                                        <TableHead>
                                            <button
                                                onClick={() => handleSort('date_check_scheduled')}
                                                className="flex items-center gap-2 hover:text-gray-900"
                                            >
                                                Scheduled
                                                {getSortIcon('date_check_scheduled')}
                                            </button>
                                        </TableHead>
                                        <TableHead>
                                            <button
                                                onClick={() => handleSort('date_check_released_to_vendor')}
                                                className="flex items-center gap-2 hover:text-gray-900"
                                            >
                                                Released
                                                {getSortIcon('date_check_released_to_vendor')}
                                            </button>
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created By</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center text-gray-500">
                                                No disbursements found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        data.map((disbursement) => (
                                            <TableRow key={disbursement.id}>
                                                <TableCell className="font-medium">
                                                    {disbursement.check_voucher_number}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {disbursement.check_requisitions?.length || 0} CR(s)
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{formatDate(disbursement.date_check_scheduled)}</TableCell>
                                                <TableCell>{formatDate(disbursement.date_check_released_to_vendor)}</TableCell>
                                                <TableCell>
                                                    {disbursement.date_check_released_to_vendor ? (
                                                        <Badge className="bg-green-500">Released</Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Pending</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>{disbursement.creator?.name || '-'}</TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={`/disbursements/${disbursement.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {disbursements.last_page > 1 && (
                            <div className="mt-4">
                                <PaginationServerSide
                                    data={disbursements}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
