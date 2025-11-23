import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import EditCheckRequisition from '@/pages/check-requisitions/components/EditCheckRequisition';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Show Check Requisition',
        href: '/check-requisitions',
    },
];

interface PageProps {
    checkRequisition: unknown[];
    currentInvoices: unknown[];
    availableInvoices: unknown[];
    filters: unknown[];
    filterOptions: unknown[];
}

export default function EditInvoicesPage({ checkRequisition, currentInvoices, availableInvoices, filters,filterOptions }: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Check Requisition" />
            <div className="flex h-full flex-1 flex-col overflow-hidden">
                <EditCheckRequisition checkRequisition={checkRequisition} currentInvoices={currentInvoices} availableInvoices={availableInvoices} filters={filters} filterOptions={filterOptions} />
            </div>
        </AppLayout>
    );
}
