import { z } from "zod";

export const CommandeValidator = z.object({
    dateCommande: z.string().or(z.date()),
    statut: z.string().default('en_attente'),
    montantTotal: z.number().positive(),
    adresseLivraison: z.string().min(5),
    clientId: z.number().int(),
    pharmacieId: z.number().int(),
});

export const CommandeUpdateValidator = z.object({
    dateCommande: z.string().or(z.date()).optional(),
    statut: z.string().optional(),
    montantTotal: z.number().positive().optional(),
    adresseLivraison: z.string().min(5).optional(),
});
