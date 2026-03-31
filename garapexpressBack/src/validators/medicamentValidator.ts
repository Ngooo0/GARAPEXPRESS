import { z } from "zod";

export const MedicamentValidator = z.object({
    nom: z.string().min(2, 'Nom must be at least 2 characters'),
    DCI: z.string().min(2, 'DCI is required'),
    categorie: z.string().min(2, 'Categorie is required'),
    surOrdonnance: z.boolean().default(false),
    stock: z.number().int().min(0),
    prix: z.number().positive(),
});

export const MedicamentUpdateValidator = z.object({
    nom: z.string().min(2).optional(),
    DCI: z.string().min(2).optional(),
    categorie: z.string().min(2).optional(),
    surOrdonnance: z.boolean().optional(),
    stock: z.number().int().min(0).optional(),
    prix: z.number().positive().optional(),
});
