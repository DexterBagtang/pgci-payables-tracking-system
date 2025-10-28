import AppLayout from '@/layouts/app-layout';
import ShowCheckRequisition from '@/pages/check-requisitions/components/ShowCheckRequisition';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Show Check Requisition',
        href: '/check-requisitions',
    },
];

interface PageProps {
    checkRequisition: unknown[];
    invoices: unknown[];
    files: unknown[];
    purchaseOrder: unknown[];
}

export default function ReviewInvoicesPage({ checkRequisition, invoices, files, purchaseOrder }: PageProps) {
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
