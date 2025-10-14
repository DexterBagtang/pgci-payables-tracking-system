import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import EditPOForm from '@/pages/purchase-orders/components/EditPOForm';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Edit Purchase Order',
        href: 'edit',
    },
];

interface EditPageProps{
    purchaseOrder: unknown[];
    vendors: unknown[];
    projects: unknown[];
}


export default function CreatePoPage({purchaseOrder,vendors, projects}: EditPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Purchase Order" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">

                    {/*<CreatePOForm vendors={vendors} projects={projects} />*/}
                    <EditPOForm purchaseOrder={purchaseOrder} vendors={vendors} projects={projects} />

                </div>
            </div>
        </AppLayout>
    );
}
