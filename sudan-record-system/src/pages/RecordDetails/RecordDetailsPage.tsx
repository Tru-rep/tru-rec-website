import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRecord, useDeleteRecord } from '@/hooks/useRecords';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { LoadingState, ErrorState } from '@/components/common/StateViews';
import { formatDateTime } from '@/utils/format';
import { GENDER_LABELS } from '@/utils/constants';
import { paths } from '@/routes/paths';
import type { RecordRow } from '@/types';

export default function RecordDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { notify } = useToast();
  const recordQuery = useRecord(id);
  const deleteRecord = useDeleteRecord();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (recordQuery.isLoading) return <LoadingState />;
  if (recordQuery.isError || !recordQuery.data)
    return <ErrorState message="تعذر تحميل السجل" onRetry={() => recordQuery.refetch()} />;

  const record = recordQuery.data;

  async function handleDelete() {
    if (!id) return;
    try {
      await deleteRecord.mutateAsync({ id, photoUrl: record.photo_url });
      notify('تم حذف السجل', 'success');
      navigate(paths.search, { replace: true });
    } catch (err) {
      notify(err instanceof Error ? err.message : 'تعذر حذف السجل', 'error');
    } finally {
      setConfirmOpen(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-charcoal hover:bg-surface-card"
        >
          ‹ رجوع
        </button>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => navigate(paths.editRecord(record.id))}>
            تعديل البيانات
          </Button>
          {isAdmin && (
            <Button size="sm" variant="danger" onClick={() => setConfirmOpen(true)}>
              حذف السجل
            </Button>
          )}
        </div>
      </div>

      <div className="card-base overflow-hidden">
        <div className="grid grid-cols-1 gap-0 md:grid-cols-[220px_1fr]">
          <div className="flex flex-col items-center gap-4 border-b border-slate-100 bg-surface-card p-6 md:border-b-0 md:border-l">
            <Avatar src={record.photo_url} name={record.full_name} size="xl" className="!h-48 !w-48 !rounded-xl !text-5xl" />
          </div>
          <div className="p-5">
            <h1 className="mb-1 text-2xl font-bold text-brand-600">{record.full_name}</h1>
            {record.nickname && <p className="mb-4 text-sm text-slate-500">اللقب: {record.nickname}</p>}
            <div className="overflow-hidden rounded-lg border border-slate-100">
              <DetailRow label="العمر" value={record.age != null ? String(record.age) : null} />
              <DetailRow label="الجنس" value={record.gender ? GENDER_LABELS[record.gender] : null} />
              <DetailRow label="المهنة" value={record.profession} />
              <DetailRow label="السكن" value={record.address} />
              <DetailRow label="العلامة الظاهرة" value={record.visible_marks} />
              <DetailRow label="نوع الجريمة" value={record.crime_type} />
              <DetailRow label="رقم البلاغ" value={record.report_number} />
              <DetailRow label="ملاحظات القضية" value={record.case_notes} />
              <DetailRow label="ملاحظات إضافية" value={record.additional_notes} />
            </div>
          </div>
        </div>
      </div>

      <div className="card-base p-4 text-xs text-slate-500">
        <p>أُنشئ في: {formatDateTime(record.created_at)}</p>
        <p>آخر تحديث: {formatDateTime(record.updated_at)}</p>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="حذف السجل"
        message={`هل أنت متأكد من حذف سجل «${record.full_name}»؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف"
        loading={deleteRecord.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: RecordRow[keyof RecordRow] | null }) {
  const display = value === null || value === undefined || value === '' ? '—' : String(value);
  return (
    <div className="info-table-row">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-charcoal">{display}</span>
    </div>
  );
}
