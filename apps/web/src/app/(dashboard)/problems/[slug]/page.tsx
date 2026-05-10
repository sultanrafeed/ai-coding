import { ProblemDescription } from "@/components/problems/ProblemDescription";
import { ProblemSlugSync } from "@/components/problems/ProblemSlugSync";
import { MonacoEditor } from "@/components/editor/MonacoEditor";
import { AIPanel } from "@/components/ai/AIPanel";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProblemPage({ params }: Props) {
  const { slug } = await params;

  return (
    <div className="flex h-screen">
      <ProblemSlugSync slug={slug} />
      <ProblemDescription slug={slug} />
      <div className="flex flex-col flex-1">
        <MonacoEditor />
        <AIPanel />
      </div>
    </div>
  );
}
