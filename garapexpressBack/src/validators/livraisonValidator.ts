import { z } from "zod";

export const LivraisonValidator = z.object({
    heureDepart: z.string().or(z.date()),
    heureArrivee: z.string().or(z.date()).optional(),
    statut: z.string().default('en_cours'),
    adresse: z.string().min(5),
    commandeId: z.number().int(),
    livreurId: z.number().int(),
});

export const LivraisonUpdateValidator = z.object({
    heureDepart: z.string().or(z.date()).optional(),
    heureArrivee: z.string().or(z.date()).optional(),
    statut: z.string().optional(),
    adresse: z.string().min(5).optional(),
});
