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
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="rounded-xl bg-slate-100 px-3 py-1.5 text-sm dark:bg-slate-800"
        >
          ‹ رجوع
        </button>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => navigate(paths.editRecord(record.id))}>
            ✏️ تعديل
          </Button>
          {isAdmin && (
            <Button size="sm" variant="danger" onClick={() => setConfirmOpen(true)}>
              🗑️ حذف
            </Button>
          )}
        </div>
      </div>

      <div className="card-base flex flex-col items-center gap-4 p-6 text-center">
        <Avatar src={record.photo_url} name={record.full_name} size="xl" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {record.full_name}
          </h1>
          {record.nickname && (
            <p className="text-sm text-slate-500 dark:text-slate-400">«{record.nickname}»</p>
          )}
        </div>
      </div>

      <div className="card-base divide-y divide-slate-200 dark:divide-slate-800">
        <DetailRow label="العمر" value={record.age != null ? String(record.age) : null} />
        <DetailRow label="الجنس" value={record.gender ? GENDER_LABELS[record.gender] : null} />
        <DetailRow label="المهنة" value={record.profession} />
        <DetailRow label="العنوان" value={record.address} />
        <DetailRow label="العلامات المميزة" value={record.visible_marks} />
        <DetailRow label="نوع القضية" value={record.crime_type} />
        <DetailRow label="ملاحظات القضية" value={record.case_notes} multiline />
        <DetailRow label="ملاحظات إضافية" value={record.additional_notes} multiline />
      </div>

      <div className="card-base p-4 text-xs text-slate-500 dark:text-slate-400">
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

function DetailRow({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: RecordRow[keyof RecordRow] | null;
  multiline?: boolean;
}) {
  const display = value === null || value === undefined || value === '' ? '—' : String(value);
  return (
    <div className={multiline ? 'p-4' : 'flex items-center justify-between gap-4 p-4'}>
      <span className="shrink-0 text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span
        className={`text-sm font-medium text-slate-800 dark:text-slate-100 ${
          multiline ? 'mt-1 block whitespace-pre-wrap' : 'text-left'
        }`}
      >
        {display}
      </span>
    </div>
  );
}
