import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PaginatedData, type Vendor } from '@/types';
import { Head, router } from '@inertiajs/react';
import VendorsTable from '@/pages/vendors/components/VendorsTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

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
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    useEffect(() => {
        setSearchTerm(filters.search || '');
    }, [filters.search]);

    const handleSearch = () => {
        router.get(
            route('vendors.index'),
            { ...filters, search: searchTerm },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vendors" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="py-6">
                    <div className="mx-auto sm:px-6 lg:px-8">
                        <div className="mb-4 flex items-center space-x-2">
                            <Input
                                type="text"
                                placeholder="Search vendors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="max-w-sm"
                            />
                            <Button onClick={handleSearch}>Search</Button>
                        </div>
                        <VendorsTable vendors={vendors} filters={filters} stats={stats} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
