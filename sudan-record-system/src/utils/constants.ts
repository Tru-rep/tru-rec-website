import type { Gender, UserRole } from '@/types';

export const APP_NAME = 'المرصد';
export const APP_TAGLINE = 'نظام إدارة السجلات الآمن';

export const PAGE_SIZE = 12;

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'ذكر' },
  { value: 'female', label: 'أنثى' },
  { value: 'other', label: 'آخر' },
];

export const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'مدير' },
  { value: 'staff', label: 'موظف' },
];

export const GENDER_LABELS: Record<Gender, string> = {
  male: 'ذكر',
  female: 'أنثى',
  other: 'آخر',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'مدير',
  staff: 'موظف',
};
