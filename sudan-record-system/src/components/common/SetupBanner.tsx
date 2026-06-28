import { getMissingEnvVars } from '@/lib/env';

export function SetupBanner() {
  const missing = getMissingEnvVars();
  if (missing.length === 0) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-semibold">لم يتم إعداد Supabase بعد</p>
      <p className="mt-1">
        أضف المتغيرات التالية إلى ملف <code className="rounded bg-amber-100 px-1">.env</code>:
      </p>
      <ul className="mt-2 list-inside list-disc font-mono text-xs">
        {missing.map((v) => (
          <li key={v}>{v}</li>
        ))}
      </ul>
    </div>
  );
}
