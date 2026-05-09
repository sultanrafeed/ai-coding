import { create } from "zustand";

type Language = "python" | "cpp" | "javascript";

interface EditorState {
  code: string;
  language: Language;
  setCode: (code: string) => void;
  setLanguage: (lang: Language) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  code: "",
  language: "python",
  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
}));
