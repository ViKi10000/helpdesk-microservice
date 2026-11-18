import { z } from "zod";

export const createTicketSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title cannot exceed 120 characters"),

  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(5000, "Description cannot exceed 5000 characters"),

  priority: z
    .enum(["low", "medium", "high"])
    .optional()
    .default("medium"),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
