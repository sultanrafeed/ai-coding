"use client";

import { useState } from "react";
import { HintPanel } from "./HintPanel";
import { ComplexityPanel } from "./ComplexityPanel";
import { ErrorPanel } from "./ErrorPanel";
import { cn } from "@/lib/cn";

const TABS = [
  { id: "hint", label: "💡 Hints" },
  { id: "complexity", label: "⚡ Complexity" },
  { id: "debug", label: "🐛 Debug" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AIPanel() {
  const [active, setActive] = useState<TabId>("hint");

  return (
    <div className="flex flex-col border-t border-slate-800/60 bg-[#0d1117] flex-shrink-0" style={{ height: "260px" }}>
      {/* Tab bar */}
      <div className="flex items-center gap-0.5 px-3 pt-2 border-b border-slate-800/60 flex-shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors border-b-2 -mb-px",
              active === tab.id
                ? "text-indigo-300 border-indigo-500 bg-slate-800/40"
                : "text-slate-500 border-transparent hover:text-slate-300",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 min-h-0 overflow-hidden p-3">
        {active === "hint" && <HintPanel />}
        {active === "complexity" && <ComplexityPanel />}
        {active === "debug" && <ErrorPanel />}
      </div>
    </div>
  );
}
