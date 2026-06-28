import { supabase } from '@/lib/supabaseClient';
import { env } from '@/lib/env';

/** Signed URL lifetime in seconds (1 hour). */
const SIGNED_URL_TTL = 3600;

/**
 * Photo storage for the private `record-photos` bucket.
 * The DB stores a storage **path** (e.g. `{recordId}/{timestamp}.jpg`).
 * Legacy rows may still hold a full public URL — `extractStoragePath` handles both.
 */
export const storageService = {
  /**
   * Upload a compressed image and return its storage path (store in `photo_url`).
   */
  async uploadPhoto(file: File, recordId: string): Promise<string> {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${recordId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from(env.photoBucket)
      .upload(path, file, { upsert: true, contentType: file.type });

    if (error) throw error;
    return path;
  },

  /** Resolve a stored path or legacy URL to a time-limited signed URL for display. */
  async resolvePhotoUrl(stored: string | null | undefined): Promise<string | null> {
    if (!stored) return null;
    const path = extractStoragePath(stored);
    if (!path) return null;

    const { data, error } = await supabase.storage
      .from(env.photoBucket)
      .createSignedUrl(path, SIGNED_URL_TTL);

    if (error) throw error;
    return data.signedUrl;
  },

  /** Best-effort deletion; failures should not block record deletion. */
  async deletePhoto(stored: string | null | undefined): Promise<void> {
    const path = stored ? extractStoragePath(stored) : null;
    if (!path) return;
    await supabase.storage.from(env.photoBucket).remove([path]);
  },
};

/** Parse a storage path from a path string or legacy public/signed URL. */
export function extractStoragePath(stored: string): string | null {
  if (!stored.includes('://')) {
    return stored.split('?')[0] || null;
  }

  const markers = [
    `/object/public/${env.photoBucket}/`,
    `/object/sign/${env.photoBucket}/`,
    `/object/authenticated/${env.photoBucket}/`,
  ];

  for (const marker of markers) {
    const idx = stored.indexOf(marker);
    if (idx !== -1) {
      return decodeURIComponent(stored.slice(idx + marker.length).split('?')[0]);
    }
  }

  return null;
}
