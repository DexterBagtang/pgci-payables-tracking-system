import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { lazy, Suspense } from 'react';
import { buildPurchaseOrderBreadcrumbs } from '@/lib/breadcrumbs';

const PODetails = lazy(() => import('@/pages/purchase-orders/components/PODetails'));

interface ShowPageProps{
    purchaseOrder: any;
    vendors: unknown[];
    projects: unknown[];
    backUrl: string;
}


export default function CreatePoPage({purchaseOrder,vendors, projects,backUrl}: ShowPageProps) {
    // Build breadcrumbs based on referrer
    const breadcrumbs: BreadcrumbItem[] = buildPurchaseOrderBreadcrumbs(
        purchaseOrder,
        backUrl,
        'show'
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Purchase Order`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
                        <PODetails purchaseOrder={purchaseOrder} vendors={vendors} projects={projects} backUrl={backUrl}/>
                    </Suspense>
                </div>
            </div>
        </AppLayout>
    );
}
