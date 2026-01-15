import {z } from "zod";

export const formatZodError = (error: z.ZodError) => {
  return z.treeifyError(error);
};