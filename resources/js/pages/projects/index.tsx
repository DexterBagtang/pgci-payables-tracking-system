import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import ProjectsTable from '@/pages/projects/components/ProjectsTable';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Projects',
        href: 'projects',
    },
];

interface ProjectsPageProps {
    projects: unknown[];
    filters: unknown[];
    stats: unknown[];
}

export default function ProjectsPage({ projects,filters,stats }: ProjectsPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Projects" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="py-6">
                    <div className="mx-auto sm:px-6 lg:px-8">
                        <ProjectsTable projects={projects} filters={filters} stats={stats} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
