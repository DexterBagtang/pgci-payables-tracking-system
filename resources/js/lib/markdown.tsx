import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import type { Components } from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, Copy, AlertCircle, Info, Lightbulb, AlertTriangle } from 'lucide-react';
import { useState, Children, isValidElement, Fragment } from 'react';
import { useCopyToClipboard } from 'react-use';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
    content: string;
}

// Helper to extract text content from React nodes
function getTextContent(node: React.ReactNode): string {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    if (isValidElement(node) && node.props?.children) {
        return getTextContent(node.props.children);
    }
    if (Array.isArray(node)) return node.map(getTextContent).join('');
    return '';
}

// Status color mappings
export const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    open: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800',
    closed: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800',
    cancelled: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800',
    pending: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-800',
    'pending approval': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-800',
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-800',
    rejected: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800',
    received: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900 dark:text-sky-300 dark:border-sky-800',
    paid: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-800',
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-800',
    inactive: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-800',
    'on hold': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-800',
    'pending disbursement': 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900 dark:text-violet-300 dark:border-violet-800',
};

// Role color mappings
export const roleColors: Record<string, string> = {
    admin: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
    purchasing: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    accounting: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    payables: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
};

const roleKeywords = ['Admin', 'Purchasing', 'Accounting', 'Payables'];

function CodeBlock({ children, className }: { children: string; className?: string }) {
    const [copied, setCopied] = useState(false);
    const [, copyToClipboard] = useCopyToClipboard();

    const handleCopy = () => {
        copyToClipboard(String(children));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const match = /language-(\w+)/.exec(className || '');

    return (
        <div className="relative group">
            <pre className="my-3 overflow-x-auto rounded-lg bg-muted p-4">
                <code className={`font-mono text-sm ${className || ''}`}>
                    {children}
                </code>
            </pre>
            {match && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleCopy}
                >
                    {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                    ) : (
                        <Copy className="h-4 w-4" />
                    )}
                </Button>
            )}
        </div>
    );
}

