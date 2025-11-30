import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import ShowInvoice from "@/pages/invoices/components/ShowInvoice";

interface ShowPageProps{
    invoice:any;
}


export default function ShowPoPage({invoice}: ShowPageProps) {
    // Build breadcrumbs with purchase order context if available
    const breadcrumbs: BreadcrumbItem[] = invoice?.purchaseOrder
        ? [
            {
                title: 'Purchase Orders',
                href: '/purchase-orders',
            },
            {
                title: invoice.purchaseOrder.po_number || 'PO',
                href: `/purchase-orders/${invoice.purchaseOrder.id}`,
            },
            {
                title: invoice.si_number || 'Details',
                href: `/invoices/${invoice.id}`,
            },
        ]
        : [
            {
                title: 'Invoices',
                href: '/invoices',
            },
            {
                title: invoice?.si_number || 'Details',
                href: `/invoices/${invoice?.id}`,
            },
        ];

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
