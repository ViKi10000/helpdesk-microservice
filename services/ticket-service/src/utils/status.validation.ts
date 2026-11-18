import { z } from "zod";

export const updateStatusSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved"]),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
