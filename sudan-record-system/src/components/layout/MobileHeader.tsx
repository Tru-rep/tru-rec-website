import { Link } from 'react-router-dom';
import { paths } from '@/routes/paths';
import { APP_NAME } from '@/utils/constants';

/** Red mobile top bar matching the reference mockup. */
export function MobileHeader() {
  return (
    <header className="sticky top-0 z-30 bg-brand-600 px-4 py-3 text-white shadow-md lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <button type="button" className="rounded-lg p-1.5 hover:bg-brand-700" aria-label="الإشعارات">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <Link to={paths.dashboard} className="text-base font-bold">
          {APP_NAME}
        </Link>
        <Link
          to={paths.settings}
          className="rounded-lg p-1.5 hover:bg-brand-700"
          aria-label="القائمة"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
