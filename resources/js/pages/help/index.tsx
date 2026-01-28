import AppLayout from '@/layouts/app-layout';
import HelpLayout from '@/layouts/help/layout';
import { Head, Link } from '@inertiajs/react';
import { show } from '@/routes/help';
import { BookOpen } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Manual {
    slug: string;
    title: string;
    description: string;
}

interface Props {
    manuals: Manual[];
}

export default function HelpIndex({ manuals }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Help', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Help & Documentation" />
            <HelpLayout manuals={manuals}>
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Available User Guides
                        </h2>
                        <p className="text-muted-foreground mt-2">
                            Step-by-step instructions for common tasks and workflows
                        </p>
                    </div>

                    <div className="grid gap-4">
                        {manuals.map((manual) => (
                            <Link
                                key={manual.slug}
                                href={show({ slug: manual.slug })}
                                className="block p-6 border rounded-lg hover:bg-accent transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                                    <h3 className="font-semibold text-lg">
                                        {manual.title}
                                    </h3>
                                </div>
                                <p className="text-muted-foreground mt-2">
                                    {manual.description}
                                </p>
                            </Link>
                        ))}
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
