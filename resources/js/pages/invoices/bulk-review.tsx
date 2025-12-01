import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import BulkInvoiceReview from '@/pages/invoices/components/BulkInvoiceReview';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Invoices',
        href: '/invoices',
    },
    {
        title: 'Bulk Review',
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
            <div className="flex h-full flex-1 flex-col overflow-hidden">
                <BulkInvoiceReview invoices={invoices} filters={filters} filterOptions={filterOptions} />
            </div>
        </AppLayout>
    );
}
