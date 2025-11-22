import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import CheckRequisitionFormNew from '@/pages/invoices/components/CheckRequisitionFormNew';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Check Requisition',
        href: '/check-requisitions/create',
    },
];

interface InvoicePageProps {
    invoices: unknown[];
    filters: unknown[];
    filterOptions: unknown[];
}

export default function CheckRequisitionPage({ invoices, filters, filterOptions }: InvoicePageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Check Requisition" />
            <div className="flex h-full flex-1 flex-col overflow-hidden">
                <CheckRequisitionFormNew invoices={invoices} filters={filters} filterOptions={filterOptions} />
            </div>
        </AppLayout>
    );
}
