import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import CreateSingleInvoice from '@/pages/invoices/components/CreateSingleInvoice.jsx';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Invoices',
        href: '/invoices',
    },
    {
        title: 'Create',
        href: '/invoices/create',
    },
];

interface CreatePageProps{
    purchaseOrders: unknown[];
    vendors: unknown[];
    projects: unknown[];
}


export default function CreatePoPage({purchaseOrders, vendors, projects}: CreatePageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Invoice" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">

                    <CreateSingleInvoice
                        purchaseOrders={purchaseOrders}
                        vendors={vendors}
                        projects={projects}
                    />

                </div>
            </div>
        </AppLayout>
    );
}
