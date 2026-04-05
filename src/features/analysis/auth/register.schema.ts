import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email format")
    .max(255, "Email is too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password is too long"),
});

export type RegisterInput = z.infer<typeof registerSchema>;