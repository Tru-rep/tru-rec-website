import { useState } from 'react';
import { usePhotoUrl } from '@/hooks/usePhotoUrl';
import { cn } from '@/utils/cn';
import { getInitials } from '@/utils/format';

interface AvatarProps {
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

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const isDirectUrl = Boolean(src && (src.startsWith('blob:') || src.startsWith('data:')));
  const signedUrl = usePhotoUrl(isDirectUrl ? null : src);
  const displaySrc = isDirectUrl ? src : signedUrl;
  const showImage = displaySrc && !errored;

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-50 font-bold text-brand-700 ring-2 ring-brand-100',
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
