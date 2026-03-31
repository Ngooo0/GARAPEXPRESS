import { z } from "zod";

export const NotificationValidator = z.object({
    message: z.string().min(1),
    type: z.string().min(1),
    dateEnvoi: z.string().or(z.date()),
    lu: z.boolean().default(false),
    utilisateurId: z.number().int(),
});

export const NotificationUpdateValidator = z.object({
    message: z.string().min(1).optional(),
    type: z.string().min(1).optional(),
    lu: z.boolean().optional(),
});
