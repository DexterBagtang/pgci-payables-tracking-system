import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
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
}

export default function ProjectsPage({ projects,filters }: ProjectsPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Projects" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/*<div className="grid auto-rows-min gap-4 md:grid-cols-3">*/}
                {/*    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">*/}
                {/*        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />*/}
                {/*    </div>*/}
                {/*    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">*/}
                {/*        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />*/}
                {/*    </div>*/}
                {/*    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">*/}
                {/*        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />*/}
                {/*    </div>*/}
                {/*</div>*/}
                {/*<div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">*/}
                {/*    <ProjectsTable projects={projects} filters={filters} />*/}
                {/*</div>*/}
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <ProjectsTable projects={projects} filters={filters} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
