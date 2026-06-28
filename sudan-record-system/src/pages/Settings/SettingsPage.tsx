import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { ROLE_LABELS } from '@/utils/constants';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">الإعدادات</h1>

      <section className="card-base divide-y divide-slate-200 dark:divide-slate-800">
        <div className="p-4">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">الحساب</h2>
        </div>
        <Row label="البريد الإلكتروني" value={profile?.email ?? '—'} />
        <Row label="الاسم" value={profile?.full_name || '—'} />
        <Row label="الدور" value={profile ? ROLE_LABELS[profile.role] : '—'} />
      </section>

      <section className="card-base divide-y divide-slate-200 dark:divide-slate-800">
        <div className="p-4">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">المظهر</h2>
        </div>
        <div className="flex items-center justify-between p-4">
          <span className="text-sm text-slate-600 dark:text-slate-300">الوضع الداكن</span>
          <Button variant="secondary" size="sm" onClick={toggleTheme}>
            {theme === 'dark' ? 'مُفعّل' : 'مُعطّل'}
          </Button>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-4 text-sm">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-medium text-slate-800 dark:text-slate-100" dir="ltr">
        {value}
      </span>
    </div>
  );
}
