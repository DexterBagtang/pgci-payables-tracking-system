import AppLayout from '@/layouts/app-layout';
import HelpLayout from '@/layouts/help/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Head, Link } from '@inertiajs/react';
import { show } from '@/routes/help';
import { FileStack, CheckCircle2, FileText, Building2, FolderKanban, Receipt, Clock, FileIcon } from 'lucide-react';
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
    category: string;
    readTime: number;
    pageCount: number;
    lastUpdated: string;
    icon: string;
}

interface Props {
    manuals: Manual[];
    categories: Category[];
}

const iconMap: Record<string, typeof FileIcon> = {
    FileStack,
    CheckCircle2,
    FileText,
    Building2,
    FolderKanban,
    Receipt,
};

export default function HelpIndex({ manuals, categories }: Props) {
    return (
        <AppLayout>
            <Head title="Help & Documentation" />
            <HelpLayout manuals={manuals} categories={categories}>
                <div className="space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Available User Guides
                        </h2>
                        <p className="text-muted-foreground mt-2">
                            Step-by-step instructions for common tasks and workflows
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {manuals.map((manual) => {
                            const Icon = iconMap[manual.icon] || FileText;
                            const category = categories.find(c => c.key === manual.category);
                            return (
                                <Link
                                    key={manual.slug}
                                    href={show({ slug: manual.slug })}
                                >
                                    <Card className="group hover:shadow-md transition-all h-full">
                                        <CardContent className="p-6">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                                                    <Icon className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <h4 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                                                            {manual.title}
                                                        </h4>
                                                        {category && (
                                                            <Badge variant="secondary">
                                                                {category.title}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                                        {manual.description}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <FileText className="h-3 w-3" />
                                                            {manual.pageCount} sections
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {manual.readTime} min read
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            Updated {new Date(manual.lastUpdated).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>

                    {manuals.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            No guides are currently available for your role.
                        </div>
                    )}
                </div>
            </HelpLayout>
        </AppLayout>
    );
}
