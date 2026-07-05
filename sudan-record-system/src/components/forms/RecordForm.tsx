import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { recordSchema, type RecordFormValues } from '@/lib/validation';
import { Field, Input, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PhotoUpload } from './PhotoUpload';
import { GENDER_OPTIONS } from '@/utils/constants';

interface RecordFormProps {
  defaultValues?: Partial<RecordFormValues>;
  currentPhotoUrl?: string | null;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: RecordFormValues, photoFile: File | null) => void;
  onCancel?: () => void;
}

/**
 * Reusable create/edit form. Purely presentational + validation; it does not
 * talk to services. The parent page handles photo upload + persistence so this
 * component stays free of business logic.
 */
export function RecordForm({
  defaultValues,
  currentPhotoUrl,
  submitting = false,
  submitLabel = 'حفظ',
  onSubmit,
  onCancel,
}: RecordFormProps) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RecordFormValues>({
    resolver: zodResolver(recordSchema),
    defaultValues: { gender: null, ...defaultValues },
  });

  const fullName = watch('full_name') || '';

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values, photoFile))}
      className="space-y-6"
    >
      <div className="card-base p-5">
        <PhotoUpload
          currentUrl={currentPhotoUrl}
          name={fullName}
          onFileSelected={setPhotoFile}
        />
      </div>

      <div className="card-base grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="الاسم الكامل *" htmlFor="full_name" error={errors.full_name?.message}>
            <Input id="full_name" {...register('full_name')} />
          </Field>
        </div>

        <Field label="اللقب / الكنية" htmlFor="nickname" error={errors.nickname?.message}>
          <Input id="nickname" {...register('nickname')} />
        </Field>

        <Field label="العمر" htmlFor="age" error={errors.age?.message as string | undefined}>
          <Input id="age" type="number" min={0} max={150} {...register('age')} />
        </Field>

        <Field label="الجنس" htmlFor="gender" error={errors.gender?.message}>
          <Select id="gender" {...register('gender')}>
            <option value="">— اختر —</option>
            {GENDER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="المهنة" htmlFor="profession" error={errors.profession?.message}>
          <Input id="profession" {...register('profession')} />
        </Field>

        <div className="sm:col-span-2">
          <Field label="العنوان" htmlFor="address" error={errors.address?.message}>
            <Input id="address" {...register('address')} />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="العلامات المميزة" htmlFor="visible_marks" error={errors.visible_marks?.message}>
            <Textarea id="visible_marks" {...register('visible_marks')} />
          </Field>
        </div>

        <Field label="رقم البلاغ" htmlFor="report_number" error={errors.report_number?.message}>
          <Input id="report_number" dir="ltr" placeholder="مثال: 2024-00123" {...register('report_number')} />
        </Field>

        <Field label="نوع القضية" htmlFor="crime_type" error={errors.crime_type?.message}>
          <Input id="crime_type" {...register('crime_type')} />
        </Field>

        <div className="sm:col-span-2">
          <Field label="ملاحظات القضية" htmlFor="case_notes" error={errors.case_notes?.message}>
            <Textarea id="case_notes" rows={4} {...register('case_notes')} />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field
            label="ملاحظات إضافية"
            htmlFor="additional_notes"
            error={errors.additional_notes?.message}
          >
            <Textarea id="additional_notes" {...register('additional_notes')} />
          </Field>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
            إلغاء
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
