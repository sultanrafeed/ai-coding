import { create } from "zustand";
import type { Submission } from "@ai-coding/types";
import { useEditorStore } from "./editor";

interface SubmissionState {
  current: Submission | null;
  isRunning: boolean;
  submit: (payload: { code: string; language: string }) => Promise<void>;
}

async function pollUntilDone(id: string, set: (s: Partial<SubmissionState>) => void) {
  const res = await fetch(`/api/submissions/${id}`);
  const data = (await res.json()) as Partial<Submission>;
  set({ current: data as Submission });
  if (data.status === "pending" || data.status === "running") {
    setTimeout(() => pollUntilDone(id, set), 1500);
  } else {
    set({ isRunning: false });
  }
}

export const useSubmissionStore = create<SubmissionState>((set) => ({
  current: null,
  isRunning: false,
  submit: async (payload) => {
    set({ isRunning: true, current: null });
    const problemSlug = useEditorStore.getState().problemSlug;
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problemId: problemSlug, code: payload.code, language: payload.language }),
    });
    const { id } = (await res.json()) as { id: string };
    pollUntilDone(id, set);
  },
}));
