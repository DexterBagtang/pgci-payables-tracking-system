import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { lazy, Suspense } from 'react';

const CreatePOForm = lazy(() => import('@/pages/purchase-orders/components/CreatePOForm'));

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Purchase Orders',
        href: '/purchase-orders',
    },
    {
        title: 'Create',
        href: '/purchase-orders/create',
    },
];

interface CreatePageProps {
    vendors: unknown[];
    projects: unknown[];
    project_id: unknown;
}

export default function CreatePoPage({ vendors, projects, project_id }: CreatePageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Purchase Order" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 md:p-6">
                {/* Page Header */}
                <div className="mb-2">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create Purchase Order</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Fill in the details below to create a new purchase order
                    </p>
                </div>

                {/* Form Container with better styling */}
                <div className="relative flex-1 rounded-xl border border-gray-200 bg-white shadow-sm md:min-h-min">
                    <div className="p-6">
                        <Suspense fallback={null}>
                            <CreatePOForm vendors={vendors} projects={projects} project_id={project_id} />
                        </Suspense>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
