import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import PurchaseOrderTable from '@/pages/purchase-orders/components/PurchaseOrderTable';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Purchase Orders',
        href: '/purchase-orders',
    },
];

interface PoPageProps {
    purchaseOrders: unknown[];
    filters: unknown[];
    filterOptions: unknown[];
}

export default function PurchaseOrdersPage({ purchaseOrders,filters,filterOptions }: PoPageProps) {
    // console.log(purchaseOrders);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Purchase Orders" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/*<div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">*/}
                    <PurchaseOrderTable purchaseOrders={purchaseOrders} filters={filters} filterOptions={filterOptions} />
                {/*</div>*/}
            </div>
        </AppLayout>
    );
}
