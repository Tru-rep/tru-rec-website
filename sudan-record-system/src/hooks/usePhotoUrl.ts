import { useEffect, useState } from 'react';
import { storageService } from '@/services/storageService';

/**
 * Resolves a stored photo path (or legacy URL) to a signed URL for `<img src>`.
 */
export function usePhotoUrl(stored: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!stored) {
      setUrl(null);
      return;
    }

    let cancelled = false;
    storageService
      .resolvePhotoUrl(stored)
      .then((resolved) => {
        if (!cancelled) setUrl(resolved);
      })
      .catch(() => {
        if (!cancelled) setUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [stored]);

  return url;
}
