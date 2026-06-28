import imageCompression from 'browser-image-compression';

/**
 * Compress an image file client-side before upload to save storage/bandwidth.
 * Falls back to the original file if compression fails for any reason.
 */
export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.6,
    maxWidthOrHeight: 1280,
    useWebWorker: true,
    fileType: 'image/jpeg' as const,
  };

  try {
    const compressed = await imageCompression(file, options);
    // Preserve a sensible filename with the new extension.
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    return new File([compressed], `${baseName}.jpg`, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

/** Create an object URL for previewing a selected image. Caller must revoke it. */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}
