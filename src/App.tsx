import { useState, useEffect, useCallback } from "react";
import Toolbar, { ViewMode } from "./components/Toolbar";
import Editor from "./components/Editor";
import Preview from "./components/Preview";
import MarkmapView from "./components/MarkmapView";
import SlidesView from "./components/SlidesView";
import TocView from "./components/TocView";
import SummaryView from "./components/SummaryView";
import { countWords } from "./lib/markdownParser";
import { SAMPLE_MARKDOWN } from "./lib/sampleMarkdown";

export default function App() {
  const [source, setSource] = useState(SAMPLE_MARKDOWN);
  const [view, setView] = useState<ViewMode>("split");
  const [dark, setDark] = useState(false);


  // Dark mode
  useEffect(() => {
    const stored = localStorage.getItem("markpro-dark");
    if (stored === "true") setDark(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("markpro-dark", String(dark));
  }, [dark]);

  const wordCount = countWords(source);

  // TOC jump — scroll the heading into view inside the preview scroll container.
  // We do NOT switch the view; in TOC mode the preview is already visible on the right.
  // On mobile (preview hidden) we briefly switch to preview view then jump.
  const handleTocJump = useCallback(
    (slug: string) => {
      const targetId = `heading-${slug}`;

      const doScroll = () => {
        const heading = document.getElementById(targetId);
        if (!heading) return false;

        // Find the nearest scrollable ancestor that has overflow-y-auto/scroll
        const scrollContainer =
          document.getElementById("preview-scroll-container") ??
          document.getElementById("preview-scroll-container-toc");

        if (scrollContainer) {
          const containerTop = scrollContainer.getBoundingClientRect().top;
          const headingTop = heading.getBoundingClientRect().top;
          const offset = headingTop - containerTop + scrollContainer.scrollTop - 16;
          scrollContainer.scrollTo({ top: offset, behavior: "smooth" });
        } else {
          heading.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        // Highlight flash
        heading.style.transition = "background 0.4s ease";
        heading.style.background = "rgba(99,102,241,0.18)";
        heading.style.borderRadius = "4px";
        setTimeout(() => {
          heading.style.background = "";
          heading.style.borderRadius = "";
        }, 1600);
        return true;
      };

      // Check if we're on mobile (toc-only, no right-side preview visible)
      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        // On mobile: switch to preview, wait for render, then scroll
        setView("preview");
        // Retry up to 15 times over 750 ms to find the element
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (doScroll() || attempts >= 15) clearInterval(interval);
        }, 50);
      } else {
        // Desktop: preview panel is already mounted — just scroll
        // Retry briefly in case markdown is still rendering
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (doScroll() || attempts >= 15) clearInterval(interval);
        }, 30);
      }
    },
    []
  );

  return (
    <div
      className={`h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden`}
    >
      {/* Toolbar */}
      <Toolbar
        view={view}
        setView={setView}
        dark={dark}
        toggleDark={() => setDark((d) => !d)}
        wordCount={wordCount}
      />

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex">
        {/* Split view */}
        {view === "split" && (
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 border-r border-[var(--border)] overflow-hidden">
              <Editor value={source} onChange={setSource} />
            </div>
            <div className="flex-1 overflow-hidden">
              <Preview source={source} />
            </div>
          </div>
        )}

        {/* Editor only */}
        {view === "editor" && (
          <div className="flex-1 overflow-hidden">
            <Editor value={source} onChange={setSource} />
          </div>
        )}

        {/* Preview only */}
        {view === "preview" && (
          <div className="flex-1 overflow-hidden">
            <Preview source={source} scrollContainerId="preview-scroll-container" />
          </div>
        )}

        {/* Mind map */}
        {view === "markmap" && (
          <div className="flex-1 overflow-hidden">
            <MarkmapView source={source} />
          </div>
        )}

        {/* Slides */}
        {view === "slides" && (
          <div className="flex-1 overflow-hidden">
            <SlidesView source={source} />
          </div>
        )}

        {/* TOC */}
        {view === "toc" && (
          <div className="flex-1 overflow-hidden flex">
            <div className="w-72 xl:w-80 flex-shrink-0 border-r border-[var(--border)] overflow-hidden">
              <TocView source={source} onJump={handleTocJump} />
            </div>
            <div className="flex-1 overflow-hidden">
              <Preview source={source} scrollContainerId="preview-scroll-container" />
            </div>
          </div>
        )}

        {/* Summary */}
        {view === "summary" && (
          <div className="flex-1 overflow-hidden">
            <SummaryView source={source} />
          </div>
        )}
      </main>

      {/* Status bar */}
      <footer className="no-print flex items-center justify-between px-4 py-1.5 border-t border-[var(--border)] bg-indigo-600 text-white text-xs flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="opacity-80">MarkPro</span>
          <span className="opacity-50">·</span>
          <span className="opacity-70">
            {view.charAt(0).toUpperCase() + view.slice(1)} Mode
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="opacity-70 tabular-nums">
            {wordCount.toLocaleString()} words
          </span>
          <span className="opacity-50">·</span>
          <span className="opacity-70 tabular-nums">
            {source.split("\n").length} lines
          </span>
          <span className="opacity-50">·</span>
          <span className="opacity-70">
            {dark ? "🌙 Dark" : "☀️ Light"}
          </span>
        </div>
      </footer>


    </div>
  );
}
