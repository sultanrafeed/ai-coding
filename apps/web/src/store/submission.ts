import { create } from "zustand";
import type { Submission } from "@ai-coding/types";

interface SubmissionState {
  current: Submission | null;
  isRunning: boolean;
  submit: (payload: { code: string; language: string }) => Promise<void>;
}

export const useSubmissionStore = create<SubmissionState>((set) => ({
  current: null,
  isRunning: false,
  submit: async (_payload) => {
    set({ isRunning: true });
    // TODO: POST /api/submissions and poll for result
    set({ isRunning: false });
  },
}));
