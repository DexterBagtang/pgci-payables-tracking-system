import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import type { Components } from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, Copy, AlertCircle, Info, Lightbulb, AlertTriangle, ArrowRight } from 'lucide-react';
import { useState, Children, isValidElement, Fragment } from 'react';
import { useCopyToClipboard } from 'react-use';
import { cn } from '@/lib/utils';
import { allStatusColors, roleColors, roleKeywords } from '@/lib/status-config';

// Re-export for use in other components
export { roleColors };
export const statusColors = allStatusColors;

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

// GitHub-style callout detection
type CalloutType = 'warning' | 'tip' | 'note' | 'danger' | 'important';

interface CalloutInfo {
    type: CalloutType;
    icon: React.ComponentType<{ className?: string }>;
    className: string;
}

function detectCallout(text: string): CalloutInfo | null {
    // GitHub-style: [!WARNING], [!TIP], [!NOTE], etc.
    const githubMatch = text.match(/^\[!(WARNING|TIP|NOTE|DANGER|IMPORTANT)\]/i);
    if (githubMatch) {
        const type = githubMatch[1].toLowerCase() as CalloutType;
        return getCalloutInfo(type);
    }

    // Legacy: Check for keywords (without emoji)
    const lowerText = text.toLowerCase();
    if (lowerText.includes('warning:') || lowerText.includes('⚠')) {
        return getCalloutInfo('warning');
    }
    if (lowerText.includes('tip:') || lowerText.includes('💡')) {
        return getCalloutInfo('tip');
    }
    if (lowerText.includes('note:') || lowerText.includes('info:') || lowerText.includes('ℹ')) {
        return getCalloutInfo('note');
    }
    if (lowerText.includes('danger:') || lowerText.includes('🔴')) {
        return getCalloutInfo('danger');
    }
    if (lowerText.includes('important:')) {
        return getCalloutInfo('important');
    }

    return null;
}

function getCalloutInfo(type: CalloutType): CalloutInfo {
    switch (type) {
        case 'warning':
            return {
                type: 'warning',
                icon: AlertTriangle,
                className: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400',
            };
        case 'tip':
            return {
                type: 'tip',
                icon: Lightbulb,
                className: 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400',
            };
        case 'note':
            return {
                type: 'note',
                icon: Info,
                className: 'border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950 [&>svg]:text-sky-600 dark:[&>svg]:text-sky-400',
            };
        case 'danger':
            return {
                type: 'danger',
                icon: AlertCircle,
                className: '', // Uses default destructive variant
            };
        case 'important':
            return {
                type: 'important',
                icon: AlertCircle,
                className: 'border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950 [&>svg]:text-purple-600 dark:[&>svg]:text-purple-400',
            };
    }
}

// Clean text by removing emojis and callout markers
function cleanCalloutText(text: string): string {
    return text
        .replace(/^\[!(WARNING|TIP|NOTE|DANGER|IMPORTANT)\]\s*/i, '') // Remove GitHub-style marker
        .replace(/^(Warning|Tip|Note|Info|Danger|Important):\s*/i, '') // Remove keyword prefix
        .replace(/[⚠️💡ℹ️🔴]/g, '') // Remove emojis
        .trim();
}

