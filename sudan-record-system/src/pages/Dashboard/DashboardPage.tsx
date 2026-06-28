import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useRecentRecords, useRecordsCount } from '@/hooks/useRecords';
import { StatCard } from '@/components/cards/StatCard';
import { RecordCard } from '@/components/cards/RecordCard';
import { Button } from '@/components/ui/Button';
import { LoadingState, EmptyState, ErrorState } from '@/components/common/StateViews';
import { paths } from '@/routes/paths';

export default function DashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const countQuery = useRecordsCount();
  const recentQuery = useRecentRecords(5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            مرحباً، {profile?.full_name || profile?.email || 'مستخدم'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">لوحة التحكم</p>
        </div>
        <Button onClick={() => navigate(paths.addRecord)} icon={<span>➕</span>}>
          سجل جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatCard
          label="إجمالي السجلات"
          icon="🗂️"
          value={countQuery.isLoading ? '…' : (countQuery.data ?? 0)}
        />
        <button onClick={() => navigate(paths.search)} className="text-right">
          <StatCard label="بحث سريع" icon="🔍" value="ابحث" hint="اضغط للبحث في السجلات" />
        </button>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            أحدث السجلات
          </h2>
          <button
            onClick={() => navigate(paths.search)}
            className="text-sm text-brand-600 hover:underline dark:text-brand-400"
          >
            عرض الكل
          </button>
        </div>

        {recentQuery.isLoading ? (
          <LoadingState />
        ) : recentQuery.isError ? (
          <ErrorState onRetry={() => recentQuery.refetch()} />
        ) : recentQuery.data && recentQuery.data.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {recentQuery.data.map((r) => (
              <RecordCard key={r.id} record={r} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="لا توجد سجلات بعد"
            message="ابدأ بإضافة أول سجل في النظام."
            action={
              <Button onClick={() => navigate(paths.addRecord)} size="sm">
                إضافة سجل
              </Button>
            }
          />
        )}
      </section>
    </div>
  );
}
