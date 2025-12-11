import { FileCheck, ShoppingCart, FileText, Receipt, CheckCircle, XCircle } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import WidgetError from '../shared/WidgetError';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
import type { ComplianceMissingDocuments } from '@/types';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const formatNumber = (value: number) => new Intl.NumberFormat('en-PH').format(value);

export default function DocumentAttachmentHealth() {
    const { data, loading, error, refetch, isRefetching } = useDashboardWidget<ComplianceMissingDocuments>({
        endpoint: '/api/dashboard/unified/compliance',
    });

    if (loading) {
        return <WidgetSkeleton variant="metrics" />;
    }

    if (error || !data) {
        return <WidgetError message={error || 'Failed to load document health data'} onRetry={refetch} />;
    }

    // Determine overall health color
    const getScoreColor = (score: number) => {
        if (score >= 90) return { text: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' };
        if (score >= 70) return { text: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' };
        return { text: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' };
    };

    const scoreColor = getScoreColor(data.overall_score);

    const entities = [
        {
            label: 'Purchase Orders',
            icon: ShoppingCart,
            completeness: data.po_completeness,
            total: data.total_pos,
            withFiles: data.pos_with_files,
            missing: data.pos_missing_attachments,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            label: 'Invoices',
            icon: FileText,
            completeness: data.invoice_completeness,
            total: data.total_invoices,
            withFiles: data.invoices_with_files,
            missing: data.invoices_missing_si,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
        {
            label: 'Check Requisitions',
            icon: Receipt,
            completeness: data.cr_completeness,
            total: data.total_crs,
            withFiles: data.crs_with_files,
            missing: data.crs_missing_docs,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
        },
    ];

    const totalMissing = data.pos_missing_attachments.length +
                        data.invoices_missing_si.length +
                        data.crs_missing_docs.length;

    const totalDocuments = data.total_pos + data.total_invoices + data.total_crs;
    const hasNoData = totalDocuments === 0;

    return (
        <DashboardCard
            title="Document Attachment Health"
            description="File completeness audit score"
            icon={FileCheck}
            isRefreshing={isRefetching}
        >
            <div className="space-y-4">
                {/* Overall Score */}
                <div className={`rounded-lg border ${scoreColor.border} ${scoreColor.bg} p-4`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Overall Completeness</span>
                        {!hasNoData && data.overall_score >= 90 ? (
                            <CheckCircle className={`h-5 w-5 ${scoreColor.text}`} />
                        ) : (
                            <XCircle className={`h-5 w-5 ${scoreColor.text}`} />
                        )}
                    </div>
                    <div className={`text-4xl font-bold ${scoreColor.text}`}>
                        {hasNoData ? '—' : `${data.overall_score.toFixed(1)}%`}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                        {hasNoData
                            ? 'No documents to track yet'
                            : totalMissing > 0
                            ? `${totalMissing} item${totalMissing !== 1 ? 's' : ''} need${totalMissing === 1 ? 's' : ''} attention`
                            : 'All documents attached!'}
                    </div>
                </div>

                {/* Entity Breakdown */}
                <div className="space-y-3">
                    {entities.map((entity) => {
                        const Icon = entity.icon;
                        const entityScoreColor = getScoreColor(entity.completeness);

                        return (
                            <div key={entity.label} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`flex h-8 w-8 items-center justify-center rounded ${entity.bgColor}`}>
                                            <Icon className={`h-4 w-4 ${entity.color}`} />
                                        </div>
                                        <span className="text-sm font-medium">{entity.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                            {formatNumber(entity.withFiles)} / {formatNumber(entity.total)}
                                        </span>
                                        <Badge className={entityScoreColor.bg + ' ' + entityScoreColor.text}>
                                            {entity.completeness.toFixed(0)}%
                                        </Badge>
                                    </div>
                                </div>
                                <Progress value={entity.completeness} className="h-1.5" />
                                {entity.missing.length > 0 && (
                                    <div className="text-xs text-muted-foreground pl-10">
                                        Missing: {entity.missing.slice(0, 3).map((item: any) =>
                                            Object.values(item)[1]
                                        ).join(', ')}
                                        {entity.missing.length > 3 && ` +${entity.missing.length - 3} more`}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Health Status Message */}
                {hasNoData ? (
                    <div className="text-center py-2 text-sm text-muted-foreground">
                        Start creating documents to track compliance
                    </div>
                ) : data.overall_score >= 90 ? (
                    <div className="text-center py-2 text-sm text-green-600 font-medium">
                        ✓ Excellent documentation compliance
                    </div>
                ) : data.overall_score >= 70 ? (
                    <div className="text-center py-2 text-sm text-yellow-600 font-medium">
                        ⚠ Some documents missing - review needed
                    </div>
                ) : (
                    <div className="text-center py-2 text-sm text-red-600 font-medium">
                        ✗ Critical - Many documents missing
                    </div>
                )}
            </div>
        </DashboardCard>
    );
}
