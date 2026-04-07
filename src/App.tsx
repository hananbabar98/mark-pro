import { useState, useEffect, useCallback, useRef } from "react";
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
  const [scrollSync, setScrollSync] = useState(true);
  const [splitRatio, setSplitRatio] = useState(0.5);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current || !splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const rawRatio = (moveEvent.clientX - rect.left) / rect.width;
      const clampedRatio = Math.min(Math.max(rawRatio, 0.2), 0.8);
      setSplitRatio(clampedRatio);
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, []);

  // Scroll sync between editor and preview in split view
  useEffect(() => {
    if (view !== "split" || !scrollSync) return;
    const editor = editorRef.current;
    const preview = previewScrollRef.current;
    if (!editor || !preview) return;

    let syncingEditor = false;
    let syncingPreview = false;

    const onEditorScroll = () => {
      if (syncingEditor) return;
      syncingPreview = true;
      const ratio = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
      preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight);
      requestAnimationFrame(() => { syncingPreview = false; });
    };

    const onPreviewScroll = () => {
      if (syncingPreview) return;
      syncingEditor = true;
      const ratio = preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
      editor.scrollTop = ratio * (editor.scrollHeight - editor.clientHeight);
      requestAnimationFrame(() => { syncingEditor = false; });
    };

    // Immediately sync preview to editor's current position when sync is enabled
    onEditorScroll();

    editor.addEventListener("scroll", onEditorScroll);
    preview.addEventListener("scroll", onPreviewScroll);
    return () => {
      editor.removeEventListener("scroll", onEditorScroll);
      preview.removeEventListener("scroll", onPreviewScroll);
    };
  }, [view, scrollSync]);


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

  const handleDownloadPdf = useCallback(() => {
    const previewEl = document.querySelector<HTMLElement>(".md-preview");
    if (!previewEl) {
      alert("No preview content available. Switch to Split, Preview, or TOC view first.");
      return;
    }

    const h1 = previewEl.querySelector("h1");
    const title = h1?.textContent?.trim() || "document";

    // Collect all page-level styles so the popup inherits the same typography
    let styles = "";
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        styles += Array.from(sheet.cssRules).map(r => r.cssText).join("\n");
      } catch { /* cross-origin sheet — skip */ }
    }

    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) {
      alert("Please allow popups to use the PDF export.");
      return;
    }

    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    ${styles}

    *, *::before, *::after { box-sizing: border-box; }

    html {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      margin: 0;
      padding: 0;
      background: #fff;
      color: #111827;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                   'Helvetica Neue', Arial, sans-serif;
    }

    .pdf-page {
      max-width: 760px;
      margin: 0 auto;
      padding: 48px 56px;
    }

    /* Override dark-mode variables for print */
    .md-preview {
      max-width: none;
      color: #111827 !important;
    }
    .md-preview h1, .md-preview h2, .md-preview h3,
    .md-preview h4, .md-preview h5, .md-preview h6 {
      color: #111827 !important;
    }
    .md-preview p, .md-preview li { color: #374151 !important; }
    .md-preview code { background: #f3f4f6 !important; color: #4f46e5 !important; }
    .md-preview pre code { background: #f3f4f6 !important; color: #1f2937 !important; }
    .md-preview blockquote { background: #f5f3ff !important; }
    .md-preview th { background: #ede9fe !important; color: #111827 !important; }
    .md-preview td { color: #374151 !important; }
    .md-preview a { color: #4f46e5 !important; }
    .md-preview strong { color: #111827 !important; }

    @media print {
      html, body { background: #fff; }
      .pdf-page { padding: 0; }
    }

    @page {
      size: A4;
      margin: 18mm 15mm;
    }
  </style>
</head>
<body>
  <div class="pdf-page">
    <div class="md-preview">${previewEl.innerHTML}</div>
  </div>
  <script>
    window.onload = function () {
      setTimeout(function () { window.print(); }, 400);
    };
  <\/script>
</body>
</html>`);

    win.document.close();
  }, []);

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
        onDownloadPdf={handleDownloadPdf}
      />

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex">
        {/* Split view */}
        {view === "split" && (
          <div ref={splitContainerRef} className="flex flex-1 overflow-hidden">
            <div style={{ width: `${splitRatio * 100}%` }} className="overflow-hidden flex-shrink-0">
              <Editor value={source} onChange={setSource} editorRef={editorRef} scrollSync={scrollSync} onToggleScrollSync={() => setScrollSync((s) => !s)} />
            </div>
            {/* Drag handle */}
            <div
              onMouseDown={handleDragStart}
              className="flex-shrink-0 flex items-center justify-center border-l border-r border-[var(--border)] bg-[var(--bg)] hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors cursor-col-resize group"
              style={{ width: "6px" }}
              title="Drag to resize"
            >
              <div className="flex flex-col gap-[3px] opacity-40 group-hover:opacity-80 transition-opacity">
                <div className="w-[3px] h-[3px] rounded-full bg-gray-500 dark:bg-gray-400" />
                <div className="w-[3px] h-[3px] rounded-full bg-gray-500 dark:bg-gray-400" />
                <div className="w-[3px] h-[3px] rounded-full bg-gray-500 dark:bg-gray-400" />
                <div className="w-[3px] h-[3px] rounded-full bg-gray-500 dark:bg-gray-400" />
              </div>
            </div>
            <div style={{ width: `${(1 - splitRatio) * 100}%` }} className="overflow-hidden flex-shrink-0">
              <Preview source={source} previewScrollRef={previewScrollRef} />
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
