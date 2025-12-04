import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import ShowDisbursement from './components/ShowDisbursement';

interface PageProps {
    disbursement: any;
    checkRequisitions: any[];
    files: any[];
    financialMetrics: {
        total_amount: number;
        check_requisition_count: number;
        invoice_count: number;
        payee_count: number;
    };
    payees: any[];
    projects: any[];
    accounts: string[];
}

export default function ShowDisbursementPage({
    disbursement,
    checkRequisitions,
    files,
    financialMetrics,
    payees,
    projects,
    accounts,
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
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Disbursement ${disbursement.check_voucher_number}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <ShowDisbursement
                        disbursement={disbursement}
                        checkRequisitions={checkRequisitions}
                        files={files}
                        financialMetrics={financialMetrics}
                        payees={payees}
                        projects={projects}
                        accounts={accounts}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
