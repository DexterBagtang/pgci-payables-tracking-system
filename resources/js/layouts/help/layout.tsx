import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SearchModal } from '@/components/help/search-modal';
import { KeyboardShortcutsDialog } from '@/components/help/keyboard-shortcuts-dialog';
import { ScrollToTop } from '@/components/help/scroll-to-top';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren, type ReactNode, useState, useEffect } from 'react';
import { index, show } from '@/routes/help';
import { Search, Home, Menu } from 'lucide-react';

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
    icon: string;
}

interface HelpLayoutProps extends PropsWithChildren {
    manuals: Manual[];
    categories: Category[];
    rightSidebar?: ReactNode;
}

// Navigation content component (reusable for sidebar and mobile menu)
function NavigationContent({
    currentPath,
    manualsByCategory,
    categories,
    isMac,
    onSearchOpen,
    onLinkClick,
}: {
    currentPath: string;
    manualsByCategory: Record<string, Manual[]>;
    categories: Category[];
    isMac: boolean;
    onSearchOpen: () => void;
    onLinkClick?: () => void;
}) {
    return (
        <div className="space-y-4 pb-10">
            {/* Search Button */}
            <Button
                variant="outline"
                className="w-full justify-start text-sm text-muted-foreground"
                onClick={onSearchOpen}
            >
                <Search className="mr-2 h-4 w-4" />
                Search...
                <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:inline-flex">
                    <span className="text-xs">{isMac ? '⌘K' : 'Ctrl+K'}</span>
                </kbd>
            </Button>

            <Separator />

            {/* Overview Link */}
            <nav className="space-y-1">
                <Link
                    href={index()}
                    onClick={onLinkClick}
                    className={cn(
                        'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted',
                        currentPath === index() ? 'bg-muted text-foreground' : 'text-muted-foreground'
                    )}
                >
                    <Home className="h-4 w-4" />
                    Overview
                </Link>
            </nav>

            <Separator />

            {/* Categorized Manuals */}
            <Accordion type="multiple" defaultValue={categories.map(c => c.key)} className="space-y-4">
                {categories.map((category) => (
                    <AccordionItem key={category.key} value={category.key} className="border-none">
                        <AccordionTrigger className="py-2 text-sm font-semibold hover:no-underline">
                            {category.title}
                        </AccordionTrigger>
                        <AccordionContent className="pb-2 pt-1">
                            <nav className="space-y-1">
                                {manualsByCategory[category.key]?.map((manual) => (
                                    <Link
                                        key={manual.slug}
                                        href={show({ slug: manual.slug })}
                                        onClick={onLinkClick}
                                        className={cn(
                                            'block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted',
                                            currentPath === show({ slug: manual.slug })
                                                ? 'bg-muted font-medium text-foreground'
                                                : 'text-muted-foreground'
                                        )}
                                    >
                                        {manual.title}
                                    </Link>
                                ))}
                            </nav>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}

export default function HelpLayout({ children, manuals, categories, rightSidebar }: HelpLayoutProps) {
    const [searchOpen, setSearchOpen] = useState(false);
    const [shortcutsOpen, setShortcutsOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMac, setIsMac] = useState(false);

    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    // Detect Mac platform
    useEffect(() => {
        setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform));
    }, []);

    // Group manuals by category
    const manualsByCategory = categories.reduce((acc, category) => {
        acc[category.key] = manuals.filter(m => m.category === category.key);
        return acc;
    }, {} as Record<string, Manual[]>);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }
            if (e.key === '/' && !searchOpen) {
                e.preventDefault();
                setSearchOpen(true);
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                window.print();
            }
            if (e.key === '?' && !searchOpen && !shortcutsOpen) {
                e.preventDefault();
                setShortcutsOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [searchOpen, shortcutsOpen]);

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 lg:px-8 py-6">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <Heading
                            title="Help & Documentation"
                            description="Guides and resources for using the Payables System"
                        />
                        {/* Mobile Menu Button */}
                        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className={cn(rightSidebar ? 'lg:hidden' : 'hidden')}>
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                                <SheetHeader>
                                    <SheetTitle>Navigation</SheetTitle>
                                </SheetHeader>
                                <div className="mt-4">
                                    <NavigationContent
                                        currentPath={currentPath}
                                        manualsByCategory={manualsByCategory}
                                        categories={categories}
                                        isMac={isMac}
                                        onSearchOpen={() => {
                                            setSearchOpen(true);
                                            setMobileMenuOpen(false);
                                        }}
                                        onLinkClick={() => setMobileMenuOpen(false)}
                                    />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
                <div className={cn('grid gap-6', rightSidebar ? 'grid-cols-1 lg:grid-cols-[240px_1fr] lg:gap-10 xl:grid-cols-[280px_1fr_280px] xl:gap-12' : 'grid-cols-[240px_1fr]')}>
                    {/* Left Sidebar - Navigation (Desktop) */}
                    <aside className={cn(rightSidebar ? 'hidden lg:block' : 'block')}>
                        <NavigationContent
                            currentPath={currentPath}
                            manualsByCategory={manualsByCategory}
                            categories={categories}
                            isMac={isMac}
                            onSearchOpen={() => setSearchOpen(true)}
                        />
                    </aside>

                    {/* Main Content */}
                    <main className="min-w-0 py-6 lg:py-8">
                        {children}
                    </main>

                    {/* Right Sidebar - TOC */}
                    {rightSidebar && (
                        <aside className="hidden xl:block pb-10">
                            {rightSidebar}
                        </aside>
                    )}
                </div>
            </div>

            {/* Search Modal */}
            <SearchModal open={searchOpen} onOpenChange={setSearchOpen} manuals={manuals} />

            {/* Keyboard Shortcuts Dialog */}
            <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

            {/* Scroll to Top Button */}
            <ScrollToTop />
        </div>
    );
}
