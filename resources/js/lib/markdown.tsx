import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import type { Components } from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, Copy, AlertCircle, Info, Lightbulb, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useCopyToClipboard } from 'react-use';

interface MarkdownRendererProps {
    content: string;
}

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
            <pre className="my-6 overflow-x-auto rounded-lg bg-muted p-4">
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

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            components={{
                // Style headers
                h1: ({ children }) => {
                    const text = String(children);
                    const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
                    return (
                        <h1 id={id} className="scroll-m-20 text-4xl font-bold tracking-tight mb-4">
                            {children}
                        </h1>
                    );
                },
                h2: ({ children }) => {
                    const text = String(children);
                    const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
                    return (
                        <h2 id={id} className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mt-10 mb-4">
                            {children}
                        </h2>
                    );
                },
                h3: ({ children }) => {
                    const text = String(children);
                    const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
                    return (
                        <h3 id={id} className="scroll-m-20 text-2xl font-semibold tracking-tight mt-8 mb-4">
                            {children}
                        </h3>
                    );
                },
                h4: ({ children }) => (
                    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mt-6 mb-3">
                        {children}
                    </h4>
                ),
                // Style paragraphs
                p: ({ children }) => (
                    <p className="leading-7 [&:not(:first-child)]:mt-6">
                        {children}
                    </p>
                ),
                // Style lists
                ul: ({ children }) => (
                    <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                        {children}
                    </ul>
                ),
                ol: ({ children }) => (
                    <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">
                        {children}
                    </ol>
                ),
                li: ({ children }) => (
                    <li className="mt-2">
                        {children}
                    </li>
                ),
                // Style code blocks and inline code
                pre: ({ children }) => children,
                code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                        <CodeBlock className={className}>
                            {String(children).replace(/\n$/, '')}
                        </CodeBlock>
                    ) : (
                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold" {...props}>
                            {children}
                        </code>
                    );
                },
                // Style tables (GFM)
                table: ({ children }) => (
                    <div className="my-6 w-full overflow-y-auto">
                        <table className="w-full border-collapse border">
                            {children}
                        </table>
                    </div>
                ),
                thead: ({ children }) => (
                    <thead className="bg-muted/50">
                        {children}
                    </thead>
                ),
                tbody: ({ children }) => (
                    <tbody>
                        {children}
                    </tbody>
                ),
                tr: ({ children }) => (
                    <tr className="border-b">
                        {children}
                    </tr>
                ),
                th: ({ children }) => (
                    <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                        {children}
                    </th>
                ),
                td: ({ children }) => (
                    <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                        {children}
                    </td>
                ),
                // Style blockquotes with alert detection
                blockquote: ({ children }) => {
                    // Convert children to string to detect emoji prefixes
                    const childText = String(children);

                    // Detect alert types by emoji
                    if (childText.includes('⚠️') || childText.includes('Warning:')) {
                        return (
                            <Alert variant="destructive" className="my-6">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>{children}</AlertDescription>
                            </Alert>
                        );
                    }
                    if (childText.includes('💡') || childText.includes('Tip:')) {
                        return (
                            <Alert className="my-6 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
                                <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <AlertDescription>{children}</AlertDescription>
                            </Alert>
                        );
                    }
                    if (childText.includes('ℹ️') || childText.includes('Note:') || childText.includes('Info:')) {
                        return (
                            <Alert className="my-6">
                                <Info className="h-4 w-4" />
                                <AlertDescription>{children}</AlertDescription>
                            </Alert>
                        );
                    }
                    if (childText.includes('🔴') || childText.includes('Danger:')) {
                        return (
                            <Alert variant="destructive" className="my-6">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{children}</AlertDescription>
                            </Alert>
                        );
                    }

                    // Default blockquote style
                    return (
                        <blockquote className="mt-6 border-l-2 border-primary pl-6 italic text-muted-foreground">
                            {children}
                        </blockquote>
                    );
                },
                // Style horizontal rules
                hr: () => (
                    <hr className="my-8 border-border" />
                ),
                // Style links
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
                // Style strong text
                strong: ({ children }) => (
                    <strong className="font-semibold">
                        {children}
                    </strong>
                ),
                // Style emphasis
                em: ({ children }) => (
                    <em className="italic">
                        {children}
                    </em>
                ),
                // Style images and detect videos
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
                                <div className="my-6 aspect-video">
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
                                <div className="my-6 aspect-video">
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
                            className="rounded-lg border shadow-sm my-6 max-w-full h-auto"
                        />
                    );
                },
            } as Components}
        >
            {content}
        </ReactMarkdown>
    );
}
