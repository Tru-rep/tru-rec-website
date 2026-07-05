import { cn } from '@/utils/cn';
import { APP_NAME, APP_TAGLINE } from '@/utils/constants';

interface LogoProps {
  compact?: boolean;
  className?: string;
  light?: boolean;
}

export function Logo({ compact = false, className, light = false }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <img
        src="/icons/icon-192.png"
        alt=""
        className="h-10 w-10 shrink-0 rounded-lg object-cover shadow-sm"
        aria-hidden
      />
      {!compact && (
        <div className="min-w-0">
          <p className={cn('truncate text-base font-bold leading-tight', light ? 'text-white' : 'text-white')}>
            {APP_NAME}
          </p>
          <p className={cn('text-[10px]', light ? 'text-slate-300' : 'text-slate-400')}>
            {APP_TAGLINE}
          </p>
        </div>
      )}
    </div>
  );
}
