import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import ProjectsTable from '@/pages/projects/components/ProjectsTable';
import ProjectShow from '@/pages/projects/components/ProjectShow';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Projects',
        href: 'projects',
    },
];

interface ProjectsPageProps {
    project: unknown[];
    filters: unknown[];
}

export default function ProjectsPageShow({ project }: ProjectsPageProps) {
    console.log(project);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Projects Details" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="py-6">
                    <div className="mx-auto sm:px-6 lg:px-8">
                        <ProjectShow project={project} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
