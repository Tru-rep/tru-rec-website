import { cn } from '@/utils/cn';

interface LogoProps {
  compact?: boolean;
  className?: string;
  light?: boolean;
}

/** Shield + title branding matching the security dashboard mockup. */
export function Logo({ compact = false, className, light = false }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
          light ? 'bg-white/10' : 'bg-brand-600',
        )}
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor" aria-hidden>
          <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 2.18l6 2.25v4.66c0 4.01-2.68 7.74-6 8.87-3.32-1.13-6-4.86-6-8.87V6.43l6-2.25z" />
        </svg>
      </div>
      {!compact && (
        <div className="min-w-0">
          <p className={cn('truncate text-base font-bold leading-tight', light ? 'text-white' : 'text-white')}>
            سجل الأشخاص
          </p>
          <p className={cn('text-[10px]', light ? 'text-slate-300' : 'text-slate-400')}>
            نظام إدارة السجلات
          </p>
        </div>
      )}
    </div>
  );
}
