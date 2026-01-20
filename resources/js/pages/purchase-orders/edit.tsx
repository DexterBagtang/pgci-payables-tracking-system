import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import EditPOForm from '@/pages/purchase-orders/components/EditPOForm';
import { buildPurchaseOrderBreadcrumbs } from '@/lib/breadcrumbs';

interface EditPageProps{
    purchaseOrder: any;
    vendors: unknown[];
    projects: unknown[];
    backUrl: string;
}


export default function CreatePoPage({purchaseOrder,vendors, projects, backUrl}: EditPageProps) {
    // Build breadcrumbs based on referrer
    const breadcrumbs: BreadcrumbItem[] = buildPurchaseOrderBreadcrumbs(
        purchaseOrder,
        backUrl,
        'edit'
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Purchase Order - ${purchaseOrder.po_number}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 md:p-6">
                {/* Page Header */}
                <div className="mb-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                            Edit Purchase Order
                        </h1>
                        <span className="rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                            {purchaseOrder.po_number}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        Update the purchase order details below
                    </p>
                </div>

                {/* Form Container with better styling */}
                <div className="relative flex-1 rounded-xl border border-gray-200 bg-white shadow-sm md:min-h-min">
                    <div className="p-6">
                        <EditPOForm purchaseOrder={purchaseOrder} vendors={vendors} projects={projects} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
