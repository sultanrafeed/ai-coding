export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-violet-900/10 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
