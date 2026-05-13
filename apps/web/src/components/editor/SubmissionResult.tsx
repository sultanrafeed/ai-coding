"use client";

import { useSubmissionStore } from "@/store/submission";

export function SubmissionResult() {
  const { current, isRunning } = useSubmissionStore();

  if (isRunning || !current?.result) return null;

  const { passedTests, totalTests, runtime, memory, stderr } = current.result;

  return (
    <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-700/60 flex-shrink-0">
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span>
          Tests:{" "}
          <span className="text-slate-200 font-medium">
            {passedTests}/{totalTests}
          </span>
        </span>
        {runtime !== undefined && (
          <span>
            Runtime:{" "}
            <span className="text-slate-200 font-medium">{runtime} ms</span>
          </span>
        )}
        {memory !== undefined && (
          <span>
            Memory:{" "}
            <span className="text-slate-200 font-medium">
              {(memory / 1024).toFixed(1)} KB
            </span>
          </span>
        )}
      </div>
      {stderr && (
        <pre className="mt-2 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/30 rounded-md p-2.5 overflow-x-auto font-mono leading-relaxed">
          {stderr}
        </pre>
      )}
    </div>
  );
}
