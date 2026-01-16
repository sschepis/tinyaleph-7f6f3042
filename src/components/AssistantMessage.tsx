import { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import { Highlight, themes } from 'prism-react-renderer';
import { Check, Copy } from 'lucide-react';
import 'katex/dist/katex.min.css';

interface AssistantMessageProps {
  content: string;
  className?: string;
  showCopyButton?: boolean;
}

/**
 * Normalize AI output for consistent markdown rendering:
 * - Ensure newlines before headings (#)
 * - Ensure newlines before lists (-, *, 1.)
 * - Fix common LLM formatting issues
 */
function normalizeContent(content: string): string {
  return content
    // Ensure newline before headings that come after text
    .replace(/([^\n])(\s*)(#{1,6}\s)/g, '$1\n\n$3')
    // Ensure newline before list items that come after text
    .replace(/([^\n])(\s*)(\n?[-*]\s)/g, '$1\n\n$3')
    // Ensure newline before numbered lists
    .replace(/([^\n])(\s*)(\n?\d+\.\s)/g, '$1\n\n$3')
    // Clean up excessive newlines (more than 2)
    .replace(/\n{4,}/g, '\n\n\n')
    // Trim whitespace
    .trim();
}

/**
 * Detect language from markdown code fence or class name
 */
function getLanguage(className?: string): string {
  if (!className) return 'text';
  const match = className.match(/language-(\w+)/);
  return match ? match[1] : 'text';
}

/**
 * Syntax-highlighted code block with copy button
 */
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

/**
 * Unified AssistantMessage component for all flagship apps
 * Features:
 * - Markdown rendering with GFM (tables, strikethrough, etc.)
 * - LaTeX math support ($ and $$)
 * - Syntax-highlighted code blocks
 * - Copy button for entire message
 * - Content normalization for consistent formatting
 */
export function AssistantMessage({ 
  content, 
  className = '',
  showCopyButton = true 
}: AssistantMessageProps) {
  const [copied, setCopied] = useState(false);

  const normalizedContent = useMemo(() => normalizeContent(content), [content]);

  const handleCopyMessage = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Copy entire message button */}
      {showCopyButton && (
        <button
          onClick={handleCopyMessage}
          className="absolute -top-2 -right-2 p-1.5 rounded-md bg-secondary/80 hover:bg-secondary border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          title="Copy message"
        >
          {copied ? (
            <Check className="w-3 h-3 text-green-500" />
          ) : (
            <Copy className="w-3 h-3 text-muted-foreground" />
          )}
        </button>
      )}

      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-headings:my-2 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-pre:my-0 prose-pre:p-0 prose-pre:bg-transparent">
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[rehypeKatex]}
          components={{
            // Syntax-highlighted code blocks
            code({ node, inline, className, children, ...props }: any) {
              const code = String(children).replace(/\n$/, '');
              
              if (inline) {
                return (
                  <code 
                    className="px-1.5 py-0.5 rounded bg-muted/70 font-mono text-xs" 
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              
              const language = getLanguage(className);
              return <CodeBlock code={code} language={language} />;
            },
            // Links open in new tab
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
            // Paragraph styling
            p({ children, ...props }: any) {
              return (
                <p className="mb-2 last:mb-0 leading-relaxed" {...props}>
                  {children}
                </p>
              );
            },
            // List styling
            ul({ children, ...props }: any) {
              return (
                <ul className="list-disc list-inside mb-2 space-y-0.5" {...props}>
                  {children}
                </ul>
              );
            },
            ol({ children, ...props }: any) {
              return (
                <ol className="list-decimal list-inside mb-2 space-y-0.5" {...props}>
                  {children}
                </ol>
              );
            },
            // Blockquote
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
            // Headings
            h1({ children, ...props }: any) {
              return <h1 className="text-lg font-bold mb-2 mt-3 first:mt-0" {...props}>{children}</h1>;
            },
            h2({ children, ...props }: any) {
              return <h2 className="text-base font-bold mb-2 mt-3 first:mt-0" {...props}>{children}</h2>;
            },
            h3({ children, ...props }: any) {
              return <h3 className="text-sm font-bold mb-1 mt-2 first:mt-0" {...props}>{children}</h3>;
            },
            h4({ children, ...props }: any) {
              return <h4 className="text-sm font-semibold mb-1 mt-2 first:mt-0" {...props}>{children}</h4>;
            },
            // Table styling
            table({ children, ...props }: any) {
              return (
                <div className="overflow-x-auto my-2">
                  <table className="min-w-full text-xs border-collapse" {...props}>
                    {children}
                  </table>
                </div>
              );
            },
            th({ children, ...props }: any) {
              return (
                <th className="border border-border px-2 py-1 bg-muted/50 font-semibold text-left" {...props}>
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
            // Horizontal rule
            hr({ ...props }: any) {
              return <hr className="my-3 border-border/50" {...props} />;
            },
          }}
        >
          {normalizedContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default AssistantMessage;
