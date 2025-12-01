import AppLayout from '@/layouts/app-layout';
import ShowCheckRequisition from '@/pages/check-requisitions/components/ShowCheckRequisition';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

interface PageProps {
    checkRequisition: any;
    invoices: unknown[];
    files: unknown[];
    purchaseOrder: unknown[];
}

export default function ReviewInvoicesPage({ checkRequisition, invoices, files, purchaseOrder }: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Check Requisitions',
            href: '/check-requisitions',
        },
        {
            title: checkRequisition?.requisition_number || 'Details',
            href: `/check-requisitions/${checkRequisition?.id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Check Requisition Details" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <ShowCheckRequisition
                    checkRequisition={checkRequisition}
                    invoices={invoices}
                    files={files}
                    purchaseOrder={purchaseOrder}
                />
            </div>
        </AppLayout>
    );
}
