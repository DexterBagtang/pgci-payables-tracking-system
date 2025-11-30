import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import EditPOForm from '@/pages/purchase-orders/components/EditPOForm';
import { buildPurchaseOrderBreadcrumbs } from '@/lib/breadcrumbs';

interface EditPageProps{
    purchaseOrder: any;
    vendors: unknown[];
    projects: unknown[];
    backUrl: string;
}


export default function CreatePoPage({purchaseOrder,vendors, projects, backUrl}: EditPageProps) {
    // Build breadcrumbs based on referrer
    const breadcrumbs: BreadcrumbItem[] = buildPurchaseOrderBreadcrumbs(
        purchaseOrder,
        backUrl,
        'edit'
    );

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
