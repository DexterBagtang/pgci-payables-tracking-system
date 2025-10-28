import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import ShowInvoice from "@/pages/invoices/components/ShowInvoice";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Show Invoice',
        href: '/invoices/',
    },
];

interface ShowPageProps{
    invoice:unknown[];
}


export default function ShowPoPage({invoice}: ShowPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Show Invoice" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <ShowInvoice invoice={invoice} />
                </div>
            </div>
        </AppLayout>
    );
}
