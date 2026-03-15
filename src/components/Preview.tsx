import { useEffect, useRef } from "react";
import { parseMarkdown } from "../lib/markdownParser";

interface PreviewProps {
  source: string;
  /** Stable id placed on the *scrollable wrapper* so TOC can scroll into it */
  scrollContainerId?: string;
}

export default function Preview({
  source,
  scrollContainerId = "preview-scroll-container",
}: PreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = parseMarkdown(source);
    }
  }, [source]);

  return (
    <div className="flex flex-col h-full">
      {/* Preview header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 tracking-widest uppercase">
          Preview
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">Live render</span>
      </div>

      {/* Scrollable content — this id is used by TOC jump */}
      <div
        id={scrollContainerId}
        className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-950"
      >
        <div
          ref={containerRef}
          className="md-preview max-w-3xl mx-auto"
        />
      </div>
    </div>
  );
}
