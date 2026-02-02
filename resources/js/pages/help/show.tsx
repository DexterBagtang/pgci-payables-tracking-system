import AppLayout from '@/layouts/app-layout';
import HelpLayout from '@/layouts/help/layout';
import { MarkdownRenderer, statusColors, roleColors } from '@/lib/markdown';
import { TableOfContents } from '@/components/help/table-of-contents';
import { ReadingProgress } from '@/components/help/reading-progress';
import { FeedbackWidget } from '@/components/help/feedback-widget';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { cn } from '@/lib/utils';

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
    pageCount?: number;
    meta?: {
        roles: string[];
        statusFlow: string[];
        description: string;
    };
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
                <div className="space-y-5">
                    {/* Header */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground print:hidden">
                        <span>{manual.readTime} min read</span>
                        <span>•</span>
                        <span>{manual.pageCount} sections</span>
                    </div>

                    {/* Intro Card (if meta exists) */}
                    {manual.meta && (
                        <div className="rounded-xl border bg-card shadow-sm p-5 print:hidden">
                            <p className="text-sm text-muted-foreground mb-4">{manual.meta.description}</p>
                            <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-6">
                                {/* Roles */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Role</span>
                                    {manual.meta.roles.map((role: string) => (
                                        <span
                                            key={role}
                                            className={cn(
                                                'px-2.5 py-0.5 rounded-full text-xs font-semibold',
                                                roleColors[role.toLowerCase()] || 'bg-muted text-muted-foreground'
                                            )}
                                        >
                                            {role}
                                        </span>
                                    ))}
                                </div>

                                {/* Status Flow */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mr-1">Flow</span>
                                    {manual.meta.statusFlow.map((status: string, i: number) => (
                                        <span key={status} className="flex items-center gap-1.5">
                                            <span
                                                className={cn(
                                                    'px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                                                    statusColors[status.toLowerCase()] || 'bg-muted text-muted-foreground border-border'
                                                )}
                                            >
                                                {status}
                                            </span>
                                            {i < manual.meta.statusFlow.length - 1 && (
                                                <span className="text-muted-foreground text-xs">→</span>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Markdown Content */}
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
