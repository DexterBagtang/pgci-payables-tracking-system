import React, { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
    Plus,
    Search,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Eye,
    Edit,
    Calendar as CalendarIcon,
    FileText,
    CheckCircle2,
    Clock,
    Filter,
    XCircle,
    Building2,
    Receipt,
    TrendingUp,
    User,
    Package,
    Zap,
    List,
    LayoutGrid,
    CalendarDays,
    Printer,
} from 'lucide-react';
import PaginationServerSide from '@/components/custom/Pagination.jsx';
import DisbursementSummaryCards from './DisbursementSummaryCards';
import FilterPresets from '@/components/custom/FilterPresets';
import { formatCurrency } from '@/components/custom/helpers';
import QuickReleaseModal from './QuickReleaseModal';
import BulkReleaseModal from './BulkReleaseModal';
import KanbanView from './KanbanView';
import CalendarView from './CalendarView';

export default function DisbursementsTable({ disbursements, filters, filterOptions, statistics }) {
    const { canWrite } = usePermissions();
    const { data } = disbursements;

    // New state for view mode and bulk actions
    const [viewMode, setViewMode] = useState('list'); // 'list', 'kanban', 'calendar'
    const [selectedIds, setSelectedIds] = useState([]);
    const [showQuickRelease, setShowQuickRelease] = useState(false);
    const [showBulkRelease, setShowBulkRelease] = useState(false);
    const [selectedDisbursement, setSelectedDisbursement] = useState(null);

    // State
    const [localFilters, setLocalFilters] = useState({
        search: filters.search || '',
        vendor_id: filters.vendor_id || '',
        purchase_order_id: filters.purchase_order_id || '',
        check_requisition_id: filters.check_requisition_id || '',
        project_id: filters.project_id || '',
        account_code: filters.account_code || '',
        amount_min: filters.amount_min || '',
        amount_max: filters.amount_max || '',
    });
    const [activeTab, setActiveTab] = useState(filters.status || 'all');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc');
    const [dateField, setDateField] = useState(filters.date_field || 'date_check_scheduled');
    const [dateRange, setDateRange] = useState({
        from: filters.date_from ? new Date(filters.date_from) : null,
        to: filters.date_to ? new Date(filters.date_to) : null,
    });

    // Auto-submit search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localFilters.search !== filters.search) {
                handleFilterChange('search', localFilters.search);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [localFilters.search]);

    // Filter handlers
    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);

        if (key !== 'search') {
            updateFilters(newFilters);
        }
    };

    const updateFilters = (newFilters = localFilters) => {
        const updatedFilters = {
            ...filters,
            ...newFilters,
            sort_by: sortBy,
            sort_order: sortOrder,
            date_field: dateField,
            date_from: dateRange.from ? dateRange.from.toISOString().split('T')[0] : null,
            date_to: dateRange.to ? dateRange.to.toISOString().split('T')[0] : null,
            status: activeTab !== 'all' ? activeTab : null,
            page: 1
        };

        // Remove empty filters
        Object.keys(updatedFilters).forEach(key => {
            if (!updatedFilters[key] || updatedFilters[key] === '') {
                delete updatedFilters[key];
            }
        });

        router.get('/disbursements', updatedFilters, {
            preserveState: true,
            replace: true,
            only: ['disbursements', 'filters', 'statistics'],
        });
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        const updatedFilters = {
            ...filters,
            ...localFilters,
            status: tab !== 'all' ? tab : null,
            page: 1
        };

        Object.keys(updatedFilters).forEach(key => {
            if (!updatedFilters[key] || updatedFilters[key] === '') {
                delete updatedFilters[key];
            }
        });

        router.get('/disbursements', updatedFilters, {
            preserveState: true,
            replace: true,
            only: ['disbursements', 'filters', 'statistics'],
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

    const handleDateRangeChange = (range) => {
        setDateRange(range);
        updateFilters();
    };

    const clearFilter = (key) => {
        const newFilters = { ...localFilters, [key]: '' };
        setLocalFilters(newFilters);
        updateFilters(newFilters);
    };

    const clearAllFilters = () => {
        setLocalFilters({
            search: '',
            vendor_id: '',
            purchase_order_id: '',
            check_requisition_id: '',
            project_id: '',
            account_code: '',
            amount_min: '',
            amount_max: '',
        });
        setDateRange({ from: null, to: null });
        setActiveTab('all');

        router.get('/disbursements', {
            sort_by: sortBy,
            sort_order: sortOrder,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const applyFilterPreset = (presetFilters) => {
        // Apply all saved filters
        setLocalFilters({
            search: presetFilters.search || '',
            vendor_id: presetFilters.vendor_id || '',
            purchase_order_id: presetFilters.purchase_order_id || '',
            check_requisition_id: presetFilters.check_requisition_id || '',
            project_id: presetFilters.project_id || '',
            account_code: presetFilters.account_code || '',
            amount_min: presetFilters.amount_min || '',
            amount_max: presetFilters.amount_max || '',
        });

        if (presetFilters.date_from || presetFilters.date_to) {
            setDateRange({
                from: presetFilters.date_from ? new Date(presetFilters.date_from) : null,
                to: presetFilters.date_to ? new Date(presetFilters.date_to) : null,
            });
        }

        if (presetFilters.status) {
            setActiveTab(presetFilters.status);
        }

        if (presetFilters.date_field) {
            setDateField(presetFilters.date_field);
        }

        // Navigate with all filters applied
        router.get('/disbursements', {
            ...presetFilters,
            sort_by: sortBy,
            sort_order: sortOrder,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handlePageChange = ({ page }) => {
        const params = {
            ...filters,
            ...localFilters,
            sort_by: sortBy,
            sort_order: sortOrder,
            page: page,
        };

        Object.keys(params).forEach(key => {
            if (!params[key] || params[key] === '') {
                delete params[key];
            }
        });

        router.get('/disbursements', params, {
            preserveState: true,
            replace: true,
            only: ['disbursements', 'filters', 'statistics'],
        });
    };

    const getSortIcon = (field) => {
        if (sortBy !== field) return <ArrowUpDown className="h-4 w-4" />;
        return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    };

    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString);
    };

    const getAgingBadgeColor = (days) => {
        if (!days) return 'bg-gray-100 text-gray-700';
        if (days <= 30) return 'bg-green-100 text-green-700';
        if (days <= 60) return 'bg-yellow-100 text-yellow-700';
        return 'bg-red-100 text-red-700';
    };

    // Bulk action handlers
    const handleSelectAll = (checked) => {
        if (checked) {
            // Only select pending disbursements
            const pendingIds = data.filter(d => !d.date_check_released_to_vendor).map(d => d.id);
            setSelectedIds(pendingIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id, checked) => {
        if (checked) {
            setSelectedIds([...selectedIds, id]);
        } else {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        }
    };

    const handleQuickRelease = (disbursement) => {
        setSelectedDisbursement(disbursement);
        setShowQuickRelease(true);
    };

    const handleBulkReleaseClick = () => {
        const selected = data.filter(d => selectedIds.includes(d.id));
        setShowBulkRelease(true);
    };

    const getSelectedDisbursements = () => {
        return data.filter(d => selectedIds.includes(d.id));
    };

    // Status tabs configuration
    const statusTabs = [
        {
            value: 'all',
            label: 'All Disbursements',
            icon: FileText,
            count: statistics.total,
            activeClasses: 'border-blue-500 bg-blue-50 shadow-sm',
            iconActiveClasses: 'text-blue-600',
            textActiveClasses: 'text-blue-700',
            indicatorClasses: 'bg-blue-500'
        },
        {
            value: 'pending',
            label: 'Pending Release',
            icon: Clock,
            count: statistics.pending,
            activeClasses: 'border-yellow-500 bg-yellow-50 shadow-sm',
            iconActiveClasses: 'text-yellow-600',
            textActiveClasses: 'text-yellow-700',
            indicatorClasses: 'bg-yellow-500'
        },
        {
            value: 'released',
            label: 'Released',
            icon: CheckCircle2,
            count: statistics.released,
            activeClasses: 'border-green-500 bg-green-50 shadow-sm',
            iconActiveClasses: 'text-green-600',
            textActiveClasses: 'text-green-700',
            indicatorClasses: 'bg-green-500'
        }
    ];

    // Count active filters
    const activeFiltersCount = [
        filters.search,
        filters.vendor_id,
        filters.purchase_order_id,
        filters.check_requisition_id,
        filters.project_id,
        filters.account_code,
        filters.amount_min,
        filters.amount_max,
        filters.date_from || filters.date_to
    ].filter(Boolean).length;

    return (
        <div className="py-6">
            <div className="mx-auto sm:px-6 lg:px-8">
                {/* Summary Cards */}
                <DisbursementSummaryCards statistics={statistics} formatCurrency={formatCurrency} />

                {/* Main Card */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-xl">Disbursement Management</CardTitle>
                                <CardDescription>Check Disbursement Processing & Tracking System</CardDescription>
                            </div>
                            <div className="flex items-center space-x-3">
                                {/* View Mode Switcher */}
                                <div className="flex gap-1 rounded-lg border p-1">
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('kanban')}
                                    >
                                        <LayoutGrid className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('calendar')}
                                    >
                                        <CalendarDays className="h-4 w-4" />
                                    </Button>
                                </div>

                                {canWrite('disbursements') && (
                                    <Link href="/disbursements/create">
                                        <Button size="sm">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Disbursement
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {/* Render based on view mode */}
                        {viewMode === 'kanban' ? (
                            <KanbanView />
                        ) : viewMode === 'calendar' ? (
                            <CalendarView />
                        ) : (
                            <>
                        {/* Status Filter Pills */}
                        <div className="mb-6 space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {statusTabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.value;

                                    return (
                                        <button
                                            key={tab.value}
                                            onClick={() => handleTabChange(tab.value)}
                                            className={cn(
                                                "group relative flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 transition-all duration-200",
                                                isActive
                                                    ? tab.activeClasses
                                                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                                            )}
                                        >
                                            <Icon className={cn(
                                                "h-4 w-4 transition-colors",
                                                isActive ? tab.iconActiveClasses : "text-gray-500 group-hover:text-gray-700"
                                            )} />
                                            <span className={cn(
                                                "text-sm font-medium transition-colors",
                                                isActive ? tab.textActiveClasses : "text-gray-700 group-hover:text-gray-900"
                                            )}>
                                                {tab.label}
                                            </span>
                                            <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold">
                                                {tab.count}
                                            </span>
                                            {isActive && (
                                                <div className={cn(
                                                    "absolute -bottom-2 left-1/2 h-1 w-3/4 -translate-x-1/2 rounded-full",
                                                    tab.indicatorClasses
                                                )} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Active Filters Banner */}
                        {activeFiltersCount > 0 && (
                            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                                    <Filter className="h-4 w-4" />
                                    Active Filters:
                                </div>

                                {filters.search && (
                                    <Badge variant="secondary" className="gap-1 bg-white border border-blue-200">
                                        <Search className="h-3 w-3" />
                                        Search: {filters.search}
                                        <XCircle
                                            className="h-3 w-3 cursor-pointer hover:text-red-600"
                                            onClick={() => clearFilter('search')}
                                        />
                                    </Badge>
                                )}

                                {filters.vendor_id && (
                                    <Badge variant="secondary" className="gap-1 bg-white border border-blue-200">
                                        <Building2 className="h-3 w-3" />
                                        Vendor: {filterOptions.vendors.find(v => v.id.toString() === filters.vendor_id)?.name}
                                        <XCircle
                                            className="h-3 w-3 cursor-pointer hover:text-red-600"
                                            onClick={() => clearFilter('vendor_id')}
                                        />
                                    </Badge>
                                )}

                                {filters.purchase_order_id && (
                                    <Badge variant="secondary" className="gap-1 bg-white border border-blue-200">
                                        <Receipt className="h-3 w-3" />
                                        PO: {filterOptions.purchaseOrders.find(po => po.id.toString() === filters.purchase_order_id)?.po_number}
                                        <XCircle
                                            className="h-3 w-3 cursor-pointer hover:text-red-600"
                                            onClick={() => clearFilter('purchase_order_id')}
                                        />
                                    </Badge>
                                )}

                                {filters.check_requisition_id && (
                                    <Badge variant="secondary" className="gap-1 bg-white border border-blue-200">
                                        <FileText className="h-3 w-3" />
                                        CR: {filterOptions.checkRequisitions.find(cr => cr.id.toString() === filters.check_requisition_id)?.requisition_number}
                                        <XCircle
                                            className="h-3 w-3 cursor-pointer hover:text-red-600"
                                            onClick={() => clearFilter('check_requisition_id')}
                                        />
                                    </Badge>
                                )}

                                {filters.project_id && (
                                    <Badge variant="secondary" className="gap-1 bg-white border border-blue-200">
                                        <Building2 className="h-3 w-3" />
                                        Project: {filterOptions.projects?.find(p => p.id.toString() === filters.project_id)?.cer_number || filterOptions.projects?.find(p => p.id.toString() === filters.project_id)?.project_title}
                                        <XCircle
                                            className="h-3 w-3 cursor-pointer hover:text-red-600"
                                            onClick={() => clearFilter('project_id')}
                                        />
                                    </Badge>
                                )}

                                {filters.account_code && (
                                    <Badge variant="secondary" className="gap-1 bg-white border border-blue-200">
                                        <DollarSign className="h-3 w-3" />
                                        Account: {filters.account_code}
                                        <XCircle
                                            className="h-3 w-3 cursor-pointer hover:text-red-600"
                                            onClick={() => clearFilter('account_code')}
                                        />
                                    </Badge>
                                )}

                                {(filters.amount_min || filters.amount_max) && (
                                    <Badge variant="secondary" className="gap-1 bg-white border border-blue-200">
                                        <TrendingUp className="h-3 w-3" />
                                        Amount: {filters.amount_min ? formatCurrency(filters.amount_min) : '0'} - {filters.amount_max ? formatCurrency(filters.amount_max) : '∞'}
                                        <XCircle
                                            className="h-3 w-3 cursor-pointer hover:text-red-600"
                                            onClick={() => {
                                                clearFilter('amount_min');
                                                clearFilter('amount_max');
                                            }}
                                        />
                                    </Badge>
                                )}

                                {(filters.date_from || filters.date_to) && (
                                    <Badge variant="secondary" className="gap-1 bg-white border border-blue-200">
                                        <CalendarIcon className="h-3 w-3" />
                                        Date: {filters.date_from ? format(new Date(filters.date_from), 'MMM dd') : '...'} - {filters.date_to ? format(new Date(filters.date_to), 'MMM dd') : '...'}
                                        <XCircle
                                            className="h-3 w-3 cursor-pointer hover:text-red-600"
                                            onClick={() => setDateRange({ from: null, to: null })}
                                        />
                                    </Badge>
                                )}

                                <button
                                    onClick={clearAllFilters}
                                    className="text-xs font-medium text-blue-600 underline hover:text-blue-800"
                                >
                                    Clear All Filters
                                </button>

                                <div className="ml-auto">
                                    <FilterPresets
                                        storageKey="disbursements_filter_presets"
                                        currentFilters={{
                                            ...localFilters,
                                            status: activeTab,
                                            date_field: dateField,
                                            date_from: dateRange.from ? dateRange.from.toISOString().split('T')[0] : null,
                                            date_to: dateRange.to ? dateRange.to.toISOString().split('T')[0] : null,
                                        }}
                                        onApplyPreset={applyFilterPreset}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Filter Controls Grid - Row 1 */}
                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-6">
                            {/* Search - 2 cols */}
                            <div className="relative md:col-span-2">
                                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by check voucher or remarks..."
                                    value={localFilters.search}
                                    onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                                    className="pl-8"
                                />
                            </div>

                            {/* Vendor Filter */}
                            <Select
                                value={localFilters.vendor_id || 'all'}
                                onValueChange={(value) => handleFilterChange('vendor_id', value === 'all' ? '' : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Vendors" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Vendors</SelectItem>
                                    {filterOptions.vendors.map((vendor) => (
                                        <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                            {vendor.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Project Filter */}
                            <Select
                                value={localFilters.project_id || 'all'}
                                onValueChange={(value) => handleFilterChange('project_id', value === 'all' ? '' : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Projects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Projects</SelectItem>
                                    {filterOptions.projects?.map((project) => (
                                        <SelectItem key={project.id} value={project.id.toString()}>
                                            {project.cer_number || project.project_title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* PO Filter */}
                            <Select
                                value={localFilters.purchase_order_id || 'all'}
                                onValueChange={(value) => handleFilterChange('purchase_order_id', value === 'all' ? '' : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All POs" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All POs</SelectItem>
                                    {filterOptions.purchaseOrders.map((po) => (
                                        <SelectItem key={po.id} value={po.id.toString()}>
                                            {po.po_number}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Date Range Filter */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="justify-start">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange.from ? (
                                            dateRange.to ? (
                                                `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`
                                            ) : format(dateRange.from, 'MMM dd, yyyy')
                                        ) : (
                                            'Date Range'
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <div className="p-3 border-b">
                                        <Select value={dateField} onValueChange={setDateField}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="date_check_printing">Date Check Printing</SelectItem>
                                                <SelectItem value="date_check_scheduled">Date Scheduled for Release</SelectItem>
                                                <SelectItem value="date_check_released_to_vendor">Date Released to Vendor</SelectItem>
                                                <SelectItem value="created_at">Created Date</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Calendar
                                        mode="range"
                                        selected={dateRange}
                                        onSelect={handleDateRangeChange}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Filter Controls Grid - Row 2 */}
                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-6">
                            {/* CR Filter */}
                            <Select
                                value={localFilters.check_requisition_id || 'all'}
                                onValueChange={(value) => handleFilterChange('check_requisition_id', value === 'all' ? '' : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Check Requisitions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Check Requisitions</SelectItem>
                                    {filterOptions.checkRequisitions.map((cr) => (
                                        <SelectItem key={cr.id} value={cr.id.toString()}>
                                            {cr.requisition_number} - {cr.payee_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Account Code Filter */}
                            <Select
                                value={localFilters.account_code || 'all'}
                                onValueChange={(value) => handleFilterChange('account_code', value === 'all' ? '' : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Account Codes" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Account Codes</SelectItem>
                                    {filterOptions.accountCodes?.map((code, idx) => (
                                        <SelectItem key={idx} value={code}>
                                            {code}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Min Amount */}
                            <div className="md:col-span-2">
                                <Input
                                    type="number"
                                    placeholder="Min Amount (₱)"
                                    value={localFilters.amount_min}
                                    onChange={(e) => handleFilterChange('amount_min', e.target.value)}
                                />
                            </div>

                            {/* Max Amount */}
                            <div className="md:col-span-2">
                                <Input
                                    type="number"
                                    placeholder="Max Amount (₱)"
                                    value={localFilters.amount_max}
                                    onChange={(e) => handleFilterChange('amount_max', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead className="w-[50px]">
                                            <Checkbox
                                                checked={selectedIds.length > 0 && selectedIds.length === data.filter(d => !d.date_check_released_to_vendor).length}
                                                onCheckedChange={handleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSort('check_voucher_number')}
                                            >
                                                Check Voucher {getSortIcon('check_voucher_number')}
                                            </Button>
                                        </TableHead>
                                        <TableHead>Vendor / Payee</TableHead>
                                        <TableHead>Project</TableHead>
                                        <TableHead>Total Amount</TableHead>
                                        <TableHead>PO / Invoice</TableHead>
                                        <TableHead>Aging</TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSort('date_check_printing')}
                                            >
                                                Printed {getSortIcon('date_check_printing')}
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSort('date_check_scheduled')}
                                            >
                                                Scheduled {getSortIcon('date_check_scheduled')}
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSort('date_check_released_to_vendor')}
                                            >
                                                Released {getSortIcon('date_check_released_to_vendor')}
                                            </Button>
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={11} className="text-center text-gray-500 py-8">
                                                No disbursements found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        data.map((disbursement) => (
                                            <TableRow key={disbursement.id} className="hover:bg-gray-50">
                                                {/* Checkbox */}
                                                <TableCell>
                                                    {!disbursement.date_check_released_to_vendor && (
                                                        <Checkbox
                                                            checked={selectedIds.includes(disbursement.id)}
                                                            onCheckedChange={(checked) => handleSelectRow(disbursement.id, checked)}
                                                        />
                                                    )}
                                                </TableCell>

                                                {/* Check Voucher Number */}
                                                        <TableCell>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Link
                                                                            href={`/disbursements/${disbursement.id}`}
                                                                            className="flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-800"
                                                                        >
                                                                            <FileText className="h-4 w-4" />
                                                                            {disbursement.check_voucher_number}
                                                                        </Link>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>View disbursement details</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </TableCell>

                                                        {/* Vendor / Payee */}
                                                        <TableCell>
                                                            <div className="flex flex-col gap-1">
                                                                {disbursement.primary_vendor ? (
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <Building2 className="h-3.5 w-3.5 text-blue-600" />
                                                                                    <span className="text-sm font-medium">
                                                                                        {disbursement.primary_vendor.name}
                                                                                    </span>
                                                                                    {disbursement.vendor_count > 1 && (
                                                                                        <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                                                                                            +{disbursement.vendor_count - 1}
                                                                                        </Badge>
                                                                                    )}
                                                                                </div>
                                                                            </TooltipTrigger>
                                                                            {disbursement.vendor_count > 1 && (
                                                                                <TooltipContent>
                                                                                    <p>Multiple vendors - click to expand</p>
                                                                                </TooltipContent>
                                                                            )}
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                ) : null}
                                                                {disbursement.primary_payee && (
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <User className="h-3.5 w-3.5 text-purple-600" />
                                                                                    <span className="text-xs text-gray-600">
                                                                                        {disbursement.primary_payee}
                                                                                    </span>
                                                                                </div>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                <p>Payee: {disbursement.primary_payee}</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                )}
                                                            </div>
                                                        </TableCell>

                                                        {/* Project */}
                                                        <TableCell>
                                                            {disbursement.primary_project ? (
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <div className="flex flex-col gap-0.5">
                                                                                <span className="text-sm font-medium">
                                                                                    {disbursement.primary_project.cer_number || 'N/A'}
                                                                                </span>
                                                                                <span className="text-xs text-gray-500 truncate max-w-[150px]">
                                                                                    {disbursement.primary_project.project_title}
                                                                                </span>
                                                                                {disbursement.project_count > 1 && (
                                                                                    <Badge variant="secondary" className="w-fit text-xs">
                                                                                        +{disbursement.project_count - 1} more
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>{disbursement.primary_project.project_title}</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            ) : (
                                                                <span className="text-sm text-gray-400">N/A</span>
                                                            )}
                                                        </TableCell>

                                                        {/* Total Amount */}
                                                        <TableCell>
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="text-lg font-bold text-green-700">
                                                                    {formatCurrency(disbursement.total_amount)}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {disbursement.check_requisition_count} CR{disbursement.check_requisition_count !== 1 ? 's' : ''}
                                                                </span>
                                                            </div>
                                                        </TableCell>

                                                        {/* PO / Invoice */}
                                                        <TableCell>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="flex flex-col gap-1">
                                                                            {disbursement.po_numbers && disbursement.po_numbers.length > 0 ? (
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <Package className="h-3.5 w-3.5 text-blue-600" />
                                                                                    <span className="text-xs font-medium">
                                                                                        {disbursement.po_numbers[0]}
                                                                                    </span>
                                                                                    {disbursement.po_numbers.length > 1 && (
                                                                                        <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                                                                                            +{disbursement.po_numbers.length - 1}
                                                                                        </Badge>
                                                                                    )}
                                                                                </div>
                                                                            ) : null}
                                                                            {disbursement.invoice_numbers && disbursement.invoice_numbers.length > 0 ? (
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <Receipt className="h-3.5 w-3.5 text-purple-600" />
                                                                                    <span className="text-xs text-gray-600">
                                                                                        {disbursement.invoice_numbers.length} invoice(s)
                                                                                    </span>
                                                                                </div>
                                                                            ) : null}
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        {disbursement.po_numbers && disbursement.po_numbers.length > 0 && (
                                                                            <div className="mb-2">
                                                                                <p className="font-semibold">POs:</p>
                                                                                {disbursement.po_numbers.map((po, idx) => (
                                                                                    <p key={idx} className="text-xs">{po}</p>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                        {disbursement.invoice_numbers && disbursement.invoice_numbers.length > 0 && (
                                                                            <div>
                                                                                <p className="font-semibold">Invoices:</p>
                                                                                {disbursement.invoice_numbers.map((inv, idx) => (
                                                                                    <p key={idx} className="text-xs">{inv}</p>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </TableCell>

                                                        {/* Aging */}
                                                        <TableCell>
                                                            {disbursement.max_aging ? (
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Badge className={cn('font-semibold', getAgingBadgeColor(disbursement.max_aging))}>
                                                                                {Math.round(disbursement.max_aging)} days
                                                                            </Badge>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>Average: {Math.round(disbursement.average_aging || 0)} days</p>
                                                                            <p>Maximum: {Math.round(disbursement.max_aging)} days</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            ) : (
                                                                <span className="text-xs text-gray-400">N/A</span>
                                                            )}
                                                        </TableCell>

                                                        {/* Printing Date */}
                                                        <TableCell>
                                                            {disbursement.date_check_printing ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Printer className="h-4 w-4 text-blue-600" />
                                                                    <span className="text-sm">
                                                                        {format(formatDate(disbursement.date_check_printing), 'MMM dd, yyyy')}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-sm text-gray-400">Not printed</span>
                                                            )}
                                                        </TableCell>

                                                        {/* Scheduled Date */}
                                                        <TableCell>
                                                            {disbursement.date_check_scheduled ? (
                                                                <div className="flex items-center gap-2">
                                                                    <CalendarIcon className="h-4 w-4 text-orange-600" />
                                                                    <span className="text-sm">
                                                                        {format(formatDate(disbursement.date_check_scheduled), 'MMM dd, yyyy')}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-sm text-gray-400">Not scheduled</span>
                                                            )}
                                                        </TableCell>

                                                        {/* Released Date */}
                                                        <TableCell>
                                                            {disbursement.date_check_released_to_vendor ? (
                                                                <div className="flex items-center gap-2">
                                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                                    <span className="text-sm">
                                                                        {format(formatDate(disbursement.date_check_released_to_vendor), 'MMM dd, yyyy')}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-sm text-gray-400">Not released</span>
                                                            )}
                                                        </TableCell>

                                                        {/* Status */}
                                                        <TableCell>
                                                            <Badge
                                                                variant={disbursement.status === 'released' ? 'success' : 'secondary'}
                                                                className={
                                                                    disbursement.status === 'released'
                                                                        ? 'bg-green-100 text-green-700'
                                                                        : 'bg-yellow-100 text-yellow-700'
                                                                }
                                                            >
                                                                {disbursement.status === 'released' ? 'Released' : 'Pending'}
                                                            </Badge>
                                                        </TableCell>

                                                        {/* Actions */}
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-8 w-8"
                                                                                onClick={() => router.visit(`/disbursements/${disbursement.id}`)}
                                                                            >
                                                                                <Eye className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>View Details</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>

                                                                {!disbursement.date_check_released_to_vendor && canWrite('disbursements') && (
                                                                    <>
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <Button
                                                                                        variant="default"
                                                                                        size="icon"
                                                                                        className="h-8 w-8"
                                                                                        onClick={() => handleQuickRelease(disbursement)}
                                                                                    >
                                                                                        <Zap className="h-4 w-4" />
                                                                                    </Button>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    <p>Quick Release</p>
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
                                                                                        onClick={() => router.visit(`/disbursements/${disbursement.id}/edit`)}
                                                                                    >
                                                                                        <Edit className="h-4 w-4" />
                                                                                    </Button>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    <p>Edit Disbursement</p>
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    </>
                                                                )}
                                                            </div>
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
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Bulk Action Floating Bar */}
                {selectedIds.length > 0 && viewMode === 'list' && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
                        <Card className="shadow-2xl border-2 border-blue-500">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="default" className="text-base px-3 py-1">
                                            {selectedIds.length} selected
                                        </Badge>
                                        <span className="text-sm text-gray-600">
                                            Total: {formatCurrency(getSelectedDisbursements().reduce((sum, d) => sum + (d.total_amount || 0), 0))}
                                        </span>
                                    </div>
                                    <div className="h-6 w-px bg-gray-300"></div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={handleBulkReleaseClick}
                                        >
                                            <Zap className="h-4 w-4 mr-2" />
                                            Release Selected ({selectedIds.length})
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedIds([])}
                                        >
                                            Clear Selection
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Quick Release Modal */}
                {selectedDisbursement && (
                    <QuickReleaseModal
                        disbursement={selectedDisbursement}
                        open={showQuickRelease}
                        onClose={() => {
                            setShowQuickRelease(false);
                            setSelectedDisbursement(null);
                        }}
                        onSuccess={() => {
                            setSelectedIds([]);
                        }}
                    />
                )}

                {/* Bulk Release Modal */}
                <BulkReleaseModal
                    selectedDisbursements={getSelectedDisbursements()}
                    open={showBulkRelease}
                    onClose={() => setShowBulkRelease(false)}
                    onSuccess={() => {
                        setSelectedIds([]);
                    }}
                />
            </div>
        </div>
    );
}
