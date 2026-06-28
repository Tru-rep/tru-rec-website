import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { ROLE_LABELS } from '@/utils/constants';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-charcoal">الإعدادات</h1>

      <section className="card-base divide-y divide-slate-100">
        <div className="p-4">
          <h2 className="text-sm font-bold text-brand-600">الحساب</h2>
        </div>
        <Row label="البريد الإلكتروني" value={profile?.email ?? '—'} />
        <Row label="الاسم" value={profile?.full_name || '—'} />
        <Row label="الدور" value={profile ? ROLE_LABELS[profile.role] : '—'} />
      </section>

      <section className="card-base divide-y divide-slate-100">
        <div className="p-4">
          <h2 className="text-sm font-bold text-brand-600">المظهر</h2>
        </div>
        <div className="flex items-center justify-between p-4">
          <span className="text-sm text-slate-600">الوضع الداكن</span>
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
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-charcoal" dir="ltr">
        {value}
      </span>
    </div>
  );
}
