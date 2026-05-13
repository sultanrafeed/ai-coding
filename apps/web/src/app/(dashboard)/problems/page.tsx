import { ProblemList } from "@/components/problems/ProblemList";

export default function ProblemsPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-100">Problems</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            3,640 LeetCode problems — solve with AI-powered hints and error explanations
          </p>
        </div>
        <ProblemList />
      </div>
    </div>
  );
}
