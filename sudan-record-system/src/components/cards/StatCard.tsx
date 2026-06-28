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
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-charcoal">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
        {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}
