import type { ReactNode } from 'react';
import { Spinner } from '@/components/ui/Spinner';

/** Full-area loading state. */
export function LoadingState({ label = 'جارٍ التحميل...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500 dark:text-slate-400">
      <Spinner size="lg" className="text-brand-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

/** Empty list / no results state. */
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
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
      <div className="text-4xl">🗂️</div>
      <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
      {message && <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">{message}</p>}
      {action}
    </div>
  );
}

/** Error state with optional retry. */
export function ErrorState({
  message = 'حدث خطأ غير متوقع.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50 py-12 text-center dark:border-red-900/50 dark:bg-red-950/30">
      <div className="text-3xl">⚠️</div>
      <p className="max-w-sm text-sm text-red-700 dark:text-red-300">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}
