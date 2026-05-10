"use client";

import { useEffect } from "react";
import { useEditorStore } from "@/store/editor";

export function ProblemSlugSync({ slug }: { slug: string }) {
  const setProblemSlug = useEditorStore((s) => s.setProblemSlug);
  useEffect(() => {
    setProblemSlug(slug);
  }, [slug, setProblemSlug]);
  return null;
}
