function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        {/* Information */}
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <h2 className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h2>
        </div>

        {/* Icon */}
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color} shadow-sm`}
        >
          <Icon size={21} strokeWidth={2} className="text-white" />
        </div>
      </div>
    </div>
  );
}

export default StatCard;

