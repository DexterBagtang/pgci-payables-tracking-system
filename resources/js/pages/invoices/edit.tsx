import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import EditInvoice from "@/pages/invoices/components/EditInvoice";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Edit Invoice',
        href: '/invoices/edit',
    },
];

interface EditPageProps{
    invoice:unknown[];
    purchaseOrders:unknown[];
}


export default function EditPoPage({invoice,purchaseOrders}: EditPageProps) {
    console.log(purchaseOrders);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Invoice" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <EditInvoice invoice={invoice} purchaseOrders={purchaseOrders} />
                </div>
            </div>
        </AppLayout>
    );
}
