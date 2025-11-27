import { TrendingUp, AlertCircle } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ProjectBudgetData } from '@/types';

interface POBudgetTrackingProps {
    data: ProjectBudgetData[];
}

export default function POBudgetTracking({ data }: POBudgetTrackingProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'critical':
                return 'bg-red-500';
            case 'warning':
                return 'bg-yellow-500';
            default:
                return 'bg-green-500';
        }
    };

    const getStatusBadgeVariant = (status: string): 'default' | 'destructive' | 'secondary' => {
        switch (status) {
            case 'critical':
                return 'destructive';
            case 'warning':
                return 'secondary';
            default:
                return 'default';
        }
    };

    const isEmpty = data.length === 0;

    return (
        <DashboardCard
            title="Project Budget Tracking"
            description="Budget utilization per active project"
            icon={TrendingUp}
        >
            {isEmpty ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <p className="text-sm">No active projects with budgets</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {data.map((project) => (
                        <div key={project.project_id} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1">
                                    <h4 className="font-medium text-sm truncate">
                                        {project.project_title}
                                    </h4>
                                    {project.status !== 'normal' && (
                                        <Badge
                                            variant={getStatusBadgeVariant(project.status)}
                                            className="text-xs"
                                        >
                                            {project.percentage.toFixed(0)}%
                                        </Badge>
                                    )}
                                </div>
                                <div className="text-right text-sm text-muted-foreground whitespace-nowrap ml-4">
                                    {formatCurrency(project.committed)} / {formatCurrency(project.budget)}
                                </div>
                            </div>
                            <Progress
                                value={Math.min(project.percentage, 100)}
                                className="h-2"
                                indicatorClassName={getStatusColor(project.status)}
                            />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>
                                    {project.percentage.toFixed(1)}% utilized
                                </span>
                                <span>
                                    Remaining: {formatCurrency(project.remaining)}
                                </span>
                            </div>
                            {project.status === 'critical' && (
                                <div className="flex items-center gap-1 text-xs text-red-600">
                                    <AlertCircle className="h-3 w-3" />
                                    <span>Budget exceeded threshold (95%)</span>
                                </div>
                            )}
                            {project.status === 'warning' && (
                                <div className="flex items-center gap-1 text-xs text-yellow-600">
                                    <AlertCircle className="h-3 w-3" />
                                    <span>Approaching budget limit (80%)</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </DashboardCard>
    );
}
