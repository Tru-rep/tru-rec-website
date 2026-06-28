import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { authService } from '@/services/authService';
import { isSupabaseConfigured } from '@/lib/env';
import { loginSchema, type LoginValues } from '@/lib/validation';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { SetupBanner } from '@/components/common/SetupBanner';
import { paths } from '@/routes/paths';

export default function LoginPage() {
  const { isAuthenticated, loading, signIn } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [forgotMode, setForgotMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: true },
  });

  if (!loading && isAuthenticated) return <Navigate to={paths.dashboard} replace />;

  async function onSubmit(values: LoginValues) {
    if (!isSupabaseConfigured) {
      notify('يجب إعداد Supabase أولاً', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await signIn(values.email, values.password);
      navigate(paths.dashboard, { replace: true });
    } catch (err) {
      notify(err instanceof Error ? translateAuthError(err.message) : 'فشل تسجيل الدخول', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgot() {
    const email = getValues('email');
    if (!email) {
      notify('أدخل بريدك الإلكتروني أولاً', 'info');
      return;
    }
    try {
      await authService.sendPasswordReset(email);
      notify('تم إرسال رابط إعادة تعيين كلمة المرور', 'success');
      setForgotMode(false);
    } catch {
      notify('تعذر إرسال رابط إعادة التعيين', 'error');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 p-4 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-3xl text-white shadow-lg">
            📁
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            نظام السجل الرقمي
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            تسجيل الدخول للوصول إلى السجلات
          </p>
        </div>

        <div className="card-base space-y-5 p-6">
          <SetupBanner />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="البريد الإلكتروني" htmlFor="email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                dir="ltr"
                placeholder="name@example.com"
                {...register('email')}
              />
            </Field>

            {!forgotMode && (
              <Field label="كلمة المرور" htmlFor="password" error={errors.password?.message}>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                />
              </Field>
            )}

            {!forgotMode && (
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input type="checkbox" className="h-4 w-4 rounded" {...register('remember')} />
                تذكرني
              </label>
            )}

            {forgotMode ? (
              <div className="space-y-3">
                <Button type="button" className="w-full" onClick={handleForgot}>
                  إرسال رابط إعادة التعيين
                </Button>
                <button
                  type="button"
                  onClick={() => setForgotMode(false)}
                  className="block w-full text-center text-sm text-brand-600 hover:underline dark:text-brand-400"
                >
                  العودة لتسجيل الدخول
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button type="submit" className="w-full" loading={submitting}>
                  تسجيل الدخول
                </Button>
                <button
                  type="button"
                  onClick={() => setForgotMode(true)}
                  className="block w-full text-center text-sm text-brand-600 hover:underline dark:text-brand-400"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

/** Map common Supabase auth errors to Arabic messages. */
function translateAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'بيانات الدخول غير صحيحة';
  if (/email not confirmed/i.test(message)) return 'لم يتم تأكيد البريد الإلكتروني بعد';
  return message;
}
