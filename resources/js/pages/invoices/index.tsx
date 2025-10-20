import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import PurchaseOrderTable from '@/pages/purchase-orders/components/PurchaseOrderTable';
import InvoicesTable from '@/pages/invoices/components/InvoicesTable';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Invoices',
        href: '/invoices',
    },
];

interface InvoicePageProps {
    invoices: unknown[];
    filters: unknown[];
    filterOptions: unknown[];
    statusCounts: Record<string, number>;
    currentPageTotal: number;
}

export default function InvoicePage({ invoices ,filters,filterOptions, statusCounts, currentPageTotal}: InvoicePageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invoices" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/*<div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">*/}
                    {/*<PurchaseOrderTable purchaseOrders={purchaseOrders} filters={filters} filterOptions={filterOptions} />*/}
                    <InvoicesTable invoices={invoices} filters={filters} filterOptions={filterOptions} statusCounts={statusCounts} currentPageTotal={currentPageTotal} />
                {/*</div>*/}
            </div>
        </AppLayout>
    );
}
