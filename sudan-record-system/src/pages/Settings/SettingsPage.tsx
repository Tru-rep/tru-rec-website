import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { authService } from '@/services/authService';
import { profileService } from '@/services/profileService';
import { InstallBanner } from '@/components/common/InstallBanner';
import { ROLE_LABELS } from '@/utils/constants';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';

const changePasswordSchema = z
  .object({
    password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
    confirm: z.string().min(1, 'أكد كلمة المرور'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirm'],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

const displayNameSchema = z.object({
  full_name: z.string().min(1, 'الاسم مطلوب').max(200),
});

type DisplayNameValues = z.infer<typeof displayNameSchema>;

export default function SettingsPage() {
  const { profile, session, refreshProfile } = useAuth();
  const { notify } = useToast();
  const [changingPassword, setChangingPassword] = useState(false);
  const [savingName, setSavingName] = useState(false);

  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const nameForm = useForm<DisplayNameValues>({
    resolver: zodResolver(displayNameSchema),
    values: { full_name: profile?.full_name ?? '' },
  });

  async function onChangePassword(values: ChangePasswordValues) {
    setChangingPassword(true);
    try {
      await authService.updatePassword(values.password);
      passwordForm.reset();
      notify('تم تغيير كلمة المرور', 'success');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'تعذر تغيير كلمة المرور', 'error');
    } finally {
      setChangingPassword(false);
    }
  }

  async function onSaveName(values: DisplayNameValues) {
    if (!session?.user) return;
    setSavingName(true);
    try {
      await profileService.updateFullName(session.user.id, values.full_name);
      await refreshProfile();
      notify('تم تحديث الاسم', 'success');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'تعذر تحديث الاسم', 'error');
    } finally {
      setSavingName(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-charcoal">الإعدادات</h1>

      <InstallBanner />

      <section className="card-base divide-y divide-slate-100">
        <div className="p-4">
          <h2 className="text-sm font-bold text-brand-600">الحساب</h2>
        </div>
        <Row label="البريد الإلكتروني" value={profile?.email ?? '—'} />
        <Row label="الدور" value={profile ? ROLE_LABELS[profile.role] : '—'} />
      </section>

      <section className="card-base space-y-4 p-4">
        <h2 className="text-sm font-bold text-brand-600">الاسم المعروض</h2>
        <form onSubmit={nameForm.handleSubmit(onSaveName)} className="space-y-3">
          <Field
            label="الاسم"
            htmlFor="full_name"
            error={nameForm.formState.errors.full_name?.message}
          >
            <Input id="full_name" {...nameForm.register('full_name')} />
          </Field>
          <Button type="submit" size="sm" loading={savingName}>
            حفظ الاسم
          </Button>
        </form>
      </section>

      <section className="card-base space-y-4 p-4">
        <h2 className="text-sm font-bold text-brand-600">تغيير كلمة المرور</h2>
        <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-3">
          <Field
            label="كلمة المرور الجديدة"
            htmlFor="password"
            error={passwordForm.formState.errors.password?.message}
          >
            <Input id="password" type="password" autoComplete="new-password" {...passwordForm.register('password')} />
          </Field>
          <Field
            label="تأكيد كلمة المرور"
            htmlFor="confirm"
            error={passwordForm.formState.errors.confirm?.message}
          >
            <Input id="confirm" type="password" autoComplete="new-password" {...passwordForm.register('confirm')} />
          </Field>
          <Button type="submit" size="sm" loading={changingPassword}>
            تحديث كلمة المرور
          </Button>
        </form>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-charcoal" dir="ltr">
        {value}
      </span>
    </div>
  );
}
