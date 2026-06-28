import { getMissingEnvVars } from '@/lib/env';

/**
 * Shown when Supabase env vars are missing so the app degrades gracefully
 * instead of crashing on a fresh checkout.
 */
export function SetupBanner() {
  const missing = getMissingEnvVars();
  if (missing.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200">
      <p className="font-semibold">لم يتم إعداد Supabase بعد</p>
      <p className="mt-1">
        أضف المتغيرات التالية إلى ملف <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">.env</code>:
      </p>
      <ul className="mt-2 list-inside list-disc font-mono text-xs">
        {missing.map((v) => (
          <li key={v}>{v}</li>
        ))}
      </ul>
    </div>
  );
}
