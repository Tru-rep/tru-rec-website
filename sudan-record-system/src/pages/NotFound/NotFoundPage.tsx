import { Link } from 'react-router-dom';
import { paths } from '@/routes/paths';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="text-6xl">🧭</div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">الصفحة غير موجودة</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        تعذر العثور على الصفحة التي تبحث عنها.
      </p>
      <Link
        to={paths.dashboard}
        className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
