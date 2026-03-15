import React, { useRef, useCallback } from "react";

interface EditorProps {
  value: string;
  onChange: (v: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
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
