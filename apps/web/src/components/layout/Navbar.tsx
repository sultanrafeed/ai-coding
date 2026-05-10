import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-5 h-12 bg-[#0d1117] border-b border-slate-800/70 flex-shrink-0 z-20">
      <Link
        href="/"
        className="flex items-center gap-2 text-sm font-semibold text-slate-100 hover:text-white transition-colors"
      >
        <span className="text-base leading-none">⬡</span>
        <span className="tracking-tight">AlgoAI</span>
      </Link>

      <div className="flex items-center gap-1">
        <Link
          href="/problems"
          className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-md transition-colors"
        >
          Problems
        </Link>
        <Link
          href="/profile"
          className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-md transition-colors"
        >
          Profile
        </Link>
        <div className="ml-2">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-7 h-7",
              },
            }}
          />
        </div>
      </div>
    </nav>
  );
}
