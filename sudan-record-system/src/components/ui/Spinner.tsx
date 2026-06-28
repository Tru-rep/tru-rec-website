import { cn } from '@/utils/cn';

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
};

export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return (
    <span
      className={cn(
        'inline-block animate-spin rounded-full border-current border-t-transparent',
        sizeMap[size],
        className,
      )}
      role="status"
      aria-label="جارٍ التحميل"
    />
  );
}
