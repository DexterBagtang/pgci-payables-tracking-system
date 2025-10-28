import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import CheckRequisitionForm from '@/pages/invoices/components/CheckRequisitionForm';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Check Requisition',
        href: '/invoices/bulk-review',
    },
];

interface InvoicePageProps {
    invoices: unknown[];
    filters: unknown[];
    filterOptions: unknown[];
}

export default function ReviewInvoicesPage({ invoices ,filters,filterOptions}: InvoicePageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invoices" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <CheckRequisitionForm invoices={invoices} filters={filters} filterOptions={filterOptions} />
                {/*<InvoicePreview />*/}
                {/*<div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">*/}
                {/*<InvoicesTable invoices={invoices} filters={filters} filterOptions={filterOptions} />*/}
                {/*<BulkInvoiceReview invoices={invoices} filters={filters} filterOptions={filterOptions} />*/}
                {/*</div>*/}
            </div>
        </AppLayout>
    );
}
