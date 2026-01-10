import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer = ({ content, className = '' }: MarkdownRendererProps) => {
  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
        // Custom code block styling
        code({ node, inline, className, children, ...props }: any) {
          if (inline) {
            return (
              <code 
                className="px-1.5 py-0.5 rounded bg-muted font-mono text-sm" 
                {...props}
              >
                {children}
              </code>
            );
          }
          return (
            <pre className="p-3 rounded-lg bg-muted/50 overflow-x-auto">
              <code className={`text-sm font-mono ${className || ''}`} {...props}>
                {children}
              </code>
            </pre>
          );
        },
        // Custom link styling
        a({ children, href, ...props }: any) {
          return (
            <a 
              href={href} 
              className="text-primary hover:underline" 
              target="_blank" 
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          );
        },
        // Custom paragraph to avoid extra margin in chat
        p({ children, ...props }: any) {
          return (
            <p className="mb-2 last:mb-0" {...props}>
              {children}
            </p>
          );
        },
        // Custom list styling
        ul({ children, ...props }: any) {
          return (
            <ul className="list-disc list-inside mb-2 space-y-1" {...props}>
              {children}
            </ul>
          );
        },
        ol({ children, ...props }: any) {
          return (
            <ol className="list-decimal list-inside mb-2 space-y-1" {...props}>
              {children}
            </ol>
          );
        },
        // Custom blockquote
        blockquote({ children, ...props }: any) {
          return (
            <blockquote 
              className="border-l-2 border-primary/50 pl-3 italic text-muted-foreground my-2" 
              {...props}
            >
              {children}
            </blockquote>
          );
        },
        // Custom heading sizes for chat context
        h1({ children, ...props }: any) {
          return <h1 className="text-lg font-bold mb-2" {...props}>{children}</h1>;
        },
        h2({ children, ...props }: any) {
          return <h2 className="text-base font-bold mb-2" {...props}>{children}</h2>;
        },
        h3({ children, ...props }: any) {
          return <h3 className="text-sm font-bold mb-1" {...props}>{children}</h3>;
        },
        // Table styling
        table({ children, ...props }: any) {
          return (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full text-sm border-collapse" {...props}>
                {children}
              </table>
            </div>
          );
        },
        th({ children, ...props }: any) {
          return (
            <th className="border border-border px-2 py-1 bg-muted font-semibold text-left" {...props}>
              {children}
            </th>
          );
        },
        td({ children, ...props }: any) {
          return (
            <td className="border border-border px-2 py-1" {...props}>
              {children}
            </td>
          );
        },
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
