"use client";

import { useEditorStore } from "@/store/editor";
import { useSubmissionStore } from "@/store/submission";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";

const LANGUAGES = [
  { value: "python", label: "Python 3" },
  { value: "cpp", label: "C++ 17" },
  { value: "javascript", label: "JavaScript" },
] as const;

type Lang = (typeof LANGUAGES)[number]["value"];

const STATUS_STYLES: Record<string, string> = {
  accepted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  wrong_answer: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  time_limit_exceeded: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  memory_limit_exceeded: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  compile_error: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  runtime_error: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  pending: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  running: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  accepted: "✓ Accepted",
  wrong_answer: "✗ Wrong Answer",
  time_limit_exceeded: "⏱ Time Limit",
  memory_limit_exceeded: "💾 Memory Limit",
  compile_error: "✗ Compile Error",
  runtime_error: "✗ Runtime Error",
  pending: "Pending…",
  running: "Running…",
};

export function EditorToolbar() {
  const { code, language, setLanguage } = useEditorStore();
  const { submit, isRunning, current } = useSubmissionStore();

  return (
    <div className="flex items-center justify-between px-3 h-11 bg-slate-900 border-b border-slate-700/60 flex-shrink-0">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Lang)}
        className="text-sm bg-slate-800 text-slate-200 border border-slate-600/60 rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer hover:border-slate-500 transition-colors"
      >
        {LANGUAGES.map((l) => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2.5">
        {current?.status && !isRunning && (
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
              STATUS_STYLES[current.status] ?? "bg-slate-500/10 text-slate-400 border-slate-500/20",
            )}
          >
            {STATUS_LABELS[current.status] ?? current.status}
          </span>
        )}
        <button
          onClick={() => submit({ code, language })}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-md bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
        >
          {isRunning ? (
            <>
              <Spinner className="text-white" />
              Running…
            </>
          ) : (
            <>
              <PlayIcon />
              Run Code
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor">
      <path d="M1.5 1.5L9.5 6L1.5 10.5V1.5Z" />
    </svg>
  );
}
