import { useEffect, useRef, useState, useCallback } from "react";
import { parseMarkdown } from "../lib/markdownParser";
import { extractSlides } from "../lib/markdownParser";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Grid2x2,
  Play,
  X,
} from "lucide-react";

interface SlidesViewProps {
  source: string;
}

const SLIDE_THEMES = [
  {
    name: "Indigo",
    accent: "#6366f1",
    bar: "from-indigo-600 to-violet-600",
    badge: "bg-indigo-600",
    dot: "bg-indigo-600",
    num: "text-indigo-400",
  },
  {
    name: "Teal",
    accent: "#14b8a6",
    bar: "from-teal-500 to-cyan-500",
    badge: "bg-teal-500",
    dot: "bg-teal-500",
    num: "text-teal-400",
  },
  {
    name: "Rose",
    accent: "#f43f5e",
    bar: "from-rose-500 to-pink-500",
    badge: "bg-rose-500",
    dot: "bg-rose-500",
    num: "text-rose-400",
  },
  {
    name: "Amber",
    accent: "#f59e0b",
    bar: "from-amber-500 to-orange-500",
    badge: "bg-amber-500",
    dot: "bg-amber-500",
    num: "text-amber-400",
  },
];

export default function SlidesView({ source }: SlidesViewProps) {
  const slides = extractSlides(source);
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [grid, setGrid] = useState(false);
  const [themeIdx, setThemeIdx] = useState(0);
  const slideRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = SLIDE_THEMES[themeIdx];

  // Reset to slide 0 when content changes
  useEffect(() => {
    setCurrent(0);
  }, [source]);

  // Render current slide markdown
  useEffect(() => {
    if (slideRef.current && slides[current] !== undefined) {
      slideRef.current.innerHTML = parseMarkdown(slides[current]);
    }
  }, [current, slides]);

  // Scroll content area to top when slide changes
  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [current]);

  const prev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);
  const next = useCallback(
    () => setCurrent((c) => Math.min(slides.length - 1, c + 1)),
    [slides.length]
  );

  // Keyboard navigation (only when not in grid view)
  useEffect(() => {
    if (grid) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        prev();
      }
      if (e.key === "Escape" && fullscreen) setFullscreen(false);
      if (e.key === "f" || e.key === "F") setFullscreen((f) => !f);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, grid, fullscreen]);

  // Fullscreen API
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (fullscreen) {
      if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    } else {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    }
  }, [fullscreen]);

  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) setFullscreen(false);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  if (slides.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-gray-400 dark:text-gray-600">
        <Grid2x2 size={32} className="mb-3 opacity-30" />
        <p className="text-sm font-medium">No slides found</p>
        <p className="text-xs mt-1 opacity-60">
          Separate slides with <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">---</code>
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex flex-col h-full ${
        fullscreen
          ? "fixed inset-0 z-[100] bg-gray-950"
          : ""
      }`}
    >
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-gray-50 dark:bg-gray-800/60 flex-shrink-0 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 tracking-widest uppercase">
            Slides
          </span>
          <span className="text-xs text-gray-300 dark:text-gray-600">|</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {current + 1} <span className="text-gray-300 dark:text-gray-600">/</span> {slides.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Theme switcher */}
          <div className="flex items-center gap-1 mr-1">
            {SLIDE_THEMES.map((t, i) => (
              <button
                key={t.name}
                onClick={() => setThemeIdx(i)}
                title={t.name}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  i === themeIdx ? "border-gray-400 scale-110" : "border-transparent opacity-60"
                }`}
                style={{ backgroundColor: t.accent }}
              />
            ))}
          </div>

          <button
            onClick={() => setGrid((g) => !g)}
            title={grid ? "Slide view" : "Grid overview"}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              grid
                ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            }`}
          >
            <Grid2x2 size={13} />
            <span className="hidden sm:inline">{grid ? "Grid" : "Grid"}</span>
          </button>

          <button
            onClick={() => setFullscreen((f) => !f)}
            title={fullscreen ? "Exit fullscreen (Esc)" : "Fullscreen (F)"}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            {fullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span className="hidden sm:inline">{fullscreen ? "Exit" : "Full"}</span>
          </button>
        </div>
      </div>

      {/* ── Grid Overview ── */}
      {grid ? (
        <div className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-gray-900">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {slides.map((slide, i) => (
              <GridSlideThumb
                key={i}
                idx={i}
                source={slide}
                active={i === current}
                theme={theme}
                onClick={() => {
                  setCurrent(i);
                  setGrid(false);
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        /* ── Single Slide View ── */
        <div className="flex-1 flex flex-col items-center justify-start overflow-y-auto py-8 px-4 bg-gradient-to-br from-gray-100 to-indigo-50/40 dark:from-gray-900 dark:to-gray-950">
          {/* Slide card */}
          <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-[var(--border)] flex flex-col relative overflow-hidden">
            {/* Top accent gradient bar */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${theme.bar} flex-shrink-0`} />

            {/* Slide number badge */}
            <div className={`absolute top-4 right-5 text-xs font-bold ${theme.num} select-none`}>
              {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </div>

            {/* Content — scrollable if tall */}
            <div
              ref={contentRef}
              className="overflow-y-auto"
              style={{ maxHeight: fullscreen ? "calc(100vh - 220px)" : "62vh", minHeight: "260px" }}
            >
              <div
                ref={slideRef}
                className="md-preview p-10 pt-8 text-gray-800 dark:text-gray-100"
              />
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--border)] bg-gray-50 dark:bg-gray-800/80 flex-shrink-0">
              <div className="flex gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    title={`Slide ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === current ? `${theme.dot} w-6` : "bg-gray-300 dark:bg-gray-600 w-2 hover:bg-gray-400 dark:hover:bg-gray-500"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400 hidden sm:inline">
                ← → to navigate · F for fullscreen
              </span>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={prev}
              disabled={current === 0}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white dark:bg-gray-800 border border-[var(--border)] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft size={16} /> Previous
            </button>

            {/* Jump to slide */}
            <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <Play size={10} className="opacity-50" />
              <span>Slide {current + 1}</span>
            </div>

            <button
              onClick={next}
              disabled={current === slides.length - 1}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${theme.bar} hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm`}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-4xl mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${theme.bar} transition-all duration-500`}
              style={{ width: `${((current + 1) / slides.length) * 100}%` }}
            />
          </div>

          {/* Fullscreen close hint */}
          {fullscreen && (
            <button
              onClick={() => setFullscreen(false)}
              className="fixed top-4 right-4 z-50 p-2 rounded-full bg-gray-800/80 text-white hover:bg-gray-700 transition-colors"
              title="Exit fullscreen (Esc)"
            >
              <X size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Grid thumbnail component ── */
function GridSlideThumb({
  idx,
  source,
  active,
  theme,
  onClick,
}: {
  idx: number;
  source: string;
  active: boolean;
  theme: (typeof SLIDE_THEMES)[0];
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = parseMarkdown(source);
    }
  }, [source]);

  return (
    <button
      onClick={onClick}
      className={`relative group bg-white dark:bg-gray-800 rounded-xl border-2 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 text-left ${
        active
          ? "border-indigo-500 ring-2 ring-indigo-400/30 shadow-indigo-200 dark:shadow-indigo-900"
          : "border-[var(--border)] hover:border-gray-300 dark:hover:border-gray-500"
      }`}
    >
      {/* Accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${theme.bar}`} />

      {/* Mini content preview — scaled down via CSS transform */}
      <div className="overflow-hidden relative" style={{ height: "140px" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ transform: "scale(0.35)", transformOrigin: "top left", width: "285%", height: "285%" }}
        >
          <div ref={ref} className="md-preview p-6 text-gray-800 dark:text-gray-100" />
        </div>
      </div>

      {/* Slide number footer */}
      <div className={`px-3 py-1.5 border-t border-[var(--border)] flex items-center justify-between ${active ? "bg-indigo-50 dark:bg-indigo-900/20" : "bg-gray-50 dark:bg-gray-800/80"}`}>
        <span className={`text-[10px] font-bold ${active ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400"}`}>
          Slide {idx + 1}
        </span>
        {active && (
          <span className="text-[9px] font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
            Current
          </span>
        )}
      </div>
    </button>
  );
}
