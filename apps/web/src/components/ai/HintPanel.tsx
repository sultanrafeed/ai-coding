"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/editor";

type HintDepth = "socratic" | "conceptual" | "near-solution";

export function HintPanel() {
  const { code } = useEditorStore();
  const [depth, setDepth] = useState<HintDepth>("socratic");
  const [hint, setHint] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function requestHint() {
    // TODO: stream hint from /api/ai/hint
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
