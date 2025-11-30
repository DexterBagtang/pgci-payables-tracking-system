import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import ShowVendor from '@/pages/vendors/components/ShowVendor.jsx';


interface ShowVendorsProp {
    vendor: any;
}

export default function VendorDetails({vendor,}: ShowVendorsProp) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Vendors',
            href: '/vendors',
        },
        {
            title: vendor?.name || 'Details',
            href: `/vendors/${vendor?.id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vendors" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <ShowVendor vendor={vendor} />
            </div>
        </AppLayout>
    );
}
