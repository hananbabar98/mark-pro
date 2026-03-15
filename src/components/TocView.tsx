import { useEffect, useRef, useState } from "react";
import { extractToc, TocItem } from "../lib/markdownParser";
import { Hash, ChevronRight, BookOpen } from "lucide-react";

interface TocViewProps {
  source: string;
  onJump: (slug: string) => void;
}

export default function TocView({ source, onJump }: TocViewProps) {
  const items: TocItem[] = extractToc(source);
  const [activeSlug, setActiveSlug] = useState<string>("");
  const observer = useRef<IntersectionObserver | null>(null);

  // Watch which heading is visible in the preview panel and highlight it in TOC
  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    const scrollContainer = document.getElementById("preview-scroll-container");
    if (!scrollContainer) return;

    const headingEls = scrollContainer.querySelectorAll<HTMLElement>(
      "h1[id], h2[id], h3[id], h4[id]"
    );
    if (!headingEls.length) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        // Pick the first visible heading (closest to top)
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.id; // "heading-xxx"
          setActiveSlug(id.replace(/^heading-/, ""));
        }
      },
      {
        root: scrollContainer,
        rootMargin: "0px 0px -70% 0px",
        threshold: 0,
      }
    );

    headingEls.forEach((el) => observer.current!.observe(el));
    return () => observer.current?.disconnect();
  }, [source]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-gray-400 dark:text-gray-600 p-8">
        <Hash size={32} className="mb-3 opacity-30" />
        <p className="text-sm font-medium">No headings found</p>
        <p className="text-xs mt-1 opacity-60">Add headings with #, ##, ### …</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--border)] bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
        <BookOpen size={13} className="text-indigo-500 flex-shrink-0" />
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-widest uppercase flex-1">
          Contents
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-full font-mono">
          {items.length}
        </span>
      </div>

      {/* TOC list */}
      <div className="flex-1 overflow-y-auto py-2">
        {items.map((item, i) => {
          const isActive = item.slug === activeSlug;
          const indentMap: Record<number, string> = {
            1: "pl-3",
            2: "pl-6",
            3: "pl-9",
            4: "pl-12",
          };
          const indent = indentMap[item.level] ?? "pl-3";

          return (
            <button
              key={i}
              onClick={() => {
                setActiveSlug(item.slug);
                onJump(item.slug);
              }}
              title={item.text}
              className={[
                "group w-full text-left flex items-start gap-1.5 py-1 pr-3 my-0.5 rounded-r-lg",
                "transition-all duration-150 cursor-pointer border-l-2",
                indent,
                isActive
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                  : "border-transparent hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-800/60",
              ].join(" ")}
            >
              {/* Level indicator dot */}
              <span
                className={[
                  "mt-1.5 flex-shrink-0 rounded-full transition-all",
                  item.level === 1
                    ? "w-2 h-2"
                    : item.level === 2
                    ? "w-1.5 h-1.5"
                    : "w-1 h-1",
                  isActive
                    ? "bg-indigo-500"
                    : "bg-gray-300 dark:bg-gray-600 group-hover:bg-indigo-400",
                ].join(" ")}
              />

              <span
                className={[
                  "leading-snug truncate flex-1",
                  item.level === 1
                    ? "text-sm font-semibold"
                    : item.level === 2
                    ? "text-sm font-medium"
                    : "text-xs font-normal",
                  isActive
                    ? "text-indigo-700 dark:text-indigo-300"
                    : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100",
                ].join(" ")}
              >
                {item.text}
              </span>

              <ChevronRight
                size={11}
                className={[
                  "flex-shrink-0 mt-1 transition-all",
                  isActive
                    ? "opacity-100 text-indigo-500"
                    : "opacity-0 group-hover:opacity-60 text-gray-400",
                ].join(" ")}
              />
            </button>
          );
        })}

        {/* Bottom padding */}
        <div className="h-4" />
      </div>
    </div>
  );
}
