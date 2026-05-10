import { create } from "zustand";

type Language = "python" | "cpp" | "javascript";

interface EditorState {
  code: string;
  language: Language;
  problemSlug: string;
  setCode: (code: string) => void;
  setLanguage: (lang: Language) => void;
  setProblemSlug: (slug: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  code: "",
  language: "python",
  problemSlug: "",
  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  setProblemSlug: (problemSlug) => set({ problemSlug }),
}));
