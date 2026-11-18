import { z } from "zod";

export const assignTicketSchema = z.object({
  userId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid user ID"),
});

export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
