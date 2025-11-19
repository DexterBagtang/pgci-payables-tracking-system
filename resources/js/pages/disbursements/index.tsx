import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import DisbursementsTable from '@/pages/disbursements/components/DisbursementsTable';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Disbursements',
        href: '/disbursements',
    },
];

interface PageProps {
    disbursements: unknown[];
    filters: unknown[];
}

export default function DisbursementsPage({ disbursements, filters }: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Disbursements" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <DisbursementsTable disbursements={disbursements} filters={filters} />
            </div>
        </AppLayout>
    );
}
