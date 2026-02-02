import { useEffect, useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, FileText, Clock } from 'lucide-react';
import { router } from '@inertiajs/react';
import Fuse from 'fuse.js';
import { show } from '@/routes/help';
import { cn } from '@/lib/utils';

interface Manual {
    slug: string;
    title: string;
    description: string;
    content?: string;
    category: string;
}

interface SearchModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    manuals: Manual[];
}

export function SearchModal({ open, onOpenChange, manuals }: SearchModalProps) {
    const [query, setQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Load recent searches from localStorage
    useEffect(() => {
        const recent = localStorage.getItem('help-recent-searches');
        if (recent) {
            setRecentSearches(JSON.parse(recent));
        }
    }, []);

    // Reset selected index when query changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    // Setup Fuse.js for fuzzy search
    const fuse = useMemo(() => {
        return new Fuse(manuals, {
            keys: [
                { name: 'title', weight: 2 },
                { name: 'description', weight: 1.5 },
                { name: 'content', weight: 1 },
            ],
            threshold: 0.4,
            includeScore: true,
            includeMatches: true,
            minMatchCharLength: 2,
            ignoreLocation: true, // Search entire content, not just beginning
            distance: 10000, // Allow matches anywhere in long content
        });
    }, [manuals]);

    // Perform search
    const results = useMemo(() => {
        if (!query || query.length < 2) return [];
        return fuse.search(query).slice(0, 8);
    }, [query, fuse]);

    // Handle search selection
    const handleSelect = (slug: string) => {
        // Save to recent searches
        const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('help-recent-searches', JSON.stringify(updated));

        // Navigate to manual
        router.visit(show({ slug }));
        onOpenChange(false);
        setQuery('');
    };

    // Handle recent search click
    const handleRecentSearch = (search: string) => {
        setQuery(search);
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (results.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter' && selectedIndex >= 0 && results[selectedIndex]) {
            e.preventDefault();
            handleSelect(results[selectedIndex].item.slug);
        }
    };

    // Clear recent searches
    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('help-recent-searches');
    };

    // Highlight matching text in search results
    const highlightMatch = (text: string, query: string) => {
        if (!query) return text;

        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <mark key={index} className="bg-yellow-200 dark:bg-yellow-900 text-foreground">
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    // Get content snippet showing where the match was found
    const getContentSnippet = (content: string | undefined, query: string) => {
        if (!content || !query) return null;

        // Remove markdown syntax for cleaner display
        const cleanContent = content
            .replace(/^#{1,6}\s+/gm, '') // Remove headings
            .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
            .replace(/\*(.+?)\*/g, '$1') // Remove italic
            .replace(/`(.+?)`/g, '$1') // Remove inline code
            .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
            .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
            .replace(/^\s*\d+\.\s+/gm, ''); // Remove numbered lists

        const lowerContent = cleanContent.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const index = lowerContent.indexOf(lowerQuery);

        if (index === -1) return null;

        // Get surrounding context (50 chars before and after)
        const start = Math.max(0, index - 50);
        const end = Math.min(cleanContent.length, index + query.length + 50);
        let snippet = cleanContent.slice(start, end).trim();

        // Add ellipsis if needed
        if (start > 0) snippet = '...' + snippet;
        if (end < cleanContent.length) snippet = snippet + '...';

        return snippet;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl p-0">
                <DialogHeader className="p-4 pb-0">
                    <DialogTitle className="sr-only">Search Help</DialogTitle>
                </DialogHeader>
                <div className="flex items-center border-b px-4">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <Input
                        placeholder="Search help documentation..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        autoFocus
                    />
                    <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                        <span className="text-xs">Esc</span>
                    </kbd>
                </div>

                <ScrollArea className="max-h-[400px]">
                    {!query && recentSearches.length > 0 && (
                        <div className="p-4">
                            <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center text-xs font-medium text-muted-foreground">
                                    <Clock className="mr-1 h-3 w-3" />
                                    Recent Searches
                                </div>
                                <button
                                    onClick={clearRecentSearches}
                                    className="text-xs text-muted-foreground hover:text-foreground"
                                >
                                    Clear
                                </button>
                            </div>
                            <div className="space-y-1">
                                {recentSearches.map((search, index) => (
                                    <button
                                        key={index}
                                        className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                                        onClick={() => handleRecentSearch(search)}
                                    >
                                        {search}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {query && results.length === 0 && (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            No results found for "{query}"
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="p-2">
                            {results.map(({ item, matches }, index) => {
                                // Check if match was found in content
                                const contentMatch = matches?.find(m => m.key === 'content');
                                const snippet = contentMatch ? getContentSnippet(item.content, query) : null;

                                return (
                                    <button
                                        key={item.slug}
                                        className={cn(
                                            'flex w-full items-start gap-3 rounded-md p-3 hover:bg-accent',
                                            index === selectedIndex && 'bg-accent'
                                        )}
                                        onClick={() => handleSelect(item.slug)}
                                    >
                                        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                        <div className="flex-1 text-left">
                                            <div className="font-medium">{highlightMatch(item.title, query)}</div>
                                            <div className="text-sm text-muted-foreground line-clamp-2">
                                                {snippet
                                                    ? highlightMatch(snippet, query)
                                                    : highlightMatch(item.description, query)
                                                }
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>

                <div className="border-t p-3 text-xs text-muted-foreground">
                    <kbd className="rounded bg-muted px-1.5 py-0.5">↑↓</kbd> to navigate
                    <kbd className="ml-2 rounded bg-muted px-1.5 py-0.5">Enter</kbd> to select
                    <kbd className="ml-2 rounded bg-muted px-1.5 py-0.5">Esc</kbd> to close
                </div>
            </DialogContent>
        </Dialog>
    );
}
