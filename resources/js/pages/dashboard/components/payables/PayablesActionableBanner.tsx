import { AlertCircle, FileCheck, FileSignature, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import { Link } from '@inertiajs/react';

interface ActionableItems {
    overdue_invoices: number;
    urgent_crs: number;
    critical_aging: number;
    pending_review_count: number;
}

export default function PayablesActionableBanner() {
    const { data, loading } = useDashboardWidget<ActionableItems>({
        endpoint: '/api/dashboard/payables/actionable-items'
    });

    if (loading) {
        return <WidgetSkeleton variant="banner" />;
    }

    if (!data) return null;

    const totalActionable = data.overdue_invoices + data.urgent_crs + data.critical_aging;

    // Only show if there are actionable items
    if (totalActionable === 0) return null;

    return (
        <Alert variant="destructive" className="border-orange-200 bg-orange-50 text-orange-900">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <AlertTitle className="text-base font-semibold mb-3">
                Action Required • {totalActionable} Critical Item{totalActionable !== 1 ? 's' : ''}
            </AlertTitle>
            <AlertDescription>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.overdue_invoices > 0 && (
                        <div className="flex items-start gap-3 p-3 bg-white/50 rounded-md border border-orange-200">
                            <FileCheck className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold text-sm">Overdue Invoices</p>
                                    <Badge variant="destructive" className="text-xs">
                                        {data.overdue_invoices}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">
                                    Invoices past due date awaiting review
                                </p>
                                <Link href="/invoices?filter=overdue">
                                    <Button size="sm" variant="outline" className="h-7 text-xs">
                                        Review Now
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}

                    {data.urgent_crs > 0 && (
                        <div className="flex items-start gap-3 p-3 bg-white/50 rounded-md border border-orange-200">
                            <FileSignature className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold text-sm">Urgent CRs</p>
                                    <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                                        {data.urgent_crs}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">
                                    Check requisitions pending &gt;7 days
                                </p>
                                <Link href="/check-requisitions?filter=urgent">
                                    <Button size="sm" variant="outline" className="h-7 text-xs">
                                        Approve Now
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}

                    {data.critical_aging > 0 && (
                        <div className="flex items-start gap-3 p-3 bg-white/50 rounded-md border border-orange-200">
                            <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold text-sm">Critical Aging</p>
                                    <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                                        {data.critical_aging}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">
                                    Approved invoices aging &gt;30 days
                                </p>
                                <Link href="/invoices?filter=critical-aging">
                                    <Button size="sm" variant="outline" className="h-7 text-xs">
                                        View Details
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </AlertDescription>
        </Alert>
    );
}
