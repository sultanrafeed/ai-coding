"use client";

import Editor from "@monaco-editor/react";
import { useEditorStore } from "@/store/editor";

interface Props {
  height?: string;
}

export function MonacoEditor({ height = "100%" }: Props) {
  const { code, language, setCode } = useEditorStore();

  return (
    <Editor
      height={height}
      language={language === "cpp" ? "cpp" : language}
      value={code}
      onChange={(value) => setCode(value ?? "")}
      theme="vs-dark"
      options={{
        fontSize: 13,
        fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, monospace',
        fontLigatures: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineHeight: 1.7,
        padding: { top: 12, bottom: 12 },
        renderLineHighlight: "gutter",
        cursorBlinking: "smooth",
        smoothScrolling: true,
        contextmenu: false,
        overviewRulerBorder: false,
        hideCursorInOverviewRuler: true,
        renderWhitespace: "none",
        tabSize: 4,
        wordWrap: "off",
      }}
    />
  );
}
