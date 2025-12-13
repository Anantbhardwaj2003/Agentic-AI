import React, { useEffect, useRef } from 'react';

// Declaration for global window libraries loaded via index.html
declare global {
  interface Window {
    marked: any;
    Prism: any;
  }
}

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && window.marked) {
      // 1. Convert Markdown to HTML
      const rawHtml = window.marked.parse(content);
      
      // 2. Inject HTML
      containerRef.current.innerHTML = rawHtml;

      // 3. Highlight Code Blocks
      if (window.Prism) {
        // Find all code blocks that don't have a language class and default to python or text if needed
        const codes = containerRef.current.querySelectorAll('pre code');
        codes.forEach((block) => {
          // If marked didn't detect a language, we can try to guess or just let Prism handle it.
          // Prism usually needs 'language-xyz' class.
          if (!block.className.includes('language-')) {
            block.classList.add('language-none'); 
          }
        });
        window.Prism.highlightAllUnder(containerRef.current);
      }
      
      // 4. Force links to open in new tab
      const links = containerRef.current.querySelectorAll('a');
      links.forEach(link => {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      });
    }
  }, [content]);

  return (
    <div 
      ref={containerRef} 
      className={`markdown-body ${className}`} 
    />
  );
};