import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 border-b">
      <Link href="/">AI Coding</Link>
      <div className="flex gap-4">
        <Link href="/problems">Problems</Link>
        <Link href="/profile">Profile</Link>
        <UserButton />
      </div>
    </nav>
  );
}
