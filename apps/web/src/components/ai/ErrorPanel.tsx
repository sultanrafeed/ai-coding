"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useEditorStore } from "@/store/editor";
import { Spinner } from "@/components/ui/Spinner";

export function ErrorPanel() {
  const { code, language } = useEditorStore();
  const params = useParams<{ slug: string }>();
  const [errorText, setErrorText] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  async function explainError() {
    if (!errorText.trim()) return;
    setLoading(true);
    setExplanation("");
    try {
      const res = await fetch("/api/ai/explain-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          error: errorText,
          problemId: params.slug ?? "",
          language,
        }),
      });
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const text = line.slice(6);
          if (text === "[DONE]") break;
          setExplanation((prev) => prev + text);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto p-1">
      <p className="text-xs text-slate-500 leading-relaxed">
        Paste your error message. The AI will explain exactly why your code
        failed and what the correct approach should be.
      </p>
      <textarea
        value={errorText}
        onChange={(e) => setErrorText(e.target.value)}
        placeholder={"TypeError: list index out of range\n  at line 12..."}
        rows={3}
        className="resize-none text-xs bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500/60 font-mono leading-relaxed"
      />
      <button
        onClick={explainError}
        disabled={loading || !errorText.trim()}
        className="self-start flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-rose-700 hover:bg-rose-600 active:bg-rose-800 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
      >
        {loading ? (
          <>
            <Spinner className="text-white" /> Analyzing…
          </>
        ) : (
          "Explain Error"
        )}
      </button>
      {explanation && (
        <div className="text-xs text-slate-300 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3 leading-relaxed whitespace-pre-wrap">
          {explanation}
        </div>
      )}
    </div>
  );
}
