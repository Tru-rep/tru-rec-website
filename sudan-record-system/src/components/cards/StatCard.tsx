import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: string;
  hint?: string;
}

export function StatCard({ label, value, icon, hint }: StatCardProps) {
  return (
    <div className="card-base flex items-center gap-4 p-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-2xl dark:bg-brand-900/40">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}
