import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(12, 'La contraseña debe tener al menos 12 caracteres')
  .max(100, 'La contraseña es demasiado larga')
  .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
  .regex(/[a-z]/, 'Debe incluir al menos una minúscula')
  .regex(/[0-9]/, 'Debe incluir al menos un número')
  .regex(/[^A-Za-z0-9]/, 'Debe incluir al menos un símbolo');

export const usernameSchema = z
  .string()
  .min(3, 'Mínimo 3 caracteres')
  .max(50, 'Máximo 50 caracteres')
  .regex(/^[a-z0-9_.-]+$/, 'Solo letras minúsculas, números, _, . y -')
  .transform((v) => v.toLowerCase());

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Email inválido');

export const registerSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  username: z.string().min(1, 'Requerido').max(50),
  password: z.string().min(1, 'Requerido').max(100),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
