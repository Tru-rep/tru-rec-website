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
import { Logo } from '@/components/layout/Logo';
import { paths } from '@/routes/paths';
import { APP_NAME } from '@/utils/constants';

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
      await signIn(values.email, values.password, { remember: values.remember ?? true });
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
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-2xl bg-charcoal px-6 py-5">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold text-charcoal">تسجيل الدخول</h1>
          <p className="mt-1 text-sm text-slate-500">للوصول إلى {APP_NAME}</p>
        </div>

        <div className="card-base space-y-5 p-6 shadow-card-lg">
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
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" className="h-4 w-4 rounded accent-brand-600" {...register('remember')} />
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
                  className="block w-full text-center text-sm font-medium text-brand-600 hover:underline"
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
                  className="block w-full text-center text-sm font-medium text-brand-600 hover:underline"
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

function translateAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'بيانات الدخول غير صالحة';
  if (/email not confirmed/i.test(message)) return 'لم يتم تأكيد البريد الإلكتروني بعد';
  return message;
}
