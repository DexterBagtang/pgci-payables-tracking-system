import { Users, TrendingUp, Award, ArrowRight } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import WidgetError from '../shared/WidgetError';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';

interface VendorMetric {
    id: number;
    name: string;
    po_count: number;
    total_value: number;
    currency: 'PHP' | 'USD';
    category: 'SAP' | 'Manual';
}

interface VendorMetricsData {
    active_vendors: number;
    sap_vendors: number;
    manual_vendors: number;
    top_vendors: VendorMetric[];
}

const formatCurrency = (value: number, currency: 'PHP' | 'USD' = 'PHP') =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);

export default function VendorMetrics() {
    const { data, loading, error, refetch } = useDashboardWidget<VendorMetricsData>({
        endpoint: '/api/dashboard/purchasing/vendor-metrics'
    });

    if (loading) {
        return <WidgetSkeleton variant="list" title="Vendor Overview" />;
    }

    if (error || !data) {
        return (
            <DashboardCard
                title="Vendor Overview"
                description="Active vendor metrics"
                icon={Users}
            >
                <WidgetError message={error || 'Failed to load vendor metrics'} onRetry={refetch} />
            </DashboardCard>
        );
    }

    return (
        <DashboardCard
            title="Vendor Overview"
            description={`${data.active_vendors} active vendors • ${data.sap_vendors} SAP, ${data.manual_vendors} Manual`}
            icon={Users}
            actions={
                <Link href="/vendors">
                    <span className="text-xs text-muted-foreground hover:text-primary cursor-pointer flex items-center gap-1">
                        View All <ArrowRight className="h-3 w-3" />
                    </span>
                </Link>
            }
        >
            <div className="space-y-3">
                {/* Top Vendors */}
                {data.top_vendors && data.top_vendors.length > 0 ? (
                    <>
                        <div className="flex items-center gap-2 mb-2">
                            <Award className="h-4 w-4 text-amber-500" />
                            <span className="text-sm font-medium">Top Vendors by Volume</span>
                        </div>
                        <div className="space-y-2">
                            {data.top_vendors.map((vendor, index) => (
                                <Link key={vendor.id} href={`/vendors/${vendor.id}`}>
                                    <div className="flex items-center gap-3 p-2.5 rounded-md border bg-card hover:bg-accent transition-colors group">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                                            <span className="text-sm font-bold text-primary">
                                                {index + 1}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium text-sm truncate group-hover:text-primary">
                                                    {vendor.name}
                                                </p>
                                                <Badge variant="outline" className="text-xs">
                                                    {vendor.category}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <TrendingUp className="h-3 w-3" />
                                                <span>{vendor.po_count} POs</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold font-mono">
                                                {formatCurrency(vendor.total_value, vendor.currency)}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                        <p className="text-sm">No vendor data available</p>
                    </div>
                )}
            </div>
        </DashboardCard>
    );
}
