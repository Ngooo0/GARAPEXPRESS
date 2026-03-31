import { z } from "zod";

export const PaiementValidator = z.object({
    montant: z.number().positive(),
    modePaiement: z.string().min(2),
    statut: z.string().default('en_attente'),
    dateTransaction: z.string().or(z.date()),
    commandeId: z.number().int(),
});

export const PaiementUpdateValidator = z.object({
    montant: z.number().positive().optional(),
    modePaiement: z.string().min(2).optional(),
    statut: z.string().optional(),
});
