import { z } from "zod";

export const PharmacieValidator = z.object({
    raisonSociale: z.string().min(2, 'Raison sociale must be at least 2 characters'),
    adresse: z.string().min(5, 'Adresse must be at least 5 characters'),
    numeroAgrement: z.string().min(2, 'Numero agrement is required'),
    estDeGarde: z.boolean().default(false),
    horaires: z.string().min(5, 'Horaires is required'),
    latitude: z.number(),
    longitude: z.number(),
});

export const PharmacieUpdateValidator = z.object({
    raisonSociale: z.string().min(2).optional(),
    adresse: z.string().min(5).optional(),
    numeroAgrement: z.string().min(2).optional(),
    estDeGarde: z.boolean().optional(),
    horaires: z.string().min(5).optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
});
