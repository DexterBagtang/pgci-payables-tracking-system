import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import ReviewCheckRequisition from '@/pages/check-requisitions/components/ReviewCheckRequisition';

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
    activityLogs: unknown[];
}

export default function ReviewInvoicesPage({ checkRequisition, invoices, files, activityLogs }: PageProps) {
    console.log(checkRequisition, invoices, files, activityLogs);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Check Requisition Details" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <ReviewCheckRequisition checkRequisition={checkRequisition} invoices={invoices} files={files} activityLogs={activityLogs} />
            </div>
        </AppLayout>
    );
}
