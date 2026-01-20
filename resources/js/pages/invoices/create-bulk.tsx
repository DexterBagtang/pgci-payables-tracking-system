import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import CreateBulkInvoice from '@/pages/invoices/components/CreateBulkInvoice.jsx';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Invoices',
        href: '/invoices',
    },
    {
        title: 'Bulk Create',
        href: '/invoices/bulk/create',
    },
];

interface CreateBulkPageProps{
    purchaseOrders:unknown[];
}


export default function CreateBulkInvoicePage({purchaseOrders}: CreateBulkPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bulk Create Invoices" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">

                    <CreateBulkInvoice purchaseOrders={purchaseOrders} />

                </div>
            </div>
        </AppLayout>
    );
}
