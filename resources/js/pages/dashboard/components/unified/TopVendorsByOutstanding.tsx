import { Users, TrendingUp, FileText } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import WidgetError from '../shared/WidgetError';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
import type { TopVendorByOutstanding } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

const formatNumber = (value: number) => new Intl.NumberFormat('en-PH').format(value);

export default function TopVendorsByOutstanding() {
    const { data, loading, error, refetch, isRefetching } = useDashboardWidget<TopVendorByOutstanding[]>({
        endpoint: '/api/dashboard/unified/top-vendors',
    });

    if (loading) {
        return <WidgetSkeleton variant="table" />;
    }

    if (error || !data) {
        return <WidgetError message={error || 'Failed to load vendor data'} onRetry={refetch} />;
    }

    const totalOutstanding = data.reduce((sum, vendor) => sum + vendor.outstanding_amount, 0);
    const totalInvoices = data.reduce((sum, vendor) => sum + vendor.invoice_count, 0);

    return (
        <DashboardCard
            title="Top Vendors by Outstanding"
            description="Vendors with highest unpaid balances"
            icon={Users}
            isRefreshing={isRefetching}
        >
            <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border bg-card p-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <TrendingUp className="h-3 w-3" />
                            Total Outstanding
                        </div>
                        <div className="text-lg font-bold">{formatCurrency(totalOutstanding)}</div>
                    </div>
                    <div className="rounded-lg border bg-card p-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <FileText className="h-3 w-3" />
                            Total Invoices
                        </div>
                        <div className="text-lg font-bold">{formatNumber(totalInvoices)}</div>
                    </div>
                </div>

                {/* Vendors Table */}
                {data.length > 0 ? (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">#</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead className="text-right">Invoices</TableHead>
                                    <TableHead className="text-right">Outstanding</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((vendor, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">
                                            <Badge variant={index < 3 ? 'default' : 'secondary'}>
                                                {index + 1}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div className="max-w-[200px] truncate" title={vendor.vendor_name}>
                                                {vendor.vendor_name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-sm text-muted-foreground">
                                            {formatNumber(vendor.invoice_count)}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {formatCurrency(vendor.outstanding_amount)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                        No vendors with outstanding balances
                    </div>
                )}
            </div>
        </DashboardCard>
    );
}
