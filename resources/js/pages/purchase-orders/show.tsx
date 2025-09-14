import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import CreatePOForm from '@/pages/purchase-orders/components/CreatePOForm';
import EditPOForm from '@/pages/purchase-orders/components/EditPOForm';
import ShowPO from '@/pages/purchase-orders/components/ShowPO';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Show Purchase Order',
        href: 'edit',
    },
];

interface ShowPageProps{
    purchaseOrder: unknown[];
    vendors: unknown[];
    projects: unknown[];
    backUrl: string;
}


export default function CreatePoPage({purchaseOrder,vendors, projects,backUrl}: ShowPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Purchase Order`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">

                    {/*<CreatePOForm vendors={vendors} projects={projects} />*/}
                    {/*<EditPOForm purchaseOrder={purchaseOrder} vendors={vendors} projects={projects} />*/}
                    <ShowPO purchaseOrder={purchaseOrder} vendors={vendors} projects={projects} backUrl={backUrl}/>

                </div>
            </div>
        </AppLayout>
    );
}
