import AppLayout from '@/layouts/app-layout';
import HelpLayout from '@/layouts/help/layout';
import { MarkdownRenderer } from '@/lib/markdown';
import { TableOfContents } from '@/components/help/table-of-contents';
import { ReadingProgress } from '@/components/help/reading-progress';
import { FeedbackWidget } from '@/components/help/feedback-widget';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

interface Category {
    key: string;
    title: string;
    description: string;
    icon: string;
}

interface Manual {
    slug: string;
    title: string;
    description: string;
    content: string;
    category: string;
    readTime: number;
    icon: string;
}

interface Props {
    manual: Manual;
    manuals: Manual[];
    categories: Category[];
}

export default function HelpShow({ manual, manuals, categories }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Help', href: '/help' },
        { title: manual.title, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${manual.title} - Help`} />
            <ReadingProgress />
            <HelpLayout
                manuals={manuals}
                categories={categories}
                rightSidebar={<TableOfContents content={manual.content} />}
            >
                {/* Main Content Area */}
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground print:hidden">
                        <span>{manual.readTime} min read</span>
                        <span>•</span>
                        <span>{manual.pageCount} sections</span>
                    </div>

                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        <MarkdownRenderer content={manual.content} />
                    </div>

                    {/* Feedback Widget */}
                    <FeedbackWidget manualSlug={manual.slug} />
                </div>
            </HelpLayout>
        </AppLayout>
    );
}
