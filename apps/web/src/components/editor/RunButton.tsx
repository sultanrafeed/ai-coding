"use client";

import { useEditorStore } from "@/store/editor";
import { useSubmissionStore } from "@/store/submission";
import { Spinner } from "@/components/ui/Spinner";

export function RunButton() {
  const { code, language } = useEditorStore();
  const { submit, isRunning } = useSubmissionStore();

  return (
    <button
      onClick={() => submit({ code, language })}
      disabled={isRunning}
      className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-md bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
    >
      {isRunning ? (
        <>
          <Spinner className="text-white" /> Running…
        </>
      ) : (
        "Run Code"
      )}
    </button>
  );
}
