import { Users } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { VendorPerformanceData } from '@/types';

interface VendorPerformanceWidgetProps {
    data: VendorPerformanceData[];
}

export default function VendorPerformanceWidget({ data }: VendorPerformanceWidgetProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const isEmpty = data.length === 0;

    return (
        <DashboardCard
            title="Top Vendors by Commitment"
            description="Top 5 vendors by open PO value"
            icon={Users}
        >
            {isEmpty ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <p className="text-sm">No vendor data available</p>
                </div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Vendor</TableHead>
                                <TableHead className="text-center">Active POs</TableHead>
                                <TableHead className="text-right">Total Committed</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((vendor) => (
                                <TableRow key={vendor.vendor_id}>
                                    <TableCell className="font-medium">
                                        {vendor.vendor_name}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {vendor.active_pos}
                                    </TableCell>
                                    <TableCell className="text-right font-mono">
                                        {formatCurrency(vendor.total_committed)}
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
