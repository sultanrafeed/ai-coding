import Link from "next/link";

const FEATURES = [
  {
    icon: "💡",
    title: "Socratic Hints",
    description:
      "Three-level hint system — from a gentle nudge to near-solution guidance — all grounded in canonical correct solutions.",
  },
  {
    icon: "⚡",
    title: "Complexity Analysis",
    description:
      "Understand your code's time and space complexity compared against the optimal approach, with a detailed explanation.",
  },
  {
    icon: "🐛",
    title: "Error Explanation",
    description:
      "Paste a runtime error and get a precise explanation of why your logic fails, anchored to the canonical solution.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-transparent to-violet-950/20 pointer-events-none" />

      {/* Minimal nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-slate-800/60">
        <span className="flex items-center gap-2 font-semibold text-slate-100 text-sm tracking-tight">
          <span className="text-lg">⬡</span> AlgoAI
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/problems"
            className="text-sm px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-28 pb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          RAG-powered • 3,640 LeetCode problems
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white leading-tight max-w-3xl">
          Master algorithms with an{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            AI that understands your code
          </span>
        </h1>
        <p className="mt-6 text-lg text-slate-400 max-w-xl leading-relaxed">
          Not just autocomplete. An AI tutor that knows the canonical solution
          and uses it to guide — never reveal — your path to the answer.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/problems"
            className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-lg shadow-indigo-500/20"
          >
            Browse 3,640 Problems →
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 rounded-lg border border-slate-700 hover:border-slate-600 text-slate-300 font-medium text-sm transition-colors"
          >
            Create free account
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 hover:border-slate-700/60 transition-colors"
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-slate-100 text-sm mb-1.5">{f.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
