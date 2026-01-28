import AppLayout from '@/layouts/app-layout';
import HelpLayout from '@/layouts/help/layout';
import { MarkdownRenderer } from '@/lib/markdown';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

interface Props {
    manual: {
        slug: string;
        title: string;
        content: string;
    };
    manuals: Array<{
        slug: string;
        title: string;
        description: string;
    }>;
}

export default function HelpShow({ manual, manuals }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Help', href: '/help' },
        { title: manual.title, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${manual.title} - Help`} />
            <HelpLayout manuals={manuals}>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <MarkdownRenderer content={manual.content} />
                </div>
            </HelpLayout>
        </AppLayout>
    );
}
