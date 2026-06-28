import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { isSupabaseConfigured } from '@/lib/env';
import { resetPasswordSchema, type ResetPasswordValues } from '@/lib/validation';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { SetupBanner } from '@/components/common/SetupBanner';
import { LoadingState } from '@/components/common/StateViews';
import { paths } from '@/routes/paths';

export default function ResetPasswordPage() {
  const { notify } = useToast();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setChecking(false);
      return;
    }

    let active = true;

    authService.getSession().then((session) => {
      if (!active) return;
      if (session) setReady(true);
      setChecking(false);
    });

    const { data: sub } = authService.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setReady(true);
        setChecking(false);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(values: ResetPasswordValues) {
    setSubmitting(true);
    try {
      await authService.updatePassword(values.password);
      notify('تم تحديث كلمة المرور بنجاح', 'success');
      await authService.signOut();
      navigate(paths.login, { replace: true });
    } catch (err) {
      notify(err instanceof Error ? err.message : 'تعذر تحديث كلمة المرور', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) return <LoadingState label="جارٍ التحقق من الرابط..." />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 p-4 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-3xl text-white shadow-lg">
            🔐
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            تعيين كلمة مرور جديدة
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            أدخل كلمة المرور الجديدة لحسابك
          </p>
        </div>

        <div className="card-base space-y-5 p-6">
          <SetupBanner />

          {!ready ? (
            <div className="space-y-3 text-center text-sm text-slate-600 dark:text-slate-300">
              <p>رابط إعادة التعيين غير صالح أو منتهٍ.</p>
              <Link
                to={paths.login}
                className="font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                العودة لتسجيل الدخول
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Field label="كلمة المرور الجديدة" htmlFor="password" error={errors.password?.message}>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  dir="ltr"
                  {...register('password')}
                />
              </Field>
              <Field label="تأكيد كلمة المرور" htmlFor="confirm" error={errors.confirm?.message}>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  dir="ltr"
                  {...register('confirm')}
                />
              </Field>
              <Button type="submit" className="w-full" loading={submitting}>
                حفظ كلمة المرور
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
