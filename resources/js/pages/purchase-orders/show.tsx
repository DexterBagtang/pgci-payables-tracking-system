import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { buildPurchaseOrderBreadcrumbs } from '@/lib/breadcrumbs';
import PODetails from '@/pages/purchase-orders/components/PODetails';

interface ShowPageProps {
    purchaseOrder: any;
    vendors: unknown[];
    projects: unknown[];
    backUrl: string;
}

export default function ShowPurchaseOrderPage({ purchaseOrder, vendors, projects, backUrl }: ShowPageProps) {
    // Build breadcrumbs based on referrer
    const breadcrumbs: BreadcrumbItem[] = buildPurchaseOrderBreadcrumbs(
        purchaseOrder,
        backUrl,
        'show'
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Purchase Order ${purchaseOrder.po_number || ''}`} />
            <PODetails purchaseOrder={purchaseOrder} vendors={vendors} projects={projects} backUrl={backUrl} />
        </AppLayout>
    );
}
