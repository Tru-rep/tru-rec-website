import { z } from 'zod';

/** Login form schema. */
export const loginSchema = z.object({
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('بريد إلكتروني غير صالح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  remember: z.boolean().optional(),
});
export type LoginValues = z.infer<typeof loginSchema>;

/** Forgot-password form schema. */
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('بريد إلكتروني غير صالح'),
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

/** Set new password after email recovery link. */
export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
    confirm: z.string().min(1, 'أكد كلمة المرور'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirm'],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

/** Record create/edit schema. Empty strings are coerced to null on submit. */
export const recordSchema = z.object({
  full_name: z.string().min(1, 'الاسم الكامل مطلوب').max(200),
  age: z
    .union([z.coerce.number().int().min(0).max(150), z.literal('')])
    .optional()
    .transform((v) => (v === '' || v === undefined ? null : v)),
  gender: z.enum(['male', 'female', 'other']).nullable().optional(),
  address: z.string().max(500).optional().nullable(),
  profession: z.string().max(200).optional().nullable(),
  nickname: z.string().max(200).optional().nullable(),
  visible_marks: z.string().max(1000).optional().nullable(),
  case_notes: z.string().max(5000).optional().nullable(),
  crime_type: z.string().max(200).optional().nullable(),
  report_number: z.string().max(100).optional().nullable(),
  additional_notes: z.string().max(5000).optional().nullable(),
  photo_url: z.string().url().optional().nullable(),
});
export type RecordFormValues = z.infer<typeof recordSchema>;

/** Admin "create user" schema. */
export const createUserSchema = z.object({
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('بريد إلكتروني غير صالح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  full_name: z.string().max(200).optional().nullable(),
  role: z.enum(['admin', 'staff']),
});
export type CreateUserValues = z.infer<typeof createUserSchema>;
