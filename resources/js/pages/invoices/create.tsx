import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import CreateInvoice from '@/pages/invoices/components/CreateInvoice';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create Invoice',
        href: '/invoices/create',
    },
];

interface CreatePageProps{
    purchaseOrders:unknown[];
}


export default function CreatePoPage({purchaseOrders}: CreatePageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Invoice" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">

                    <CreateInvoice purchaseOrders={purchaseOrders} />

                </div>
            </div>
        </AppLayout>
    );
}
