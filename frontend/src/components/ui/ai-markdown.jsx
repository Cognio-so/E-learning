import * as React from "react"
import { cn } from "@/lib/utils"

const AIMarkdown = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "ai-markdown-wrapper text-sm leading-relaxed text-gray-900 dark:text-gray-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
AIMarkdown.displayName = "AIMarkdown"

// Custom CSS for markdown styling
const markdownStyles = `
  .ai-markdown-wrapper {
    /* Base typography */
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: inherit;
  }

  /* Headings */
  .ai-markdown-wrapper h1 {
    font-size: 1.875rem;
    font-weight: 700;
    margin-top: 2rem;
    margin-bottom: 1rem;
    color: #1f2937;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 0.5rem;
  }

  .ai-markdown-wrapper h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-top: 1.75rem;
    margin-bottom: 0.75rem;
    color: #374151;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 0.25rem;
  }

  .ai-markdown-wrapper h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    color: #4b5563;
  }

  .ai-markdown-wrapper h4 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-top: 1.25rem;
    margin-bottom: 0.5rem;
    color: #6b7280;
  }

  .ai-markdown-wrapper h5 {
    font-size: 1rem;
    font-weight: 600;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    color: #6b7280;
  }

  .ai-markdown-wrapper h6 {
    font-size: 0.875rem;
    font-weight: 600;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    color: #6b7280;
  }

  /* Paragraphs */
  .ai-markdown-wrapper p {
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
    line-height: 1.7;
    word-spacing: normal;
    letter-spacing: normal;
  }

  .ai-markdown-wrapper p:first-child {
    margin-top: 0;
  }

  .ai-markdown-wrapper p:last-child {
    margin-bottom: 0;
  }

  /* Lists */
  .ai-markdown-wrapper ul,
  .ai-markdown-wrapper ol {
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
    padding-left: 1.5rem;
  }

  .ai-markdown-wrapper li {
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
    line-height: 1.6;
    word-spacing: normal;
  }

  .ai-markdown-wrapper ul li {
    list-style-type: disc;
  }

  .ai-markdown-wrapper ol li {
    list-style-type: decimal;
  }

  .ai-markdown-wrapper ul ul,
  .ai-markdown-wrapper ol ol,
  .ai-markdown-wrapper ul ol,
  .ai-markdown-wrapper ol ul {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }

  /* Blockquotes */
  .ai-markdown-wrapper blockquote {
    margin: 1rem 0;
    padding: 0.75rem 1rem;
    border-left: 4px solid #8b5cf6;
    background-color: #f8fafc;
    border-radius: 0.375rem;
    font-style: italic;
    color: #475569;
  }

  .ai-markdown-wrapper blockquote p {
    margin: 0;
  }

  /* Code blocks */
  .ai-markdown-wrapper pre {
    margin: 1rem 0;
    padding: 1rem;
    background-color: #1e293b;
    color: #e2e8f0;
    border-radius: 0.5rem;
    overflow-x: auto;
    font-family: 'Fira Code', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .ai-markdown-wrapper pre code {
    background-color: transparent;
    padding: 0;
    color: inherit;
    font-size: inherit;
  }

  .ai-markdown-wrapper code {
    background-color: #f1f5f9;
    color: #dc2626;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-family: 'Fira Code', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
    font-size: 0.875rem;
  }

  /* Tables */
  .ai-markdown-wrapper table {
    width: 100%;
    margin: 1rem 0;
    border-collapse: collapse;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .ai-markdown-wrapper th {
    background-color: #f8fafc;
    padding: 0.75rem;
    text-align: left;
    font-weight: 600;
    color: #374151;
    border-bottom: 1px solid #e5e7eb;
  }

  .ai-markdown-wrapper td {
    padding: 0.75rem;
    border-bottom: 1px solid #f1f5f9;
    color: #4b5563;
  }

  .ai-markdown-wrapper tr:hover {
    background-color: #f8fafc;
  }

  /* Links */
  .ai-markdown-wrapper a {
    color: #8b5cf6;
    text-decoration: underline;
    text-decoration-color: #c4b5fd;
    text-underline-offset: 2px;
    transition: color 0.2s ease;
  }

  .ai-markdown-wrapper a:hover {
    color: #7c3aed;
    text-decoration-color: #a78bfa;
  }

  /* Horizontal rules */
  .ai-markdown-wrapper hr {
    margin: 2rem 0;
    border: none;
    border-top: 1px solid #e5e7eb;
    height: 1px;
  }

  /* Emphasis */
  .ai-markdown-wrapper strong {
    font-weight: 600;
    color: #1f2937;
  }

  .ai-markdown-wrapper em {
    font-style: italic;
    color: #4b5563;
  }

  /* Strikethrough */
  .ai-markdown-wrapper del {
    text-decoration: line-through;
    color: #6b7280;
  }

  /* Images */
  .ai-markdown-wrapper img {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
    margin: 1rem 0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  /* Task lists */
  .ai-markdown-wrapper input[type="checkbox"] {
    margin-right: 0.5rem;
    transform: scale(1.1);
  }

  /* Dark mode adjustments */
  .dark .ai-markdown-wrapper h1 {
    color: #f9fafb;
    border-bottom-color: #374151;
  }

  .dark .ai-markdown-wrapper h2 {
    color: #e5e7eb;
    border-bottom-color: #374151;
  }

  .dark .ai-markdown-wrapper h3 {
    color: #d1d5db;
  }

  .dark .ai-markdown-wrapper h4,
  .dark .ai-markdown-wrapper h5,
  .dark .ai-markdown-wrapper h6 {
    color: #9ca3af;
  }

  .dark .ai-markdown-wrapper blockquote {
    background-color: #1f2937;
    color: #d1d5db;
    border-left-color: #a78bfa;
  }

  .dark .ai-markdown-wrapper code {
    background-color: #374151;
    color: #fca5a5;
  }

  .dark .ai-markdown-wrapper th {
    background-color: #1f2937;
    color: #e5e7eb;
    border-bottom-color: #374151;
  }

  .dark .ai-markdown-wrapper td {
    color: #d1d5db;
    border-bottom-color: #374151;
  }

  .dark .ai-markdown-wrapper tr:hover {
    background-color: #1f2937;
  }

  .dark .ai-markdown-wrapper a {
    color: #a78bfa;
    text-decoration-color: #7c3aed;
  }

  .dark .ai-markdown-wrapper a:hover {
    color: #c4b5fd;
    text-decoration-color: #a78bfa;
  }

  .dark .ai-markdown-wrapper strong {
    color: #f9fafb;
  }

  .dark .ai-markdown-wrapper em {
    color: #d1d5db;
  }

  .dark .ai-markdown-wrapper hr {
    border-top-color: #374151;
  }

  /* Fix spacing issues */
  .ai-markdown-wrapper * {
    word-spacing: normal !important;
    letter-spacing: normal !important;
  }

  .ai-markdown-wrapper p,
  .ai-markdown-wrapper li,
  .ai-markdown-wrapper h1,
  .ai-markdown-wrapper h2,
  .ai-markdown-wrapper h3,
  .ai-markdown-wrapper h4,
  .ai-markdown-wrapper h5,
  .ai-markdown-wrapper h6 {
    margin: 0.75rem 0;
    line-height: 1.6;
  }

  .ai-markdown-wrapper p:first-child,
  .ai-markdown-wrapper h1:first-child,
  .ai-markdown-wrapper h2:first-child,
  .ai-markdown-wrapper h3:first-child,
  .ai-markdown-wrapper h4:first-child,
  .ai-markdown-wrapper h5:first-child,
  .ai-markdown-wrapper h6:first-child {
    margin-top: 0;
  }

  .ai-markdown-wrapper p:last-child,
  .ai-markdown-wrapper h1:last-child,
  .ai-markdown-wrapper h2:last-child,
  .ai-markdown-wrapper h3:last-child,
  .ai-markdown-wrapper h4:last-child,
  .ai-markdown-wrapper h5:last-child,
  .ai-markdown-wrapper h6:last-child {
    margin-bottom: 0;
  }
`

// Inject styles into document head
if (typeof document !== 'undefined') {
  const styleId = 'ai-markdown-styles'
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = markdownStyles
    document.head.appendChild(style)
  }
}

export { AIMarkdown, markdownStyles }
