import { z } from "zod";

export const addCommentSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment cannot exceed 2000 characters"),
});

export type AddCommentInput = z.infer<typeof addCommentSchema>;
