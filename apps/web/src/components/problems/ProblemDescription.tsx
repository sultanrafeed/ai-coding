"use client";

import { useQuery } from "@tanstack/react-query";
import type { Problem } from "@ai-coding/types";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";

interface Props {
  slug: string;
}

export function ProblemDescription({ slug }: Props) {
  const { data: problem, isLoading, isError } = useQuery<Problem>({
    queryKey: ["problem", slug],
    queryFn: () => fetch(`/api/problems/${slug}`).then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="w-[45%] flex-shrink-0 flex items-center justify-center border-r border-slate-800/60 bg-slate-950/30">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Spinner className="w-5 h-5" />
          <span className="text-sm">Loading problem…</span>
        </div>
      </div>
    );
  }

  if (isError || !problem) {
    return (
      <div className="w-[45%] flex-shrink-0 flex items-center justify-center border-r border-slate-800/60">
        <p className="text-sm text-rose-400">Problem not found</p>
      </div>
    );
  }

  return (
    <div className="w-[45%] flex-shrink-0 flex flex-col border-r border-slate-800/60 overflow-hidden">
      {/* Sticky header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-800/60 flex-shrink-0 bg-[#0d1117]">
        <h1 className="text-base font-semibold text-slate-100 leading-snug mb-2">
          {problem.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={problem.difficulty}>
            {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
          </Badge>
          {problem.patterns.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="tag">
              {tag}
            </Badge>
          ))}
          {problem.patterns.length > 4 && (
            <span className="text-xs text-slate-600">+{problem.patterns.length - 4}</span>
          )}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div
          className="problem-content"
          dangerouslySetInnerHTML={{ __html: problem.descriptionHtml }}
        />

        {/* Examples */}
        {problem.examples?.length > 0 && (
          <div className="mt-5 space-y-3">
            {problem.examples.map((ex, i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-800/50 rounded-lg p-3.5">
                <p className="text-xs font-semibold text-slate-400 mb-2">Example {i + 1}</p>
                <div className="space-y-1 text-xs font-mono">
                  <div>
                    <span className="text-slate-500">Input: </span>
                    <span className="text-slate-200">{ex.input}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Output: </span>
                    <span className="text-slate-200">{ex.output}</span>
                  </div>
                  {ex.explanation && (
                    <div className="pt-1 text-slate-400 font-sans leading-relaxed">
                      {ex.explanation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
