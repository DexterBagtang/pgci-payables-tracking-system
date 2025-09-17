import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import ShowVendor from '@/pages/vendors/components/ShowVendor.jsx';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Vendor',
        href: "vendors",
    },
];

interface ShowVendorsProp {
    vendor: unknown[];
    backUrl: string;
}

export default function VendorDetails({vendor,backUrl}: ShowVendorsProp) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vendors" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <ShowVendor vendor={vendor} backUrl={backUrl} />
            </div>
        </AppLayout>
    );
}
