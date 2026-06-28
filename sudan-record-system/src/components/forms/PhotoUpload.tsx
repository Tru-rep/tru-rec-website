import { useEffect, useRef, useState } from 'react';
import { compressImage, createPreviewUrl } from '@/utils/image';
import { Avatar } from '@/components/common/Avatar';
import { Spinner } from '@/components/ui/Spinner';

interface PhotoUploadProps {
  /** Existing photo URL (edit mode). */
  currentUrl?: string | null;
  name: string;
  /** Called with the compressed file ready to upload, or null if cleared. */
  onFileSelected: (file: File | null) => void;
}

/**
 * Photo picker supporting camera + gallery, with client-side compression and
 * live preview before save. Emits a compressed File to the parent form.
 */
export function PhotoUpload({ currentUrl, name, onFileSelected }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [processing, setProcessing] = useState(false);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    try {
      const compressed = await compressImage(file);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = createPreviewUrl(compressed);
      objectUrlRef.current = url;
      setPreview(url);
      onFileSelected(compressed);
    } finally {
      setProcessing(false);
    }
  }

  function clear() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPreview(null);
    onFileSelected(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <Avatar src={preview} name={name || '؟'} size="xl" />
        {processing && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
            <Spinner className="text-white" />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {/* capture="environment" prompts the camera on mobile devices. */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleChange}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          📷 اختر صورة
        </button>
        {preview && (
          <button
            type="button"
            onClick={clear}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-charcoal hover:bg-surface-card"
          >
            إزالة
          </button>
        )}
      </div>
      <p className="text-[11px] text-slate-400">يتم ضغط الصورة تلقائياً قبل الرفع</p>
    </div>
  );
}
