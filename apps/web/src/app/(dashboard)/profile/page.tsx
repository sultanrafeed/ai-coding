export default function ProfilePage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-xl font-semibold text-slate-100 mb-1">Profile</h1>
        <p className="text-sm text-slate-500 mb-8">Your progress and skill assessment</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Problems Solved", value: "—" },
            { label: "Acceptance Rate", value: "—" },
            { label: "Current Streak", value: "—" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 text-center"
            >
              <div className="text-2xl font-bold text-slate-200 mb-1">{stat.value}</div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Skill Graph</h2>
          <p className="text-sm text-slate-500 italic">
            Skill assessments will appear here after you solve problems.
          </p>
        </div>
      </div>
    </div>
  );
}
