import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="w-64 border-r p-4">
      <nav className="flex flex-col gap-2">
        <Link href="/problems">Problems</Link>
        <Link href="/profile">Profile</Link>
      </nav>
    </aside>
  );
}
