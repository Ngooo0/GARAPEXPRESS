import { z } from "zod";

export const CataloguePharmacieValidator = z.object({
    prix: z.number().positive(),
    quantiteStock: z.number().int().min(0),
    disponibilite: z.boolean().default(true),
    dateMAJ: z.string().or(z.date()),
    pharmacieId: z.number().int(),
    medicamentId: z.number().int(),
});

export const CataloguePharmacieUpdateValidator = z.object({
    prix: z.number().positive().optional(),
    quantiteStock: z.number().int().min(0).optional(),
    disponibilite: z.boolean().optional(),
});
