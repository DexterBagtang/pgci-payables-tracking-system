import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import UsersTable from '@/pages/users/components/UsersTable';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
];

interface PageProps {
    users: any;
    filters: {
        search?: string;
        role?: string;
        sort_field?: string;
        sort_direction?: string;
        per_page?: number;
    };
    stats: {
        total: number;
        admin: number;
        purchasing: number;
        payables: number;
        disbursement: number;
        recent: number;
    };
    roleOptions: Record<string, string>;
}

export default function UsersIndex({
    users,
    filters,
    stats,
    roleOptions
}: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="py-6">
                    <div className="mx-auto sm:px-6 lg:px-8">
                        <UsersTable
                            users={users}
                            filters={filters}
                            stats={stats}
                            roleOptions={roleOptions}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
