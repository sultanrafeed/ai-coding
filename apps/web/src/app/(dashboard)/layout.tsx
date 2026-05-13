import { Navbar } from "@/components/layout/Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0d1117]">
      <Navbar />
      <main className="flex-1 min-h-0">{children}</main>
    </div>
  );
}
