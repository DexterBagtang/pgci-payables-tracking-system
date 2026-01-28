import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { index, show } from '@/routes/help';

interface HelpLayoutProps extends PropsWithChildren {
    manuals: Array<{
        slug: string;
        title: string;
        description: string;
    }>;
}

export default function HelpLayout({ children, manuals }: HelpLayoutProps) {
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    // Build sidebar nav items from manuals
    const sidebarNavItems: NavItem[] = [
        {
            title: 'Overview',
            href: index(),
            icon: null,
        },
        ...manuals.map(manual => ({
            title: manual.title,
            href: show({ slug: manual.slug }),
            icon: null,
        })),
    ];

    return (
        <div className="px-4 py-6">
            <Heading
                title="Help & Documentation"
                description="Guides and resources for using the Payables System"
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-64">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${typeof item.href === 'string' ? item.href : item.href.url}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': currentPath === (typeof item.href === 'string' ? item.href : item.href.url),
                                })}
                            >
                                <Link href={item.href} prefetch>
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1">
                    <section className="max-w-4xl space-y-6">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
