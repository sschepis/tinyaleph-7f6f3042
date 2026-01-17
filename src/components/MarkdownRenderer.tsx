import { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import { Highlight, themes } from 'prism-react-renderer';
import { Check, Copy } from 'lucide-react';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Normalize AI output for consistent markdown rendering
 * Only adds spacing before headings and first list item (not between list items)
 */
function normalizeContent(content: string): string {
  return content
    // Add newlines before headings if missing
    .replace(/([^\n])(#{1,6}\s)/g, '$1\n\n$2')
    // Add newlines before first list item in a block (not between items)
    .replace(/([^\n\-\*\d])\n([-*]\s)/g, '$1\n\n$2')
    .replace(/([^\n\-\*\d])\n(\d+\.\s)/g, '$1\n\n$2')
    // Normalize excessive newlines
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

function getLanguage(className?: string): string {
  if (!className) return 'text';
  const match = className.match(/language-(\w+)/);
  return match ? match[1] : 'text';
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-2 rounded-lg overflow-hidden border border-border/50 bg-black/30">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/30 bg-muted/30">
        <span className="text-xs font-mono text-muted-foreground">{language}</span>
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
          title="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <Highlight theme={themes.nightOwl} code={code.trim()} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${className} p-3 overflow-x-auto text-xs font-mono`}
            style={{ ...style, background: 'transparent' }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}

export const MarkdownRenderer = ({ content, className = '' }: MarkdownRendererProps) => {
  const normalizedContent = useMemo(() => normalizeContent(content), [content]);

  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const code = String(children).replace(/\n$/, '');
            
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
            
            const language = getLanguage(className);
            return <CodeBlock code={code} language={language} />;
          },
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
          p({ children, ...props }: any) {
            return (
              <p className="mb-2 last:mb-0" {...props}>
                {children}
              </p>
            );
          },
          ul({ children, ...props }: any) {
            return (
              <ul className="list-disc pl-5 mb-2 space-y-0.5" {...props}>
                {children}
              </ul>
            );
          },
          ol({ children, ...props }: any) {
            return (
              <ol className="list-decimal pl-5 mb-2 space-y-0.5" {...props}>
                {children}
              </ol>
            );
          },
          li({ children, ...props }: any) {
            return (
              <li className="pl-1" {...props}>
                {children}
              </li>
            );
          },
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
          h1({ children, ...props }: any) {
            return <h1 className="text-lg font-bold mb-2" {...props}>{children}</h1>;
          },
          h2({ children, ...props }: any) {
            return <h2 className="text-base font-bold mb-2" {...props}>{children}</h2>;
          },
          h3({ children, ...props }: any) {
            return <h3 className="text-sm font-bold mb-1" {...props}>{children}</h3>;
          },
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
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
