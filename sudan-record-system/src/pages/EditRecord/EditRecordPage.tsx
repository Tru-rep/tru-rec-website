import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import { useRecord, useUpdateRecord } from '@/hooks/useRecords';
import { storageService } from '@/services/storageService';
import { recordService } from '@/services/recordService';
import { RecordForm } from '@/components/forms/RecordForm';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { LoadingState, ErrorState } from '@/components/common/StateViews';
import { toRecordInput } from '@/utils/records';
import type { RecordFormValues } from '@/lib/validation';
import { paths } from '@/routes/paths';

export default function EditRecordPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notify } = useToast();
  const recordQuery = useRecord(id);
  const updateRecord = useUpdateRecord();
  const [submitting, setSubmitting] = useState(false);
  const [duplicate, setDuplicate] = useState<{ id: string; full_name: string } | null>(null);
  const [pendingValues, setPendingValues] = useState<RecordFormValues | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);

  if (recordQuery.isLoading) return <LoadingState />;
  if (recordQuery.isError || !recordQuery.data)
    return <ErrorState message="تعذر تحميل السجل" onRetry={() => recordQuery.refetch()} />;

  const record = recordQuery.data;

  async function saveRecord(values: RecordFormValues, photoFile: File | null) {
    if (!id) return;
    setSubmitting(true);
    try {
      const input = toRecordInput(values);

      if (photoFile) {
        const url = await storageService.uploadPhoto(photoFile, id);
        input.photo_url = url;
      } else {
        input.photo_url = record.photo_url;
      }

      await updateRecord.mutateAsync({ id, input });
      notify('تم تحديث السجل', 'success');
      navigate(paths.recordDetails(id), { replace: true });
    } catch (err) {
      notify(err instanceof Error ? err.message : 'تعذر تحديث السجل', 'error');
    } finally {
      setSubmitting(false);
      setPendingValues(null);
      setPendingPhoto(null);
      setDuplicate(null);
    }
  }

  async function handleSubmit(values: RecordFormValues, photoFile: File | null) {
    const reportNumber = values.report_number?.trim();
    if (reportNumber) {
      try {
        const existing = await recordService.findByReportNumber(reportNumber, id);
        if (existing) {
          setDuplicate(existing);
          setPendingValues(values);
          setPendingPhoto(photoFile);
          return;
        }
      } catch (err) {
        notify(err instanceof Error ? err.message : 'تعذر التحقق من رقم البلاغ', 'error');
        return;
      }
    }
    await saveRecord(values, photoFile);
  }

  const defaults: Partial<RecordFormValues> = {
    full_name: record.full_name,
    age: record.age,
    gender: record.gender,
    address: record.address,
    profession: record.profession,
    nickname: record.nickname,
    visible_marks: record.visible_marks,
    case_notes: record.case_notes,
    crime_type: record.crime_type,
    report_number: record.report_number,
    additional_notes: record.additional_notes,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-charcoal hover:bg-surface-card"
        >
          ‹ رجوع
        </button>
        <h1 className="text-xl font-bold text-charcoal">تعديل البيانات</h1>
      </div>

      <RecordForm
        defaultValues={defaults}
        currentPhotoUrl={record.photo_url}
        submitting={submitting}
        submitLabel="حفظ التعديلات"
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
      />

      <ConfirmDialog
        open={duplicate !== null}
        title="رقم بلاغ مكرر"
        message={
          duplicate
            ? `رقم البلاغ مستخدم بالفعل في سجل «${duplicate.full_name}». هل تريد المتابعة والحفظ على أي حال؟`
            : ''
        }
        confirmLabel="متابعة الحفظ"
        cancelLabel="إلغاء"
        loading={submitting}
        onConfirm={() => pendingValues && saveRecord(pendingValues, pendingPhoto)}
        onCancel={() => {
          setDuplicate(null);
          setPendingValues(null);
          setPendingPhoto(null);
        }}
      />
    </div>
  );
}
