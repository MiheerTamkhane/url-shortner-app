import {z} from "zod";

export const createUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(3, "Password must be at least 6 characters long"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;


export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3),
});

export type LoginUserInput = z.infer<typeof loginUserSchema>;