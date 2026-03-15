import React, { useRef, useCallback } from "react";

interface EditorProps {
  value: string;
  onChange: (v: string) => void;
  editorRef?: React.RefObject<HTMLTextAreaElement | null>;
  scrollSync?: boolean;
  onToggleScrollSync?: () => void;
}

export default function Editor({ value, onChange, editorRef, scrollSync, onToggleScrollSync }: EditorProps) {
  const internalRef = useRef<HTMLTextAreaElement | null>(null);
  const textareaRef = editorRef ?? internalRef;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const ta = textareaRef.current;
      if (!ta) return;

      if (e.key === "Tab") {
        e.preventDefault();
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const newVal = value.substring(0, start) + "  " + value.substring(end);
        onChange(newVal);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 2;
        });
      }
    },
    [value, onChange]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Editor header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 tracking-widest uppercase">
          Markdown Source
        </span>
        <div className="flex items-center gap-2">
          {onToggleScrollSync !== undefined && (
            <button
              onClick={onToggleScrollSync}
              title={scrollSync ? "Disable scroll sync" : "Enable scroll sync"}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border transition-all ${
                scrollSync
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "text-gray-400 border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:text-indigo-500"
              }`}
            >
              ⇅ Sync
            </button>
          )}
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        className="flex-1 w-full resize-none outline-none p-4 font-mono text-sm leading-relaxed bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600"
        placeholder="Type your Markdown here…"
      />

      {/* Footer line count */}
      <div className="px-4 py-1.5 border-t border-[var(--border)] bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
        <span className="text-xs text-gray-400 dark:text-gray-600">
          {value.split("\n").length} lines · {value.length} characters
        </span>
      </div>
    </div>
  );
}
