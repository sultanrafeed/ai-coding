"use client";

import { useQuery } from "@tanstack/react-query";
import type { Problem } from "@ai-coding/types";

interface Props {
  slug: string;
}

export function ProblemDescription({ slug }: Props) {
  const { data: problem, isLoading } = useQuery<Problem>({
    queryKey: ["problem", slug],
    queryFn: () => fetch(`/api/problems/${slug}`).then((r) => r.json()),
  });

  if (isLoading) return <div>Loading...</div>;
  if (!problem) return <div>Problem not found</div>;

  return (
    <div className="w-1/2 p-6 overflow-y-auto border-r">
      <h1>{problem.title}</h1>
      <span>{problem.difficulty}</span>
      <div dangerouslySetInnerHTML={{ __html: problem.descriptionHtml }} />
    </div>
  );
}
