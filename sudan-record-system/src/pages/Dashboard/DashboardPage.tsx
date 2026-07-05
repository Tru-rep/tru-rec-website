import { useNavigate } from 'react-router-dom';
import { useRecentRecords, useRecord } from '@/hooks/useRecords';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { FeatureCard } from '@/components/cards/FeatureCard';
import { LoadingState, EmptyState, ErrorState } from '@/components/common/StateViews';
import { formatDate } from '@/utils/format';
import { paths } from '@/routes/paths';
import { Link } from 'react-router-dom';
import type { RecordRow } from '@/types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const recentQuery = useRecentRecords(5);
  const featuredId = recentQuery.data?.[0]?.id;
  const featuredQuery = useRecord(featuredId);

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="card-base flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <input
          type="search"
          readOnly
          onFocus={() => navigate(paths.search)}
          placeholder="اكتب اسم أو لقب للبحث..."
          className="input-base flex-1 cursor-pointer"
        />
        <Button className="w-full shrink-0 sm:w-auto" onClick={() => navigate(paths.search)}>
          بحث
        </Button>
      </div>

      {/* Main grid: profile + recent records */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {recentQuery.isLoading || (featuredId && featuredQuery.isLoading) ? (
            <LoadingState />
          ) : recentQuery.isError ? (
            <ErrorState onRetry={() => recentQuery.refetch()} />
          ) : featuredQuery.data ? (
            <ProfileShowcase record={featuredQuery.data} />
          ) : (
            <EmptyState
              title="لا توجد سجلات بعد"
              message="ابدأ بإضافة أول شخص إلى النظام."
              action={
                <Button size="sm" onClick={() => navigate(paths.addRecord)}>
                  + إضافة شخص جديد
                </Button>
              }
            />
          )}
        </div>

        <aside className="card-base flex flex-col">
          <h2 className="border-b border-slate-100 px-4 py-3 text-sm font-bold text-brand-600">
            السجلات الأخيرة
          </h2>
          <div className="flex-1 divide-y divide-slate-100">
            {recentQuery.isLoading ? (
              <div className="p-4">
                <LoadingState label="..." />
              </div>
            ) : recentQuery.data && recentQuery.data.length > 0 ? (
              recentQuery.data.map((r) => (
                <Link
                  key={r.id}
                  to={paths.recordDetails(r.id)}
                  className="flex items-center gap-3 px-4 py-3 transition hover:bg-surface-card"
                >
                  <Avatar src={r.photo_url} name={r.full_name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-charcoal">{r.full_name}</p>
                    <p className="text-[11px] text-slate-400">{formatDate(r.created_at)}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="p-4 text-center text-xs text-slate-400">لا توجد سجلات</p>
            )}
          </div>
          <div className="border-t border-slate-100 p-4">
            <Button className="w-full" onClick={() => navigate(paths.search)}>
              عرض جميع السجلات
            </Button>
          </div>
        </aside>
      </div>

      {/* Feature cards */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <FeatureCard
          icon={<span className="text-xl">🔍</span>}
          title="بحث سريع"
          description="ابحث بالاسم أو اللقب"
          onClick={() => navigate(paths.search)}
        />
        <FeatureCard
          icon={<span className="text-xl">➕</span>}
          title="إضافة بيانات"
          description="إدخال سجل جديد"
          onClick={() => navigate(paths.addRecord)}
        />
        <FeatureCard
          icon={<span className="text-xl">📷</span>}
          title="رفع صور"
          description="صور مضغوطة وآمنة"
          onClick={() => navigate(paths.addRecord)}
        />
        <FeatureCard
          icon={<span className="text-xl">🔒</span>}
          title="أمان النظام"
          description="تشفير وصلاحيات"
          onClick={() => navigate(paths.settings)}
        />
        <FeatureCard
          icon={<span className="text-xl">👥</span>}
          title="متعدد المستخدمين"
          description="مدير وموظفين"
          onClick={() => navigate(paths.users)}
        />
        <FeatureCard
          icon={<span className="text-xl">📱</span>}
          title="جميع الأجهزة"
          description="جوال وحاسوب"
        />
      </section>
    </div>
  );
}

function ProfileShowcase({ record }: { record: RecordRow }) {
  const navigate = useNavigate();

  const rows: { label: string; value: string | null; icon: string }[] = [
    { label: 'الاسم', value: record.full_name, icon: '👤' },
    { label: 'اللقب', value: record.nickname, icon: '🏷️' },
    { label: 'العمر', value: record.age != null ? `${record.age} سنة` : null, icon: '🎂' },
    { label: 'السكن', value: record.address, icon: '📍' },
    { label: 'المهنة', value: record.profession, icon: '💼' },
    { label: 'العلامة الظاهرة', value: record.visible_marks, icon: '✋' },
    { label: 'نوع الجريمة', value: record.crime_type, icon: '⚖️' },
    { label: 'رقم البلاغ', value: record.report_number, icon: '🔢' },
    { label: 'السلوك', value: record.case_notes, icon: '📋' },
  ];

  return (
    <div className="card-base overflow-hidden">
      <div className="grid grid-cols-1 gap-0 md:grid-cols-[220px_1fr]">
        <div className="flex flex-col items-center gap-4 border-b border-slate-100 bg-surface-card p-6 md:border-b-0 md:border-l">
          <Avatar src={record.photo_url} name={record.full_name} size="xl" className="!rounded-xl !h-48 !w-48 !text-5xl" />
          <Button
            className="w-full"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            }
            onClick={() => navigate(paths.editRecord(record.id))}
          >
            تعديل البيانات
          </Button>
        </div>

        <div className="p-5">
          <Link to={paths.recordDetails(record.id)}>
            <h2 className="mb-4 text-2xl font-bold text-brand-600 hover:underline">
              {record.full_name}
            </h2>
          </Link>
          <div className="overflow-hidden rounded-lg border border-slate-100">
            {rows.map((row) => (
              <div key={row.label} className="info-table-row">
                <span className="flex items-center gap-2 text-sm text-slate-500">
                  <span aria-hidden>{row.icon}</span>
                  {row.label}
                </span>
                <span className="text-sm font-semibold text-charcoal">
                  {row.value || '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
