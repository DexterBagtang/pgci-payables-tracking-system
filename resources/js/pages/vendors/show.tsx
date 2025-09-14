import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import VendorsTable from '@/pages/vendors/components/VendorsTable';
import ShowVendor from '@/pages/vendors/components/ShowVendor';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Show Vendor',
        href: "/vendors",
    },
];

interface VendorsProp {
    vendor: unknown[];
    filters: unknown[];
    backUrl: string;
}

export default function VendorShow({vendor,backUrl}: VendorsProp) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vendors" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/*<div className="min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">*/}
                {/*    <VendorsTable vendors={vendors} filters={filters} />*/}
                {/*</div>*/}
                {/*<div className="py-12">*/}
                {/*    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">*/}
                {/*    </div>*/}
                {/*</div>*/}
                <ShowVendor vendor={vendor} backUrl={backUrl} />
            </div>
        </AppLayout>
    );
}
