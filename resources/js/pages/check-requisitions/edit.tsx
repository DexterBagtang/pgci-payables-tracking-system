import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import EditCheckRequisition from '@/pages/check-requisitions/components/EditCheckRequisition';

interface PageProps {
    checkRequisition: any;
    currentInvoices: unknown[];
    availableInvoices: unknown[];
    filters: unknown[];
    filterOptions: unknown[];
}

export default function EditInvoicesPage({ checkRequisition, currentInvoices, availableInvoices, filters,filterOptions }: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Check Requisitions',
            href: '/check-requisitions',
        },
        {
            title: checkRequisition?.requisition_number || 'Edit',
            href: `/check-requisitions/${checkRequisition?.id}`,
        },
        {
            title: 'Edit',
            href: '',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Check Requisition" />
            <div className="flex h-full flex-1 flex-col overflow-hidden">
                <EditCheckRequisition checkRequisition={checkRequisition} currentInvoices={currentInvoices} availableInvoices={availableInvoices} filters={filters} filterOptions={filterOptions} />
            </div>
        </AppLayout>
    );
}
