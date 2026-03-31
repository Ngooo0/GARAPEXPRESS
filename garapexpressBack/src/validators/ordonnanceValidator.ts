import { z } from "zod";

export const OrdonnanceValidator = z.object({
    dateEmission: z.string().or(z.date()),
    fichier: z.string().min(1),
    statut: z.string().default('en_attente'),
    commandeId: z.number().int(),
});

export const OrdonnanceUpdateValidator = z.object({
    dateEmission: z.string().or(z.date()).optional(),
    fichier: z.string().min(1).optional(),
    statut: z.string().optional(),
});