function StatusFlowBadges({ statuses }: { statuses: string[] }) {
    return (
        <div className="flex items-center gap-2 flex-wrap my-4 py-2.5 px-4 rounded-lg bg-muted/50 border">
            {statuses.map((status, index) => (
                <Fragment key={index}>
                    <span
                        className={cn(
                            'px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                            statusColors[status.toLowerCase()] || 'bg-muted text-muted-foreground border-border'
                        )}
                    >
                        {status}
                    </span>
                    {index < statuses.length - 1 && (
                        <span className="text-muted-foreground text-sm">→</span>
                    )}
                </Fragment>
            ))}
        </div>
    );
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            components={{
                h1: ({ children }) => {
                    const text = getTextContent(children);
                    const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
                    return (
                        <h1 id={id} className="scroll-m-20 text-3xl font-bold tracking-tight mb-3">
                            {children}
                        </h1>
                    );
                },
                h2: ({ children }) => {
                    const text = getTextContent(children);
                    const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
                    return (
                        <h2 id={id} className="scroll-m-20 border-b pb-1.5 text-xl font-semibold tracking-tight first:mt-0 mt-8 mb-2">
                            {children}
                        </h2>
                    );
                },
                h3: ({ children }) => {
                    const text = getTextContent(children);
                    const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
                    return (
                        <h3 id={id} className="scroll-m-20 text-base font-semibold tracking-tight mt-5 mb-1.5">
                            {children}
                        </h3>
                    );
                },
                h4: ({ children }) => (
                    <h4 className="scroll-m-20 text-sm font-semibold tracking-tight mt-4 mb-1.5">
                        {children}
                    </h4>
                ),
                p: ({ children }) => {
                    // Detect status flow by structure: alternating elements and '→' text nodes
                    const childArray = Children.toArray(children).filter(
                        child => !(typeof child === 'string' && child.trim() === '')
                    );

                    let isStatusFlow = childArray.length >= 3;
                    const statuses: string[] = [];

                    if (isStatusFlow) {
                        for (let i = 0; i < childArray.length; i++) {
                            const child = childArray[i];
                            if (i % 2 === 0) {
                                // Even indices should be status elements
                                if (isValidElement(child)) {
                                    statuses.push(getTextContent(child).trim());
                                } else {
                                    isStatusFlow = false;
                                    break;
                                }
                            } else {
                                // Odd indices should be '→' text
                                if (typeof child === 'string' && child.trim() === '→') {
                                    continue;
                                } else {
                                    isStatusFlow = false;
                                    break;
                                }
                            }
                        }
                    }

                    // Validate: at least 2 statuses, each reasonably short
                    if (isStatusFlow && statuses.length >= 2 && statuses.every(s => s.length > 0 && s.length <= 25)) {
                        return <StatusFlowBadges statuses={statuses} />;
                    }

                    return (
                        <p className="text-sm leading-6 [&:not(:first-child)]:mt-3">
                            {children}
                        </p>
                    );
                },
                ul: ({ children }) => (
                    <ul className="my-3 ml-5 list-disc space-y-1">
                        {children}
                    </ul>
                ),
                ol: ({ children }) => {
                    const validItems = Children.toArray(children).filter(child => isValidElement(child));
                    const items = validItems.map((child, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mt-0.5">
                                {index + 1}
                            </span>
                            <div className="flex-1 text-sm leading-6">{(child as any).props?.children}</div>
                        </li>
                    ));
                    return <ol className="my-3 ml-1 list-none space-y-2">{items}</ol>;
                },
                li: ({ children }) => (
                    <li className="text-sm leading-6">
                        {children}
                    </li>
                ),
                pre: ({ children }) => children,
                code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                        <CodeBlock className={className}>
                            {String(children).replace(/\n$/, '')}
                        </CodeBlock>
                    ) : (
                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold" {...props}>
                            {children}
                        </code>
                    );
                },
                table: ({ children }) => (
                    <div className="my-3 w-full overflow-y-auto rounded-lg border">
                        <table className="w-full border-collapse text-sm">
                            {children}
                        </table>
                    </div>
                ),
                thead: ({ children }) => (
                    <thead className="bg-muted">
                        {children}
                    </thead>
                ),
                tbody: ({ children }) => (
                    <tbody className="[&>tr:nth-child(even)]:bg-muted/30 [&>tr:hover]:bg-accent/50 [&>tr]:transition-colors">
                        {children}
                    </tbody>
                ),
                tr: ({ children }) => (
                    <tr className="border-b last:border-b-0">
                        {children}
                    </tr>
                ),
                th: ({ children }) => (
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground [&[align=center]]:text-center [&[align=right]]:text-right">
                        {children}
                    </th>
                ),
                td: ({ children }) => (
                    <td className="px-4 py-2 [&[align=center]]:text-center [&[align=right]]:text-right">
                        {children}
                    </td>
                ),
                blockquote: ({ children }) => {
                    const childText = getTextContent(children);

                    if (childText.includes('⚠️') || childText.includes('Warning:')) {
                        return (
                            <Alert variant="destructive" className="my-3">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>{children}</AlertDescription>
                            </Alert>
                        );
                    }
                    if (childText.includes('💡') || childText.includes('Tip:')) {
                        return (
                            <Alert className="my-3 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
                                <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <AlertDescription>{children}</AlertDescription>
                            </Alert>
                        );
                    }
                    if (childText.includes('ℹ️') || childText.includes('Note:') || childText.includes('Info:')) {
                        return (
                            <Alert className="my-3">
                                <Info className="h-4 w-4" />
                                <AlertDescription>{children}</AlertDescription>
                            </Alert>
                        );
                    }
                    if (childText.includes('🔴') || childText.includes('Danger:')) {
                        return (
                            <Alert variant="destructive" className="my-3">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{children}</AlertDescription>
                            </Alert>
                        );
                    }

                    return (
                        <blockquote className="mt-3 border-l-2 border-primary pl-4 italic text-sm text-muted-foreground">
                            {children}
                        </blockquote>
                    );
                },
                hr: () => (
                    <hr className="my-5 border-border" />
                ),
                a: ({ children, href }) => (
                    <a
                        href={href}
                        className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {children}
                    </a>
                ),
                strong: ({ children }) => {
                    const text = getTextContent(children).trim();
                    const role = roleKeywords.find(r => r.toLowerCase() === text.toLowerCase());

                    if (role) {
                        return (
                            <span className={cn(
                                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
                                roleColors[role.toLowerCase()]
                            )}>
                                {role}
                            </span>
                        );
                    }

                    return <strong className="font-semibold">{children}</strong>;
                },
                em: ({ children }) => (
                    <em className="italic">{children}</em>
                ),
                img: ({ src, alt }) => {
                    // Detect YouTube videos
                    if (src?.includes('youtube.com') || src?.includes('youtu.be')) {
                        let videoId = '';
                        if (src.includes('youtu.be/')) {
                            videoId = src.split('youtu.be/')[1]?.split('?')[0] || '';
                        } else if (src.includes('youtube.com/watch?v=')) {
                            videoId = new URL(src).searchParams.get('v') || '';
                        }

                        if (videoId) {
                            return (
                                <div className="my-3 aspect-video">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${videoId}`}
                                        title={alt || 'Video'}
                                        className="w-full h-full rounded-lg border shadow-sm"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            );
                        }
                    }

                    // Detect Vimeo videos
                    if (src?.includes('vimeo.com')) {
                        const videoId = src.split('vimeo.com/')[1]?.split('?')[0];
                        if (videoId) {
                            return (
                                <div className="my-3 aspect-video">
                                    <iframe
                                        src={`https://player.vimeo.com/video/${videoId}`}
                                        title={alt || 'Video'}
                                        className="w-full h-full rounded-lg border shadow-sm"
                                        allow="autoplay; fullscreen; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            );
                        }
                    }

                    // Regular image
                    return (
                        <img
                            src={src}
                            alt={alt}
                            className="rounded-lg border shadow-sm my-3 max-w-full h-auto"
                        />
                    );
                },
            } as Components}
        >
            {content}
        </ReactMarkdown>
    );
}
