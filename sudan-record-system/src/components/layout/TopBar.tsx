import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { paths } from '@/routes/paths';
import { ROLE_LABELS } from '@/utils/constants';

/** Sticky top bar: brand, search shortcut, profile, theme toggle, logout. */
export function TopBar() {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notify } = useToast();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await signOut();
      navigate(paths.login, { replace: true });
    } catch {
      notify('تعذر تسجيل الخروج', 'error');
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link to={paths.dashboard} className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-lg text-white">
            📁
          </span>
          <span className="hidden text-sm font-bold text-slate-800 sm:block dark:text-slate-100">
            نظام السجل الرقمي
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <Link
            to={paths.search}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="بحث"
            title="بحث"
          >
            🔍
          </Link>
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="تبديل المظهر"
            title="تبديل المظهر"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <Link
            to={paths.settings}
            className="hidden items-center gap-2 rounded-xl px-2 py-1.5 text-right hover:bg-slate-100 sm:flex dark:hover:bg-slate-800"
            title="الإعدادات"
          >
            <div className="leading-tight">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                {profile?.full_name || profile?.email || 'مستخدم'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {profile ? ROLE_LABELS[profile.role] : ''}
              </p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="flex h-9 items-center rounded-xl bg-slate-100 px-3 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            خروج
          </button>
        </div>
      </div>
    </header>
  );
}
