import { ProblemDescription } from "@/components/problems/ProblemDescription";
import { ProblemSlugSync } from "@/components/problems/ProblemSlugSync";
import { MonacoEditor } from "@/components/editor/MonacoEditor";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { SubmissionResult } from "@/components/editor/SubmissionResult";
import { AIPanel } from "@/components/ai/AIPanel";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProblemPage({ params }: Props) {
  const { slug } = await params;

  return (
    <div className="flex h-full">
      <ProblemSlugSync slug={slug} />

      {/* Left — problem description */}
      <ProblemDescription slug={slug} />

      {/* Right — editor + AI panel */}
      <div className="flex-1 flex flex-col min-w-0 border-l border-slate-800/60">
        <EditorToolbar />
        <div className="flex-1 min-h-0">
          <MonacoEditor height="100%" />
        </div>
        <SubmissionResult />
        <AIPanel />
      </div>
    </div>
  );
}
