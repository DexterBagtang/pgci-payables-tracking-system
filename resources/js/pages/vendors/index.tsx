import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PaginatedData, type Vendor } from '@/types';
import { Head } from '@inertiajs/react';
import VendorsTable from '@/pages/vendors/components/VendorsTable';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Vendors',
        href: '/vendors',
    },
];

export interface VendorWithCounts extends Vendor {
    contact_person: string | null;
    category: 'SAP' | 'Manual';
    payment_terms: string | null;
    notes: string | null;
    created_by: number | null;
    purchase_orders_count: number;
    invoices_count: number;
}

export interface VendorFilters {
    search: string;
    status: string;
    category: string;
    sort_field: string;
    sort_direction: 'asc' | 'desc';
    per_page: number;
}

export interface VendorStats {
    total: number;
    active: number;
    inactive: number;
    sap: number;
    manual: number;
    recent: number;
}

interface VendorsIndexProps {
    vendors: PaginatedData<VendorWithCounts>;
    filters: VendorFilters;
    stats: VendorStats;
}

export default function VendorsIndex({ vendors, filters, stats }: VendorsIndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vendors" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="py-6">
                    <div className="mx-auto sm:px-6 lg:px-8">
                        <VendorsTable vendors={vendors} filters={filters} stats={stats} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
