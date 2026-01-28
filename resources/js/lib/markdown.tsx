import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
    content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            components={{
                // Style headers
                h1: ({ children }) => (
                    <h1 className="scroll-m-20 text-4xl font-bold tracking-tight mb-4">
                        {children}
                    </h1>
                ),
                h2: ({ children }) => (
                    <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mt-10 mb-4">
                        {children}
                    </h2>
                ),
                h3: ({ children }) => (
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-8 mb-4">
                        {children}
                    </h3>
                ),
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
                pre: ({ children }) => (
                    <pre className="my-6 overflow-x-auto rounded-lg bg-muted p-4">
                        {children}
                    </pre>
                ),
                code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                        <code className={`font-mono text-sm ${className || ''}`} {...props}>
                            {children}
                        </code>
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
                // Style blockquotes
                blockquote: ({ children }) => (
                    <blockquote className="mt-6 border-l-2 border-primary pl-6 italic text-muted-foreground">
                        {children}
                    </blockquote>
                ),
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
                // Style images
                img: ({ src, alt }) => (
                    <img
                        src={src}
                        alt={alt}
                        className="rounded-lg border shadow-sm my-6 max-w-full h-auto"
                    />
                ),
            } as Components}
        >
            {content}
        </ReactMarkdown>
    );
}
