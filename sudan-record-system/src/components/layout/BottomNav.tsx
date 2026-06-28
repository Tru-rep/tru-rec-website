import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
  end?: boolean;
}

const items: NavItem[] = [
  { to: paths.dashboard, label: 'الرئيسية', icon: '🏠', end: true },
  { to: paths.search, label: 'بحث', icon: '🔍' },
  { to: paths.addRecord, label: 'إضافة', icon: '➕' },
  { to: paths.users, label: 'المستخدمون', icon: '👥', adminOnly: true },
  { to: paths.settings, label: 'الإعدادات', icon: '⚙️' },
];

/** Mobile-first bottom navigation. Hidden on large screens (top bar suffices). */
export function BottomNav() {
  const { isAdmin } = useAuth();
  const visible = items.filter((i) => !i.adminOnly || isAdmin);

  return (
    <nav className="sticky bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-5xl items-stretch justify-around">
        {visible.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition',
                isActive
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-slate-500 dark:text-slate-400',
              )
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
