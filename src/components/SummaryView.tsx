import { countWords, extractToc } from "../lib/markdownParser";
import { Hash, AlignLeft, Layers, Clock } from "lucide-react";

interface SummaryViewProps {
  source: string;
}

export default function SummaryView({ source }: SummaryViewProps) {
  const words = countWords(source);
  const lines = source.split("\n").length;
  const chars = source.length;
  const headings = extractToc(source);
  const readingMinutes = Math.max(1, Math.round(words / 200));

  const stats = [
    {
      icon: <AlignLeft size={16} className="text-indigo-500" />,
      label: "Words",
      value: words.toLocaleString(),
      bg: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800",
    },
    {
      icon: <Hash size={16} className="text-violet-500" />,
      label: "Headings",
      value: headings.length,
      bg: "bg-violet-50 dark:bg-violet-900/20 border-violet-100 dark:border-violet-800",
    },
    {
      icon: <Layers size={16} className="text-sky-500" />,
      label: "Lines",
      value: lines.toLocaleString(),
      bg: "bg-sky-50 dark:bg-sky-900/20 border-sky-100 dark:border-sky-800",
    },
    {
      icon: <Clock size={16} className="text-emerald-500" />,
      label: "Read time",
      value: `~${readingMinutes} min`,
      bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 tracking-widest uppercase">
          Document Summary
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {chars.toLocaleString()} characters
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6 fade-in">
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className={`flex flex-col gap-1.5 p-4 rounded-xl border ${s.bg}`}
              >
                <div className="flex items-center gap-1.5">
                  {s.icon}
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {s.label}
                  </span>
                </div>
                <span className="text-2xl font-bold text-gray-800 dark:text-gray-100 tabular-nums">
                  {s.value}
                </span>
              </div>
            ))}
          </div>

          {/* Heading structure */}
          {headings.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-[var(--border)] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--border)]">
                <div className="w-6 h-6 rounded-md bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                  <Hash size={13} className="text-violet-600 dark:text-violet-400" />
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Document Structure
                </span>
              </div>
              <div className="space-y-1">
                {headings.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2"
                    style={{ paddingLeft: `${(h.level - 1) * 16}px` }}
                  >
                    <span className="text-xs font-bold text-indigo-400 w-6 flex-shrink-0">
                      H{h.level}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {h.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
