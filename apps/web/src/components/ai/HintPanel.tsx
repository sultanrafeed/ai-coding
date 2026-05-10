"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useEditorStore } from "@/store/editor";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";

type HintDepth = "socratic" | "conceptual" | "near-solution";

const DEPTHS: { value: HintDepth; label: string; desc: string }[] = [
  { value: "socratic", label: "Nudge", desc: "A question to point you in the right direction" },
  { value: "conceptual", label: "Concept", desc: "The algorithmic pattern and why it fits" },
  { value: "near-solution", label: "Approach", desc: "Pseudocode-level walkthrough of the solution" },
];

export function HintPanel() {
  const { code, language } = useEditorStore();
  const params = useParams<{ slug: string }>();
  const [depth, setDepth] = useState<HintDepth>("socratic");
  const [hint, setHint] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function requestHint() {
    setLoading(true);
    setHint("");
    try {
      const res = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, problemId: params.slug ?? "", depth, language }),
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
          setHint((prev) => prev + text);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2.5 h-full overflow-hidden">
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {DEPTHS.map((d) => (
          <button
            key={d.value}
            onClick={() => setDepth(d.value)}
            title={d.desc}
            className={cn(
              "px-2.5 py-1 text-xs font-medium rounded-md transition-colors border",
              depth === d.value
                ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/30"
                : "text-slate-500 border-slate-700/50 hover:text-slate-300 hover:border-slate-600",
            )}
          >
            {d.label}
          </button>
        ))}
        <button
          onClick={requestHint}
          disabled={loading}
          className="ml-auto flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
        >
          {loading ? (
            <>
              <Spinner className="text-white w-3 h-3" /> Thinking…
            </>
          ) : (
            "Get Hint"
          )}
        </button>
      </div>

      {/* Hint output */}
      <div className="flex-1 min-h-0 overflow-y-auto rounded-lg bg-slate-900/40 border border-slate-800/40">
        {hint ? (
          <p className="p-3 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
            {hint}
            {loading && <span className="inline-block w-1.5 h-3 bg-indigo-400 ml-0.5 animate-pulse rounded-sm" />}
          </p>
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-slate-600 p-4 text-center">
            {loading
              ? "Generating hint…"
              : "Select a hint depth and click Get Hint. Your code won't be judged — the AI will guide you toward the answer."}
          </div>
        )}
      </div>
    </div>
  );
}
