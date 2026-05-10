"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/editor";
import { Spinner } from "@/components/ui/Spinner";

interface ComplexityResult {
  time_complexity: string;
  space_complexity: string;
  explanation: string;
  confidence: number;
}

export function ComplexityPanel() {
  const { code, language } = useEditorStore();
  const [result, setResult] = useState<ComplexityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/ai/complexity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      setResult(await res.json());
    } catch {
      setError("Analysis failed. Make sure the AI service is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto p-1">
      <p className="text-xs text-slate-500 leading-relaxed">
        Analyze time and space complexity of your current code, compared against
        the canonical solution.
      </p>

      <button
        onClick={analyze}
        disabled={loading || !code.trim()}
        className="self-start flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
      >
        {loading ? (
          <>
            <Spinner className="text-white" /> Analyzing…
          </>
        ) : (
          "Analyze Complexity"
        )}
      </button>

      {error && <p className="text-xs text-rose-400">{error}</p>}

      {result && (
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <ComplexityCard label="Time" value={result.time_complexity} />
            <ComplexityCard label="Space" value={result.space_complexity} />
          </div>
          <p className="text-xs text-slate-300 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3 leading-relaxed">
            {result.explanation}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-16 shrink-0">Confidence</span>
            <div className="flex-1 h-1 bg-slate-700/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${result.confidence * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-400 w-8 text-right">
              {Math.round(result.confidence * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function ComplexityCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
        {label} Complexity
      </div>
      <div className="text-sm font-mono font-semibold text-indigo-300">{value}</div>
    </div>
  );
}
