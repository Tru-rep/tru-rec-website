import { useState } from 'react';
import { usePhotoUrl } from '@/hooks/usePhotoUrl';
import { cn } from '@/utils/cn';
import { getInitials } from '@/utils/format';

interface AvatarProps {
  /** Storage path, legacy public URL, or a ready-to-display http(s) URL (e.g. blob preview). */
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-14 w-14 text-base',
  lg: 'h-20 w-20 text-xl',
  xl: 'h-40 w-40 text-4xl',
};

/** Photo with graceful initials fallback when missing or failing to load. */
export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const isDirectUrl = Boolean(src && (src.startsWith('blob:') || src.startsWith('data:')));
  const signedUrl = usePhotoUrl(isDirectUrl ? null : src);
  const displaySrc = isDirectUrl ? src : signedUrl;
  const showImage = displaySrc && !errored;

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-100 font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
        sizeMap[size],
        className,
      )}
    >
      {showImage ? (
        <img
          src={displaySrc as string}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
