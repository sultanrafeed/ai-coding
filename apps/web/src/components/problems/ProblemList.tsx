"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { Problem } from "@ai-coding/types";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";

type Difficulty = "all" | "easy" | "medium" | "hard";

const PAGE_SIZE = 50;

export function ProblemList() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("all");
  const [page, setPage] = useState(0);

  const { data: problems, isLoading, isError } = useQuery<Problem[]>({
    queryKey: ["problems"],
    queryFn: () => fetch("/api/problems").then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  const filtered = useMemo(() => {
    if (!problems) return [];
    return problems.filter((p) => {
      if (difficulty !== "all" && p.difficulty !== difficulty) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [problems, difficulty, search]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search problems…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-900 border border-slate-700/60 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/60 focus:border-indigo-500/60"
          />
        </div>
        <div className="flex gap-1 p-1 bg-slate-900 border border-slate-700/60 rounded-lg">
          {(["all", "easy", "medium", "hard"] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => { setDifficulty(d); setPage(0); }}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors",
                difficulty === d
                  ? "bg-slate-700 text-slate-100 shadow-sm"
                  : "text-slate-400 hover:text-slate-200",
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-800/60 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-slate-500 text-sm">
            <Spinner /> Loading problems…
          </div>
        ) : isError ? (
          <div className="text-center py-20 text-rose-400 text-sm">
            Failed to load problems. Is the API running?
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="grid grid-cols-[3rem_1fr_7rem_1fr] gap-3 px-5 py-2.5 bg-slate-900 border-b border-slate-800/60 text-xs text-slate-500 uppercase tracking-wider font-medium">
              <span>#</span>
              <span>Title</span>
              <span>Difficulty</span>
              <span>Topics</span>
            </div>

            {/* Rows */}
            {paginated.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm">
                No problems match your filters
              </div>
            ) : (
              paginated.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/problems/${p.slug}`}
                  className="grid grid-cols-[3rem_1fr_7rem_1fr] gap-3 px-5 py-3.5 border-b border-slate-800/40 last:border-b-0 hover:bg-slate-800/30 transition-colors group"
                >
                  <span className="text-xs text-slate-500 self-center font-mono">
                    {page * PAGE_SIZE + i + 1}
                  </span>
                  <span className="text-sm text-slate-200 group-hover:text-white transition-colors self-center font-medium truncate pr-2">
                    {p.title}
                  </span>
                  <span className="self-center">
                    <Badge variant={p.difficulty}>{capitalize(p.difficulty)}</Badge>
                  </span>
                  <div className="flex flex-wrap gap-1 self-center">
                    {p.patterns.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="tag">
                        {tag}
                      </Badge>
                    ))}
                    {p.patterns.length > 3 && (
                      <span className="text-xs text-slate-600">+{p.patterns.length - 3}</span>
                    )}
                  </div>
                </Link>
              ))
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            {filtered.length} problem{filtered.length !== 1 ? "s" : ""}
            {difficulty !== "all" || search ? " matched" : ""}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-xs rounded-md border border-slate-700/60 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            <span className="px-3 text-xs text-slate-400">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-xs rounded-md border border-slate-700/60 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
