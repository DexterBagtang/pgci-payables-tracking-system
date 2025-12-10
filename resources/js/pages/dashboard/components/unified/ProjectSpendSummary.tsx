import { FolderKanban, ShoppingCart, TrendingUp, Banknote, DollarSign } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import WidgetError from '../shared/WidgetError';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
import type { ProjectSpendItem } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

export default function ProjectSpendSummary() {
    const { data, loading, error, refetch, isRefetching } = useDashboardWidget<ProjectSpendItem[]>({
        endpoint: '/api/dashboard/unified/project-spend',
    });

    if (loading) {
        return <WidgetSkeleton variant="table" />;
    }

    if (error || !data) {
        return <WidgetError message={error || 'Failed to load project data'} onRetry={refetch} />;
    }

    return (
        <DashboardCard
            title="Project Spend Summary"
            description="Top 5 projects by budget"
            icon={FolderKanban}
            isRefreshing={isRefetching}
        >
            <div className="space-y-4">
                {data.length > 0 ? (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Project</TableHead>
                                    <TableHead className="text-right">PO</TableHead>
                                    <TableHead className="text-right">Invoiced</TableHead>
                                    <TableHead className="text-right">Paid</TableHead>
                                    <TableHead className="text-right">Remaining</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((project, index) => {
                                    const paidPercentage = project.total_po > 0 ? (project.total_paid / project.total_po) * 100 : 0;

                                    return (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-medium max-w-[200px] truncate" title={project.project_name}>
                                                        {project.project_name}
                                                    </div>
                                                    <Progress value={paidPercentage} className="h-1" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <ShoppingCart className="h-3 w-3 text-blue-600" />
                                                    <span className="text-sm font-medium">{formatCurrency(project.total_po)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <TrendingUp className="h-3 w-3 text-purple-600" />
                                                    <span className="text-sm">{formatCurrency(project.total_invoiced)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Banknote className="h-3 w-3 text-green-600" />
                                                    <span className="text-sm">{formatCurrency(project.total_paid)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <DollarSign className="h-3 w-3 text-orange-600" />
                                                    <span className="text-sm font-semibold">{formatCurrency(project.remaining)}</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                        No active projects with spending data
                    </div>
                )}
            </div>
        </DashboardCard>
    );
}
