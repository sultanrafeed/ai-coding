"use client";

import { useEditorStore } from "@/store/editor";
import { useSubmissionStore } from "@/store/submission";

export function RunButton() {
  const { code, language } = useEditorStore();
  const { submit, isRunning } = useSubmissionStore();

  return (
    <button
      onClick={() => submit({ code, language })}
      disabled={isRunning}
    >
      {isRunning ? "Running..." : "Run"}
    </button>
  );
}
