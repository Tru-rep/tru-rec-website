import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useCreateRecord, useUpdateRecord } from '@/hooks/useRecords';
import { storageService } from '@/services/storageService';
import { recordService } from '@/services/recordService';
import { RecordForm } from '@/components/forms/RecordForm';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
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
  const [duplicate, setDuplicate] = useState<{ id: string; full_name: string } | null>(null);
  const [pendingValues, setPendingValues] = useState<{
    values: RecordFormValues;
    photoFile: File | null;
  } | null>(null);

  async function saveRecord(values: RecordFormValues, photoFile: File | null) {
    if (!session?.user) {
      notify('انتهت الجلسة، يرجى تسجيل الدخول', 'error');
      return;
    }
    setSubmitting(true);
    try {
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
      setPendingValues(null);
      setDuplicate(null);
    }
  }

  async function handleSubmit(values: RecordFormValues, photoFile: File | null) {
    const reportNumber = values.report_number?.trim();
    if (reportNumber) {
      try {
        const existing = await recordService.findByReportNumber(reportNumber);
        if (existing) {
          setDuplicate(existing);
          setPendingValues({ values, photoFile });
          return;
        }
      } catch (err) {
        notify(err instanceof Error ? err.message : 'تعذر التحقق من رقم البلاغ', 'error');
        return;
      }
    }
    await saveRecord(values, photoFile);
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
        onConfirm={() => pendingValues && saveRecord(pendingValues.values, pendingValues.photoFile)}
        onCancel={() => {
          setDuplicate(null);
          setPendingValues(null);
        }}
      />
    </div>
  );
}
