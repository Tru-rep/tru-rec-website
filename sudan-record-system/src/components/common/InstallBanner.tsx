import { useEffect, useState } from 'react';
import { APP_NAME } from '@/utils/constants';

const DISMISS_KEY = 'srs-install-banner-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIosSafari(): boolean {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream;
}

interface InstallBannerProps {
  id?: string;
}

/** One-time PWA install hint — Android via beforeinstallprompt, iOS via Safari instructions. */
export function InstallBanner({ id }: InstallBannerProps) {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) === '1' || isStandalone()) return;

    if (isIosSafari()) {
      setIosHint(true);
      setVisible(true);
      return;
    }

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  }

  if (!visible) return null;

  return (
    <div
      id={id}
      className="rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold">ثبّت {APP_NAME} على جهازك</p>
          {iosHint ? (
            <p className="mt-1 text-brand-800/90">
              في Safari: اضغط زر المشاركة{' '}
              <span aria-hidden className="inline-block px-0.5">
                ⎙
              </span>{' '}
              ثم «إضافة إلى الشاشة الرئيسية».
            </p>
          ) : (
            <p className="mt-1 text-brand-800/90">
              ثبّت التطبيق للوصول السريع حتى بدون اتصال بالإنترنت.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded p-1 text-brand-600 hover:bg-brand-100"
          aria-label="إغلاق"
        >
          ✕
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {!iosHint && deferredPrompt && (
          <button
            type="button"
            onClick={handleInstall}
            className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700"
          >
            تثبيت التطبيق
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg border border-brand-200 bg-white px-4 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-50"
        >
          لاحقاً
        </button>
      </div>
    </div>
  );
}
