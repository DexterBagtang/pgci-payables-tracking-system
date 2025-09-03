import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import CreatePOForm from '@/pages/purchase-orders/components/CreatePOForm';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create Purchase Order',
        href: 'create',
    },
];

interface CreatePageProps{
    vendors: unknown[];
    projects: unknown[];
}


export default function CreatePoPage({vendors, projects}: CreatePageProps) {
    // console.log(purchaseOrders);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Purchase Order" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">

                    <CreatePOForm vendors={vendors} projects={projects} />

                </div>
            </div>
        </AppLayout>
    );
}
