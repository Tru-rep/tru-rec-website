import { Link } from 'react-router-dom';
import { paths } from '@/routes/paths';
import { Button } from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-4xl">🧭</div>
      <h1 className="text-2xl font-bold text-charcoal">الصفحة غير موجودة</h1>
      <p className="text-sm text-slate-500">تعذر العثور على الصفحة التي تبحث عنها.</p>
      <Link to={paths.dashboard}>
        <Button>العودة للرئيسية</Button>
      </Link>
    </div>
  );
}
