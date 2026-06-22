import { z } from 'zod';

export const usernameSchema = z
  .string()
  .min(3, 'validation.usernameMin')
  .max(50, 'validation.usernameMax')
  .regex(/^[a-z0-9_.-]+$/, 'validation.usernamePattern');

export const emailSchema = z
  .string()
  .email('validation.emailInvalid');

export const passwordSchema = z
  .string()
  .min(12, 'validation.passwordMin')
  .max(128, 'validation.passwordMax')
  .regex(/[A-Z]/, 'validation.passwordUpper')
  .regex(/[a-z]/, 'validation.passwordLower')
  .regex(/[0-9]/, 'validation.passwordNumber')
  .regex(/[@$!%*?&]/, 'validation.passwordSpecial');

export const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, 'validation.required'),
});

export const registerSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'validation.required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'validation.passwordsMismatch',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const buyStockSchema = z.object({
  symbol: z.string().min(1, 'validation.required').toUpperCase(),
  quantity: z.number().int().positive('validation.quantityPositive'),
});

export const sellStockSchema = z.object({
  symbol: z.string().min(1, 'validation.required').toUpperCase(),
  quantity: z.number().int().positive('validation.quantityPositive'),
});

export const completeModuleSchema = z.object({
  moduleId: z.enum(['m1', 'm2', 'm3', 'm4', 'm5', 'm6']),
});

export const phoneSchema = z.string().regex(/^(\+57(3\d{9})|\+1\d{10})$/, 'validation.phoneInvalid');

export const editProfileSchema = z.object({
  username: z.string().min(3, 'validation.usernameMin').max(50, 'validation.usernameMax').optional().or(z.literal('')),
  email: z.string().email('validation.emailInvalid').optional().or(z.literal('')),
  current_password: z.string().optional().or(z.literal('')),
  new_password: z.string().optional().or(z.literal('')),
}).refine(
  (data) => {
    if (data.new_password && !data.current_password) return false;
    return true;
  },
  { message: 'validation.currentPasswordRequired', path: ['current_password'] },
).refine(
  (data) => {
    if (data.new_password) {
      const result = passwordSchema.safeParse(data.new_password);
      return result.success;
    }
    return true;
  },
  { message: 'validation.passwordInvalid', path: ['new_password'] },
);