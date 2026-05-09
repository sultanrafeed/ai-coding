"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { Problem } from "@ai-coding/types";

export function ProblemList() {
  const { data: problems, isLoading } = useQuery<Problem[]>({
    queryKey: ["problems"],
    queryFn: () => fetch("/api/problems").then((r) => r.json()),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {problems?.map((p) => (
        <li key={p.id}>
          <Link href={`/problems/${p.slug}`}>{p.title}</Link>
          <span>{p.difficulty}</span>
        </li>
      ))}
    </ul>
  );
}