function CodeBlock({ children, className, language }: { children: string; className?: string; language?: string }) {
    const [copied, setCopied] = useState(false);
    const [, copyToClipboard] = useCopyToClipboard();

    const handleCopy = () => {
        copyToClipboard(String(children));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const lineCount = String(children).split('\n').length;
    const showCopyButton = lineCount > 1; // Only show for multi-line code

    return (
        <div className="relative group my-3">
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 border">
                <code className={`font-mono text-sm ${className || ''}`}>
                    {children}
                </code>
            </pre>
            {language && (
                <div className="absolute top-2 left-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-muted-foreground/10 text-muted-foreground px-2 py-0.5 rounded">
                        {language}
                    </span>
                </div>
            )}
            {showCopyButton && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleCopy}
                    aria-label="Copy code"
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
        <div className="flex items-center gap-2 flex-wrap my-4 py-3 px-4 rounded-lg bg-muted/50 border">
            {statuses.map((status, index) => (
                <Fragment key={index}>
                    <span
                        className={cn(
                            'px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-200 hover:scale-105',
                            allStatusColors[status.toLowerCase()] || 'bg-muted text-muted-foreground border-border'
                        )}
                    >
                        {status}
                    </span>
                    {index < statuses.length - 1 && (
                        <ArrowRight className="h-3.5 w-3.5 text-primary/50 stroke-[2.5] flex-shrink-0 animate-pulse" />
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
                        <h1 id={id} className="scroll-m-20 text-3xl font-bold tracking-tight mb-4 mt-2">
                            {children}
                        </h1>
                    );
                },
                h2: ({ children }) => {
                    const text = getTextContent(children);
                    const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
                    return (
                        <h2 id={id} className="scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight first:mt-0 mt-8 mb-3">
                            {children}
                        </h2>
                    );
                },
                h3: ({ children }) => {
                    const text = getTextContent(children);
                    const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
                    return (
                        <h3 id={id} className="scroll-m-20 text-base font-semibold tracking-tight mt-6 mb-2">
                            {children}
                        </h3>
                    );
                },
                h4: ({ children }) => (
                    <h4 className="scroll-m-20 text-sm font-semibold tracking-tight mt-5 mb-2">
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
                    if (isStatusFlow && statuses.length >= 2 && statuses.every(s => s.length > 0 && s.length <= 30)) {
                        return <StatusFlowBadges statuses={statuses} />;
                    }

                    return (
                        <p className="text-sm leading-6 [&:not(:first-child)]:mt-3">
                            {children}
                        </p>
                    );
                },
                ul: ({ children }) => (
                    <ul className="my-3 ml-5 list-disc space-y-1.5">
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
                    return <ol className="my-3 ml-1 list-none space-y-2.5">{items}</ol>;
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
                        <CodeBlock className={className} language={match[1]}>
                            {String(children).replace(/\n$/, '')}
                        </CodeBlock>
                    ) : (
                        <code className="relative rounded bg-muted px-[0.35rem] py-[0.2rem] font-mono text-xs font-semibold" {...props}>
                            {children}
                        </code>
                    );
                },
                table: ({ children }) => (
                    <div className="my-4 w-full overflow-y-auto rounded-lg border shadow-sm">
                        <table className="w-full border-collapse text-sm">
                            {children}
                        </table>
                    </div>
                ),
                thead: ({ children }) => (
                    <thead className="bg-muted/70">
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
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground [&[align=center]]:text-center [&[align=right]]:text-right">
                        {children}
                    </th>
                ),
                td: ({ children }) => (
                    <td className="px-4 py-2.5 [&[align=center]]:text-center [&[align=right]]:text-right">
                        {children}
                    </td>
                ),
                blockquote: ({ children }) => {
                    const childText = getTextContent(children);
                    const callout = detectCallout(childText);

                    if (callout) {
                        const Icon = callout.icon;
                        const cleanedContent = cleanCalloutText(childText);

                        if (callout.type === 'danger') {
                            return (
                                <Alert variant="destructive" className="my-4">
                                    <Icon className="h-4 w-4" />
                                    <AlertDescription>{cleanedContent}</AlertDescription>
                                </Alert>
                            );
                        }

                        return (
                            <Alert className={cn('my-4', callout.className)}>
                                <Icon className="h-4 w-4" />
                                <AlertDescription>{cleanedContent}</AlertDescription>
                            </Alert>
                        );
                    }

                    return (
                        <blockquote className="mt-4 border-l-2 border-primary pl-4 italic text-sm text-muted-foreground">
                            {children}
                        </blockquote>
                    );
                },
                hr: () => (
                    <hr className="my-6 border-border" />
                ),
                a: ({ children, href }) => (
                    <a
                        href={href}
                        className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {children}
                    </a>
                ),
                strong: ({ children }) => {
                    const text = getTextContent(children).trim();

                    // Exact match for role keywords only
                    const role = roleKeywords.find(r => r === text);

                    if (role) {
                        return (
                            <span className={cn(
                                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border',
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
                img: ({ src, alt }) => (
                    <img
                        src={src}
                        alt={alt}
                        className="rounded-lg border shadow-sm my-4 max-w-full h-auto"
                    />
                ),
            } as Components}
        >
            {content}
        </ReactMarkdown>
    );
}
