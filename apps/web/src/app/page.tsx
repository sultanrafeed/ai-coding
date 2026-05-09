import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>AI Coding Platform</h1>
      <Link href="/problems">Browse Problems</Link>
    </main>
  );
}
