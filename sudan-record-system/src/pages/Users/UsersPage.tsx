import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useUsersList, useUpdateUserRole, useDeleteUser } from '@/hooks/useUsers';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { LoadingState, EmptyState, ErrorState } from '@/components/common/StateViews';
import { ROLE_LABELS, ROLE_OPTIONS } from '@/utils/constants';
import { formatDate } from '@/utils/format';
import type { Profile, UserRole } from '@/types';

export default function UsersPage() {
  const { profile } = useAuth();
  const { notify } = useToast();
  const usersQuery = useUsersList();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();
  const [toDelete, setToDelete] = useState<Profile | null>(null);

  async function onRoleChange(userId: string, role: UserRole) {
    try {
      await updateRole.mutateAsync({ userId, role });
      notify('تم تحديث الدور', 'success');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'تعذر تحديث الدور', 'error');
    }
  }

  async function onDelete() {
    if (!toDelete) return;
    try {
      await deleteUser.mutateAsync(toDelete.id);
      notify('تم حذف المستخدم', 'success');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'تعذر حذف المستخدم', 'error');
    } finally {
      setToDelete(null);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">إدارة المستخدمين</h1>

      <section className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900 dark:border-brand-800/60 dark:bg-brand-950/40 dark:text-brand-100">
        <p className="font-semibold">إضافة مستخدم جديد</p>
        <p className="mt-2 leading-relaxed text-brand-800 dark:text-brand-200">
          أنشئ المستخدمين من{' '}
          <strong>Supabase Dashboard → Authentication → Users → Add user</strong> (فعّل{' '}
          <strong>Auto Confirm User</strong>). عطّل التسجيل العام في{' '}
          <strong>Authentication → Providers → Email</strong> حتى لا يتمكن الغرباء من إنشاء حسابات.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          المستخدمون الحاليون
        </h2>
        {usersQuery.isLoading ? (
          <LoadingState />
        ) : usersQuery.isError ? (
          <ErrorState onRetry={() => usersQuery.refetch()} />
        ) : usersQuery.data && usersQuery.data.length > 0 ? (
          <div className="space-y-2">
            {usersQuery.data.map((user) => {
              const isSelf = user.id === profile?.id;
              return (
                <div key={user.id} className="card-base flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                      {user.full_name || user.email}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400" dir="ltr">
                      {user.email} · {formatDate(user.created_at)}
                    </p>
                  </div>

                  <Select
                    value={user.role}
                    disabled={isSelf || updateRole.isPending}
                    onChange={(e) => onRoleChange(user.id, e.target.value as UserRole)}
                    className="w-28"
                    aria-label={`دور ${user.email}`}
                  >
                    {ROLE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>

                  <Button
                    size="sm"
                    variant="danger"
                    disabled={isSelf}
                    onClick={() => setToDelete(user)}
                  >
                    حذف
                  </Button>
                  {isSelf && (
                    <span className="text-[10px] text-slate-400">
                      ({ROLE_LABELS[user.role]} - أنت)
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState title="لا يوجد مستخدمون" />
        )}
      </section>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="حذف المستخدم"
        message={`حذف ملف المستخدم «${toDelete?.email}»؟ (حساب Auth يبقى في Supabase حتى تحذفه من لوحة التحكم.)`}
        confirmLabel="حذف"
        loading={deleteUser.isPending}
        onConfirm={onDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
