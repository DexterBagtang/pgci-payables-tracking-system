import { Briefcase, TrendingUp, DollarSign, ArrowRight } from 'lucide-react';
import DashboardCard from '../shared/DashboardCard';
import WidgetSkeleton from '../shared/WidgetSkeleton';
import WidgetError from '../shared/WidgetError';
import { useDashboardWidget } from '@/hooks/useDashboardWidget';
import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProjectMetric {
    id: number;
    project_title: string;
    cer_number: string;
    project_type: 'sm_project' | 'philcom_project';
    total_contract_cost: number;
    total_spent: number;
    po_count: number;
    utilization_percentage: number;
}

interface ProjectMetricsData {
    active_projects: number;
    sm_projects: number;
    philcom_projects: number;
    top_projects: ProjectMetric[];
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        notation: value > 1000000 ? 'compact' : 'standard'
    }).format(value);

export default function ProjectMetrics() {
    const { data, loading, error, refetch } = useDashboardWidget<ProjectMetricsData>({
        endpoint: '/api/dashboard/purchasing/project-metrics'
    });

    if (loading) {
        return <WidgetSkeleton variant="list" title="Project Overview" />;
    }

    if (error || !data) {
        return (
            <DashboardCard
                title="Project Overview"
                description="Active project metrics"
                icon={Briefcase}
            >
                <WidgetError message={error || 'Failed to load project metrics'} onRetry={refetch} />
            </DashboardCard>
        );
    }

    return (
        <DashboardCard
            title="Project Overview"
            description={`${data.active_projects} active • ${data.sm_projects} SM, ${data.philcom_projects} Philcom`}
            icon={Briefcase}
            actions={
                <Link href="/projects">
                    <span className="text-xs text-muted-foreground hover:text-primary cursor-pointer flex items-center gap-1">
                        View All <ArrowRight className="h-3 w-3" />
                    </span>
                </Link>
            }
        >
            <div className="space-y-3">
                {data.top_projects && data.top_projects.length > 0 ? (
                    <>
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Top Projects by Spending</span>
                        </div>
                        <div className="space-y-3">
                            {data.top_projects.map((project) => (
                                <Link key={project.id} href={`/projects/${project.id}`}>
                                    <div className="p-3 rounded-md border bg-card hover:bg-accent transition-colors group">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-medium text-sm truncate group-hover:text-primary">
                                                        {project.project_title}
                                                    </p>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "text-xs",
                                                            project.project_type === 'sm_project'
                                                                ? "border-blue-300 text-blue-700"
                                                                : "border-purple-300 text-purple-700"
                                                        )}
                                                    >
                                                        {project.project_type === 'sm_project' ? 'SM' : 'Philcom'}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    CER: {project.cer_number} • {project.po_count} POs
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-xs text-muted-foreground">Budget</p>
                                                <p className="text-sm font-bold font-mono">
                                                    {formatCurrency(project.total_contract_cost)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Utilization Bar */}
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground">
                                                    Spent: {formatCurrency(project.total_spent)}
                                                </span>
                                                <span className={cn(
                                                    "font-medium",
                                                    project.utilization_percentage > 90 ? "text-red-600" :
                                                    project.utilization_percentage > 75 ? "text-orange-600" :
                                                    "text-green-600"
                                                )}>
                                                    {project.utilization_percentage.toFixed(1)}%
                                                </span>
                                            </div>
                                            <Progress
                                                value={project.utilization_percentage}
                                                className={cn(
                                                    "h-2",
                                                    project.utilization_percentage > 90 ? "[&>div]:bg-red-500" :
                                                    project.utilization_percentage > 75 ? "[&>div]:bg-orange-500" :
                                                    "[&>div]:bg-green-500"
                                                )}
                                            />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                        <p className="text-sm">No project data available</p>
                    </div>
                )}
            </div>
        </DashboardCard>
    );
}
