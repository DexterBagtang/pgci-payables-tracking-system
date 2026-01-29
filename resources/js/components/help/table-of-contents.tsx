import { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface TocItem {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
    const [activeId, setActiveId] = useState<string>('');

    // Parse headings from markdown content
    const headings = useMemo(() => {
        const items: TocItem[] = [];
        const headingRegex = /^(#{2,3})\s+(.+)$/gm;
        let match;

        while ((match = headingRegex.exec(content)) !== null) {
            const level = match[1].length;
            const text = match[2];
            const id = text
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-');

            items.push({ id, text, level });
        }

        return items;
    }, [content]);

    // Track scroll position and update active heading
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: '-80px 0px -80% 0px',
            }
        );

        // Observe all headings
        headings.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, [headings]);

    // Scroll to heading on click
    const scrollToHeading = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
                top: elementPosition - offset,
                behavior: 'smooth',
            });
        }
    };

    if (headings.length === 0) return null;

    return (
        <div className="space-y-2 rounded-lg border bg-card p-4">
            <p className="font-medium text-sm mb-3">On This Page</p>
            <nav className="space-y-1">
                {headings.map((heading) => (
                    <button
                        key={heading.id}
                        onClick={() => scrollToHeading(heading.id)}
                        className={cn(
                            'group flex w-full items-start gap-1 text-left text-sm transition-colors hover:text-foreground',
                            heading.level === 3 && 'pl-4',
                            activeId === heading.id
                                ? 'font-medium text-foreground'
                                : 'text-muted-foreground'
                        )}
                    >
                        <ChevronRight
                            className={cn(
                                'mt-0.5 h-3 w-3 shrink-0 transition-transform',
                                activeId === heading.id && 'rotate-90'
                            )}
                        />
                        <span className="line-clamp-2">{heading.text}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}
