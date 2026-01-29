import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchModal } from './search-modal';
import { HelpCircle, Search, BookOpen, MessageCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { show } from '@/routes/help';

interface Manual {
    slug: string;
    title: string;
    description: string;
    category: string;
    readTime: number;
    icon: string;
}

interface FloatingHelpWidgetProps {
    manuals: Manual[];
    suggestedGuides?: string[]; // Slugs of suggested guides based on current page
}

export function FloatingHelpWidget({ manuals, suggestedGuides = [] }: FloatingHelpWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    // Get suggested manual objects
    const suggested = suggestedGuides
        .map(slug => manuals.find(m => m.slug === slug))
        .filter(Boolean) as Manual[];

    return (
        <>
            {/* Floating Button */}
            <div className="fixed bottom-6 right-6 z-40 print:hidden">
                <Button
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-lg"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <HelpCircle className="h-6 w-6" />
                </Button>

                {/* Help Menu */}
                {isOpen && (
                    <Card className="absolute bottom-16 right-0 w-80 shadow-xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Quick Help</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* Search */}
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => {
                                    setSearchOpen(true);
                                    setIsOpen(false);
                                }}
                            >
                                <Search className="mr-2 h-4 w-4" />
                                Search documentation
                            </Button>

                            {/* Suggested Guides */}
                            {suggested.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Related Guides
                                    </p>
                                    {suggested.map((guide) => (
                                        <Link
                                            key={guide.slug}
                                            href={show({ slug: guide.slug })}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start text-sm h-auto py-2"
                                            >
                                                <BookOpen className="mr-2 h-3 w-3 shrink-0" />
                                                <span className="text-left line-clamp-2">
                                                    {guide.title}
                                                </span>
                                            </Button>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* All Guides */}
                            <Link href="/help" onClick={() => setIsOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start">
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    View all guides
                                </Button>
                            </Link>

                            {/* Contact Support */}
                            <Button
                                variant="ghost"
                                className="w-full justify-start"
                                onClick={() => {
                                    // Could open a support modal or redirect to support page
                                    alert('Contact your system administrator for support');
                                    setIsOpen(false);
                                }}
                            >
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Contact support
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Search Modal */}
            <SearchModal open={searchOpen} onOpenChange={setSearchOpen} manuals={manuals} />
        </>
    );
}
