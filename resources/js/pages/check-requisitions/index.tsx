import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import InvoicesTable from '@/pages/invoices/components/InvoicesTable';
import BulkInvoiceReview from '@/pages/invoices/components/BulkInvoiceReview';
import CheckRequisitionForm from '@/pages/invoices/components/CheckRequisitionForm';
import InvoiceReview from '@/pages/invoices/components/InvoiceReview';
import InvoicePreview from '@/pages/invoices/components/InvoicePreview';
import CheckReqTable from '@/pages/check-requisitions/components/CheckReqTable';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Check Requisition',
        href: '/check-requisitions',
    },
];

interface PageProps {
    checkRequisitions: unknown[];
    filters: unknown[];
    filterOptions: unknown[];
}

export default function ReviewInvoicesPage({ checkRequisitions, filters, filterOptions }: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Check Requisitions" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <CheckReqTable checkRequisitions={checkRequisitions} filters={filters} filterOptions={filterOptions} />
            </div>
        </AppLayout>
    );
}
