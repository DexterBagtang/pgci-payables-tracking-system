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
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Purchase Orders" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PurchaseOrderTable purchaseOrders={purchaseOrders} filters={filters} filterOptions={filterOptions} />
            </div>
        </AppLayout>
    );
}
