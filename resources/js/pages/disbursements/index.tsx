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
    disbursements: any;
    filters: {
        search?: string;
        status?: string;
        sort_by?: string;
        sort_order?: string;
        date_field?: string;
        date_from?: string;
        date_to?: string;
        vendor_id?: string;
        purchase_order_id?: string;
        check_requisition_id?: string;
        amount_min?: string;
        amount_max?: string;
    };
    filterOptions: {
        vendors?: any[];
        purchaseOrders?: any[];
        checkRequisitions?: any[];
    };
    statistics: {
        total: number;
        released: number;
        pending: number;
        scheduled: number;
        total_amount: number;
        released_amount: number;
        pending_amount: number;
        average_amount: number;
    };
}

export default function DisbursementsPage({
    disbursements,
    filters,
    filterOptions,
    statistics
}: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Disbursements" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <DisbursementsTable
                    disbursements={disbursements}
                    filters={filters}
                    filterOptions={filterOptions}
                    statistics={statistics}
                />
            </div>
        </AppLayout>
    );
}
