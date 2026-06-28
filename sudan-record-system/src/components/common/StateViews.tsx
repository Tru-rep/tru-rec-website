import type { ReactNode } from 'react';
import { Spinner } from '@/components/ui/Spinner';

export function LoadingState({ label = 'جارٍ التحميل...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <Spinner size="lg" className="text-brand-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({
  title = 'لا توجد بيانات',
  message,
  action,
}: {
  title?: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card-base flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-2xl">🗂️</div>
      <h3 className="text-base font-bold text-charcoal">{title}</h3>
      {message && <p className="max-w-sm text-sm text-slate-500">{message}</p>}
      {action}
    </div>
  );
}

export function ErrorState({
  message = 'حدث خطأ غير متوقع.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="card-base flex flex-col items-center justify-center gap-3 border-red-100 bg-red-50 py-12 text-center">
      <div className="text-3xl">⚠️</div>
      <p className="max-w-sm text-sm text-red-700">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700"
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}
