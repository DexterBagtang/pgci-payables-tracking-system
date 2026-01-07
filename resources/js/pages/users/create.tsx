import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import UserForm from '@/pages/users/components/UserForm';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
    {
        title: 'Create',
        href: '/users/create',
    },
];

interface PageProps {
    roleOptions: Record<string, string>;
    modules: string[];
}

export default function CreateUser({ roleOptions, modules }: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="py-6">
                    <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                        <UserForm
                            roleOptions={roleOptions}
                            modules={modules}
                            isEdit={false}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
