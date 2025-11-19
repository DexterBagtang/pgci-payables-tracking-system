import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import CreateDisbursementForm from '@/pages/disbursements/components/CreateDisbursementForm';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Disbursements',
        href: '/disbursements',
    },
    {
        title: 'Create',
        href: '/disbursements/create',
    },
];

interface PageProps {
    checkRequisitions: unknown[];
    filters: unknown[];
}

export default function CreateDisbursementPage({ checkRequisitions, filters }: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Disbursement" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <CreateDisbursementForm checkRequisitions={checkRequisitions} filters={filters} />
            </div>
        </AppLayout>
    );
}
