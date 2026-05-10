import { cn } from "@/lib/cn";

type Variant = "easy" | "medium" | "hard" | "tag";

interface BadgeProps {
  variant: Variant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  easy: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  hard: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  tag: "bg-slate-700/50 text-slate-300 border border-slate-600/40 hover:border-slate-500/50",
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
