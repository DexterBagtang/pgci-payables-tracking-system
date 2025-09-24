import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { lazy, Suspense } from 'react';
const CreatePOForm = lazy(()=> import('@/pages/purchase-orders/components/CreatePOForm'));

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create Purchase Order',
        href: 'create',
    },
];

interface CreatePageProps{
    vendors: unknown[];
    projects: unknown[];
    project_id: unknown;
}


export default function CreatePoPage({vendors, projects,project_id}: CreatePageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Purchase Order" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">

                    <Suspense fallback={null}>
                        <CreatePOForm vendors={vendors} projects={projects} project_id={project_id} />
                    </Suspense>

                </div>
            </div>
        </AppLayout>
    );
}
