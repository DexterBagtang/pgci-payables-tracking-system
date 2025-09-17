import { useState, useEffect, lazy, Suspense } from 'react';
import { router } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Search,
    FolderOpen,
    Plus,
    Edit,
    Calendar,
    DollarSign,
    FileText,
    Building
} from "lucide-react";
import PaginationServerSide from '@/components/custom/Pagination.jsx';

// Lazy load the heavy dialog components
const AddProjectDialog = lazy(() => import('@/pages/projects/components/AddProjectDialog.jsx'));
const EditProjectDialog = lazy(() => import('@/pages/projects/components/EditProjectDialog.jsx'));

export default function ProjectsTable({ projects, filters = {} }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [projectType, setProjectType] = useState(filters.project_type || '');
    const [projectStatus, setProjectStatus] = useState(filters.project_status || '');
    const [sortField, setSortField] = useState(filters.sort_field || '');
    const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'asc');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== filters.search) {
                handleFilterChange({ search: searchTerm, page: 1 });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleFilterChange = (newFilters) => {
        const updatedFilters = {
            ...filters,
            ...newFilters
        };

        // Remove empty filters
        Object.keys(updatedFilters).forEach(key => {
            if (!updatedFilters[key]) {
                delete updatedFilters[key];
            }
        });

        router.get('/projects', updatedFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSort = (field) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(newDirection);

        handleFilterChange({
            sort_field: field,
            sort_direction: newDirection,
            page: 1
        });
    };

    const getSortIcon = (field) => {
        if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
        return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    };

    const handleTypeChange = (value) => {
        setProjectType(value);
        handleFilterChange({ project_type: value, page: 1 });
    };

    const handleStatusChange = (value) => {
        setProjectStatus(value);
        handleFilterChange({ project_status: value, page: 1 });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setProjectType('');
        setProjectStatus('');
        setSortField('');
        setSortDirection('asc');
        handleFilterChange({ search: '', project_type: '', project_status: '', sort_field: '', sort_direction: '', page: 1 });
    };

    function handleEdit(project){
        setSelectedProject(project);
        setIsEditDialogOpen(true);
    }

    const hasActiveFilters = searchTerm || projectType || projectStatus || sortField;

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <FolderOpen className="h-5 w-5" />
                            Projects Management
                        </CardTitle>

                        <Suspense fallback={<Button className="gap-2" disabled><Plus className="h-4 w-4" />Add Project</Button>}>
                            <AddProjectDialog
                                trigger={
                                    <Button className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Add Project
                                    </Button>
                                }
                            />
                        </Suspense>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Search and Filters */}
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search projects by title, CER number, or SMPO number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            <Select value={projectType} onValueChange={handleTypeChange}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="All Project Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Project Types</SelectItem>
                                    <SelectItem value="sm_project">SM Project</SelectItem>
                                    <SelectItem value="philcom_project">PhilCom Project</SelectItem>
                                </SelectContent>
                            </Select>

                            {hasActiveFilters && (
                                <Button variant="outline" onClick={clearFilters}>
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('project_title')}
                                            className="h-auto p-0 font-semibold hover:bg-transparent"
                                        >
                                            Project Details {getSortIcon('project_title')}
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('total_project_cost')}
                                            className="h-auto p-0 font-semibold hover:bg-transparent"
                                        >
                                            Financial Details {getSortIcon('total_project_cost')}
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('project_type')}
                                            className="h-auto p-0 font-semibold hover:bg-transparent"
                                        >
                                            Project Type {getSortIcon('project_type')}
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('created_at')}
                                            className="h-auto p-0 font-semibold hover:bg-transparent"
                                        >
                                            Date Created {getSortIcon('created_at')}
                                        </Button>
                                    </TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {projects.data?.length > 0 ? (
                                    projects.data.map((project) => (
                                        <ProjectRow key={project.id} project={project} onEdit={handleEdit} />
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <div className="flex flex-col items-center gap-2">
                                                <FolderOpen className="h-8 w-8 text-muted-foreground" />
                                                <p className="text-muted-foreground">
                                                    {searchTerm || projectType || projectStatus ? 'No projects found matching your criteria.' : 'No projects found.'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <PaginationServerSide items={projects} onChange={handleFilterChange} />
                </CardContent>
            </Card>

            {/* Lazy-loaded Edit Dialog */}
            {selectedProject && (
                <Suspense fallback={null}>
                    <EditProjectDialog
                        key={selectedProject.id}
                        open={isEditDialogOpen}
                        setOpen={setIsEditDialogOpen}
                        project={selectedProject}
                    />
                </Suspense>
            )}
        </>
    );
}

function ProjectRow({ project, onEdit }) {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const getTypeColor = (type) => {
        const colors = {
            'sm_project': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700',
            'philcom_project': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700',
        };
        return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
    };

    return (
        <TableRow className="group transition-all hover:bg-muted/30 border-b border-gray-100 dark:border-gray-800">
            {/* Project Details */}
            <TableCell className="py-4 pl-4 pr-3 max-w-[500px]">
                <div className="flex items-start">
                    <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center mr-3">
                        <Building className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 dark:text-gray-100 truncate" title={project.project_title}>
                            {project.project_title}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <FileText className="h-3.5 w-3.5 mr-1.5" />
                            CER: {project.cer_number}
                        </div>
                    </div>
                </div>
            </TableCell>

            {/* Financial Details */}
            <TableCell className="px-3 py-4">
                <div className="space-y-1">
                    <div className="flex items-center text-sm">
                        <DollarSign className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                        <span className="font-medium">Project:</span>
                        <span className="ml-1">{formatCurrency(project.total_project_cost)}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <DollarSign className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                        <span className="font-medium">Contract:</span>
                        <span className="ml-1">{formatCurrency(project.total_contract_cost)}</span>
                    </div>
                </div>
            </TableCell>

            {/* Project Type */}
            <TableCell className="px-3 py-4">
                <div className="space-y-2">
                    <Badge
                        variant="secondary"
                        className={`rounded-md border ${getTypeColor(project.project_type)} px-2 py-0.5 text-xs font-medium`}
                    >
                        {project.project_type === 'sm_project' ? 'SM Project' : 'PhilCom Project'}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                        {project.project_type === 'sm_project'
                            ? project.smpo_number
                            : project.philcom_category?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                        }
                    </div>
                </div>
            </TableCell>

            {/* Date Created */}
            <TableCell className="px-3 py-4 text-xs text-muted-foreground">
                <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                    {formatDate(project.created_at)}
                </div>
            </TableCell>

            {/* Actions */}
            <TableCell className="px-3 py-4">
                <Button
                    onClick={() => onEdit(project)}
                    variant="ghost"
                    size="sm"
                    className="rounded-full h-8 w-8 p-0"
                    aria-label={`Edit ${project.project_title}`}
                >
                    <Edit className="h-4 w-4" />
                </Button>
            </TableCell>
        </TableRow>
    );
}
