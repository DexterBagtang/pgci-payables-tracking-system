import { useState } from 'react';
import { Users, TrendingUp, FileText, ArrowUpDown } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import WidgetError from '../shared/WidgetError';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { VendorPerformanceData } from '@/types';
import { Label } from '@/components/ui/label';

type SortOption = 'committed' | 'outstanding' | 'invoiced' | 'paid' | 'invoice_count' | 'active_pos';

export default function VendorPerformanceWidget() {
    const [sortBy, setSortBy] = useState<SortOption>('committed');
    const { data, loading, error, refetch } = useDashboardWidget<VendorPerformanceData[]>({
        endpoint: '/api/dashboard/purchasing/vendor-performance'
    });

    if (loading) {
        return <WidgetSkeleton variant="table" title="Top Vendors by Commitment" />;
    }

    if (error || !data) {
        return (
            <DashboardCard
                title="Top Vendors by Commitment"
                description="Top 10 vendors by open PO value with invoice details"
                icon={Users}
            >
                <WidgetError message={error || 'Failed to load vendor data'} onRetry={refetch} />
            </DashboardCard>
        );
    }

    const formatCurrency = (value: number, currency: string = 'PHP') => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };


    const getOutstandingBadge = (vendor: VendorPerformanceData) => {
        const { outstanding_balance, total_committed, invoice_count, total_invoiced } = vendor;
        const percentage = total_committed > 0 ? (outstanding_balance / total_committed) * 100 : 0;

        // No invoices yet - show pending status
        if (invoice_count === 0 || total_invoiced === 0) {
            return <Badge variant="secondary" className="text-xs">Pending</Badge>;
        }

        // Has invoices but all settled
        if (outstanding_balance === 0) {
            return <Badge variant="outline" className="text-xs">Settled</Badge>;
        } else if (percentage > 80) {
            return <Badge variant="destructive" className="text-xs">High</Badge>;
        } else if (percentage > 50) {
            return <Badge variant="secondary" className="text-xs">Medium</Badge>;
        } else {
            return <Badge variant="default" className="text-xs">Low</Badge>;
        }
    };

    const sortData = (data: VendorPerformanceData[], sortOption: SortOption): VendorPerformanceData[] => {
        return [...data].sort((a, b) => {
            switch (sortOption) {
                case 'committed':
                    return b.total_committed - a.total_committed;
                case 'outstanding':
                    return b.outstanding_balance - a.outstanding_balance;
                case 'invoiced':
                    return b.total_invoiced - a.total_invoiced;
                case 'paid':
                    return b.total_paid - a.total_paid;
                case 'invoice_count':
                    return b.invoice_count - a.invoice_count;
                case 'active_pos':
                    return b.active_pos - a.active_pos;
                default:
                    return 0;
            }
        });
    };

    const sortedData = sortData(data, sortBy);
    const isEmpty = data.length === 0;

    const sortingControl = (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Sort by:
                </Label>
            </div>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-max-[260px] h-9">
                    <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="committed">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-3 w-3" />
                            <span>Total Committed</span>
                        </div>
                    </SelectItem>
                    <SelectItem value="outstanding">
                        <div className="flex items-center gap-2">
                            <span className="text-orange-600">●</span>
                            <span>Outstanding Balance</span>
                        </div>
                    </SelectItem>
                    <SelectItem value="invoiced">
                        <div className="flex items-center gap-2">
                            <FileText className="h-3 w-3" />
                            <span>Total Invoiced</span>
                        </div>
                    </SelectItem>
                    <SelectItem value="paid">
                        <div className="flex items-center gap-2">
                            <span className="text-green-600">●</span>
                            <span>Total Paid</span>
                        </div>
                    </SelectItem>
                    <SelectItem value="invoice_count">
                        <div className="flex items-center gap-2">
                            <span>#</span>
                            <span>Invoice Count</span>
                        </div>
                    </SelectItem>
                    <SelectItem value="active_pos">
                        <div className="flex items-center gap-2">
                            <span>#</span>
                            <span>Active POs</span>
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    );

    return (
        <DashboardCard
            title="Top Vendors by Commitment"
            description="Top 10 vendors by open PO value with invoice details"
            icon={Users}
            actions={sortingControl}
        >
            {isEmpty ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <p className="text-sm">No vendor data available</p>
                </div>
            ) : (
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="min-w-[180px]">Vendor</TableHead>
                                <TableHead className="text-center min-w-[80px]">
                                    <div className="flex items-center justify-center gap-1">
                                        <FileText className="h-3 w-3" />
                                        <span className="hidden sm:inline">POs</span>
                                    </div>
                                </TableHead>
                                <TableHead className="text-right min-w-[120px]">
                                    <div className="flex items-center justify-end gap-1">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>Committed</span>
                                    </div>
                                </TableHead>
                                <TableHead className="text-center min-w-[90px]">Invoices</TableHead>
                                <TableHead className="text-right min-w-[120px]">Invoiced</TableHead>
                                <TableHead className="text-right min-w-[120px]">Paid</TableHead>
                                <TableHead className="text-right min-w-[140px]">Outstanding</TableHead>
                                <TableHead className="text-center min-w-[90px]">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedData.map((vendor, index) => (
                                <TableRow key={vendor.vendor_id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-start gap-2">
                                            <Badge variant="outline" className="font-mono text-xs mt-0.5">
                                                #{index + 1}
                                            </Badge>
                                            <div className="flex flex-col">
                                                <span className="text-sm">{vendor.vendor_name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    ID: {vendor.vendor_id}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className="font-mono text-xs">
                                            {vendor.active_pos}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-sm">
                                        <div className="flex flex-col items-end">
                                            <span className="font-semibold">
                                                {formatCurrency(vendor.total_committed, vendor.currency)}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {vendor.currency}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary" className="font-mono text-xs">
                                            {vendor.invoice_count}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-sm">
                                        {vendor.total_invoiced > 0 ? (
                                            <div className="flex flex-col items-end">
                                                <span>{formatCurrency(vendor.total_invoiced, vendor.currency)}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {((vendor.total_invoiced / vendor.total_committed) * 100).toFixed(0)}% of PO
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-sm">
                                        {vendor.total_paid > 0 ? (
                                            <div className="flex flex-col items-end">
                                                <span className="text-green-600 dark:text-green-400">
                                                    {formatCurrency(vendor.total_paid, vendor.currency)}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {vendor.total_invoiced > 0
                                                        ? `${((vendor.total_paid / vendor.total_invoiced) * 100).toFixed(0)}% paid`
                                                        : '—'}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-sm">
                                        {vendor.outstanding_balance > 0 ? (
                                            <div className="flex flex-col items-end">
                                                <span className="font-semibold text-orange-600 dark:text-orange-400">
                                                    {formatCurrency(vendor.outstanding_balance, vendor.currency)}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {vendor.total_committed > 0
                                                        ? `${((vendor.outstanding_balance / vendor.total_committed) * 100).toFixed(0)}% of PO`
                                                        : '—'}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {getOutstandingBadge(vendor)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </DashboardCard>
    );
}
