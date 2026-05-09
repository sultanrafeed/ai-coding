"use client";

import Editor from "@monaco-editor/react";
import { useEditorStore } from "@/store/editor";

interface Props {
  height?: string;
}

export function MonacoEditor({ height = "60vh" }: Props) {
  const { code, language, setCode } = useEditorStore();

  return (
    <Editor
      height={height}
      language={language}
      value={code}
      onChange={(value) => setCode(value ?? "")}
      theme="vs-dark"
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
      }}
    />
  );
}
