import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import { useRecord, useUpdateRecord } from '@/hooks/useRecords';
import { storageService } from '@/services/storageService';
import { RecordForm } from '@/components/forms/RecordForm';
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

  if (recordQuery.isLoading) return <LoadingState />;
  if (recordQuery.isError || !recordQuery.data)
    return <ErrorState message="تعذر تحميل السجل" onRetry={() => recordQuery.refetch()} />;

  const record = recordQuery.data;

  async function handleSubmit(values: RecordFormValues, photoFile: File | null) {
    if (!id) return;
    setSubmitting(true);
    try {
      const input = toRecordInput(values);

      if (photoFile) {
        const url = await storageService.uploadPhoto(photoFile, id);
        input.photo_url = url;
      } else {
        // Keep the existing photo if no new file was chosen.
        input.photo_url = record.photo_url;
      }

      await updateRecord.mutateAsync({ id, input });
      notify('تم تحديث السجل', 'success');
      navigate(paths.recordDetails(id), { replace: true });
    } catch (err) {
      notify(err instanceof Error ? err.message : 'تعذر تحديث السجل', 'error');
    } finally {
      setSubmitting(false);
    }
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
    </div>
  );
}
