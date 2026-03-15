import React from "react";
import {
  Eye,
  Code2,
  Columns2,
  GitBranch,
  Presentation,
  List,
  FileText,
  Sun,
  Moon,
  Hash,
} from "lucide-react";

export type ViewMode =
  | "split"
  | "editor"
  | "preview"
  | "markmap"
  | "slides"
  | "toc"
  | "summary";

interface ToolbarProps {
  view: ViewMode;
  setView: (v: ViewMode) => void;
  dark: boolean;
  toggleDark: () => void;
  wordCount: number;
}

const views: { id: ViewMode; icon: React.ReactNode; label: string }[] = [
  { id: "split", icon: <Columns2 size={15} />, label: "Split" },
  { id: "editor", icon: <Code2 size={15} />, label: "Editor" },
  { id: "preview", icon: <Eye size={15} />, label: "Preview" },
  { id: "markmap", icon: <GitBranch size={15} />, label: "Mindmap" },
  { id: "slides", icon: <Presentation size={15} />, label: "Slides" },
  { id: "toc", icon: <List size={15} />, label: "TOC" },
  { id: "summary", icon: <FileText size={15} />, label: "Summary" },
];

export default function Toolbar({
  view,
  setView,
  dark,
  toggleDark,
  wordCount,
}: ToolbarProps) {
  return (
    <header className="no-print flex items-center gap-2 px-4 py-2.5 border-b border-[var(--border)] bg-white dark:bg-gray-900 shadow-sm z-10 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-1.5 mr-3 select-none">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow">
          <Hash size={14} className="text-white" strokeWidth={3} />
        </div>
        <span className="font-bold text-gray-900 dark:text-white text-sm tracking-tight hidden sm:block">
          MarkPro
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-[var(--border)] mr-1" />

      {/* View buttons */}
      <nav className="flex items-center gap-0.5 flex-1 flex-wrap">
        {views.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            title={v.label}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
              view === v.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
          >
            {v.icon}
            <span className="hidden md:inline">{v.label}</span>
          </button>
        ))}
      </nav>

      {/* Right section */}
      <div className="flex items-center gap-2 ml-2">
        {/* Word count */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-50 dark:bg-gray-800 border border-[var(--border)]">
          <span className="text-xs text-gray-400 dark:text-gray-500">Words</span>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
            {wordCount.toLocaleString()}
          </span>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          title={dark ? "Light mode" : "Dark mode"}
          className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
}
