import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { paths } from '@/routes/paths';
import { ROLE_LABELS } from '@/utils/constants';
import { Avatar } from '@/components/common/Avatar';

/** Desktop top navbar with user profile (hidden on mobile — MobileHeader used instead). */
export function TopBar() {
  const { profile } = useAuth();

  return (
    <header className="sticky top-0 z-20 hidden border-b border-slate-200 bg-white shadow-sm lg:block">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="text-sm text-slate-500">لوحة التحكم الرئيسية</div>

        <Link
          to={paths.settings}
          className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 transition hover:border-brand-200 hover:bg-brand-50"
        >
          <Avatar src={null} name={profile?.full_name || profile?.email || 'م'} size="sm" />
          <div className="text-right leading-tight">
            <p className="text-sm font-semibold text-charcoal">
              {profile?.full_name || profile?.email || 'مسؤول النظام'}
            </p>
            <p className="text-[11px] text-slate-500">
              {profile ? ROLE_LABELS[profile.role] : 'مستخدم'}
            </p>
          </div>
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
