import type { RecordFormValues } from '@/lib/validation';
import type { RecordInput } from '@/types';

/** Convert empty strings to null so the DB stores clean nullable values. */
function emptyToNull(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

/** Map validated form values into the shape the records service expects. */
export function toRecordInput(values: RecordFormValues): RecordInput {
  return {
    full_name: values.full_name.trim(),
    age: values.age ?? null,
    gender: values.gender ?? null,
    address: emptyToNull(values.address),
    profession: emptyToNull(values.profession),
    nickname: emptyToNull(values.nickname),
    visible_marks: emptyToNull(values.visible_marks),
    case_notes: emptyToNull(values.case_notes),
    crime_type: emptyToNull(values.crime_type),
    report_number: emptyToNull(values.report_number),
    additional_notes: emptyToNull(values.additional_notes),
    photo_url: emptyToNull(values.photo_url),
  };
}
