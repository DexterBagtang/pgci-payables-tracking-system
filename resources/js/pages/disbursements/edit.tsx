import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Disbursement, type CheckRequisition, type PaginatedData } from '@/types';
import { Head } from '@inertiajs/react';
import EditDisbursementFormWizard from './components/EditDisbursementFormWizard';

interface PageProps {
    disbursement: Disbursement;
    currentCheckRequisitions: CheckRequisition[];
    availableCheckRequisitions: PaginatedData<CheckRequisition>;
    filters: {
        search?: string;
    };
}

export default function EditDisbursementPage({
    disbursement,
    currentCheckRequisitions,
    availableCheckRequisitions,
    filters
}: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Disbursements',
            href: '/disbursements',
        },
        {
            title: disbursement.check_voucher_number,
            href: `/disbursements/${disbursement.id}`,
        },
        {
            title: 'Edit',
            href: '',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Disbursement ${disbursement.check_voucher_number}`} />
            <div className="flex h-full flex-1 flex-col">
                <EditDisbursementFormWizard
                    disbursement={disbursement}
                    currentCheckRequisitions={currentCheckRequisitions}
                    availableCheckRequisitions={availableCheckRequisitions}
                    filters={filters}
                />
            </div>
        </AppLayout>
    );
}
