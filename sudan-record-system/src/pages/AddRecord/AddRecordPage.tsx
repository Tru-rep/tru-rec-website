import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useCreateRecord, useUpdateRecord } from '@/hooks/useRecords';
import { storageService } from '@/services/storageService';
import { RecordForm } from '@/components/forms/RecordForm';
import { toRecordInput } from '@/utils/records';
import type { RecordFormValues } from '@/lib/validation';
import { paths } from '@/routes/paths';

export default function AddRecordPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { notify } = useToast();
  const createRecord = useCreateRecord();
  const updateRecord = useUpdateRecord();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: RecordFormValues, photoFile: File | null) {
    if (!session?.user) {
      notify('انتهت الجلسة، يرجى تسجيل الدخول', 'error');
      return;
    }
    setSubmitting(true);
    try {
      // Create first so we have an id to namespace the photo path.
      const created = await createRecord.mutateAsync({
        input: toRecordInput(values),
        createdBy: session.user.id,
      });

      if (photoFile) {
        const url = await storageService.uploadPhoto(photoFile, created.id);
        await updateRecord.mutateAsync({ id: created.id, input: { photo_url: url } });
      }

      notify('تم حفظ السجل بنجاح', 'success');
      navigate(paths.recordDetails(created.id), { replace: true });
    } catch (err) {
      notify(err instanceof Error ? err.message : 'تعذر حفظ السجل', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-charcoal hover:bg-surface-card"
        >
          ‹ رجوع
        </button>
        <h1 className="text-xl font-bold text-charcoal">إضافة شخص جديد</h1>
      </div>

      <RecordForm
        submitting={submitting}
        submitLabel="حفظ السجل"
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
}
