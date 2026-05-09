import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../lib/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50",
          {
            default: "bg-blue-600 text-white hover:bg-blue-700",
            outline: "border border-zinc-700 hover:bg-zinc-800",
            ghost: "hover:bg-zinc-800",
          }[variant],
          { sm: "h-8 px-3 text-sm", md: "h-10 px-4", lg: "h-12 px-6 text-lg" }[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
