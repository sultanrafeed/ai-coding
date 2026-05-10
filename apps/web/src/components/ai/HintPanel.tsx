"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useEditorStore } from "@/store/editor";

type HintDepth = "socratic" | "conceptual" | "near-solution";

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
        body: JSON.stringify({ code, problemId: params.slug, depth, language }),
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
    <div>
      <div>
        {(["socratic", "conceptual", "near-solution"] as HintDepth[]).map((d) => (
          <button key={d} onClick={() => setDepth(d)} aria-pressed={depth === d}>
            {d}
          </button>
        ))}
      </div>
      <button onClick={requestHint} disabled={loading}>
        {loading ? "Thinking..." : "Get Hint"}
      </button>
      {hint && <pre>{hint}</pre>}
    </div>
  );
}
