import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';

// Middleware de validation avec Zod
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues || [];
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
        return;
      }
      next(error);
    }
  };
}

// Validation pour les parametres de requete
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues || [];
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
        return;
      }
      next(error);
    }
  };
}

// Schemas de validation
export const schemas = {
  // Utilisateur
  registerClient: z.object({
    nom: z.string().min(2, 'Le nom doit contenir au moins 2 caracteres'),
    prenom: z.string().min(2, 'Le prenom doit contenir au moins 2 caracteres'),
    email: z.string().email('Email invalide'),
    motDePasse: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caracteres'),
    telephone: z.string().min(8, 'Telephone invalide'),
    adresse: z.string().min(5, 'Adresse invalide')
  }),

  login: z.object({
    email: z.string().email('Email invalide'),
    motDePasse: z.string().min(1, 'Mot de passe requis')
  }),

  // Pharmacie
  createPharmacie: z.object({
    raisonSociale: z.string().min(2, 'Raison sociale invalide'),
    adresse: z.string().min(5, 'Adresse invalide'),
    numeroAgrement: z.string().min(3, 'Numero agrement invalide'),
    estDeGarde: z.boolean().optional(),
    horaires: z.string().optional(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }),

  // Medicament
  createMedicament: z.object({
    nom: z.string().min(2, 'Nom invalide'),
    DCI: z.string().min(2, 'DCI invalide'),
    categorie: z.string().min(2, 'Categorie invalide'),
    surOrdonnance: z.boolean(),
    stock: z.number().int().min(0, 'Stock doit etre positif'),
    prix: z.number().positive('Prix doit etre positif')
  }),

  // Commande
  createCommande: z.object({
    dateCommande: z.string().datetime(),
    montantTotal: z.number().positive(),
    adresseLivraison: z.string().min(5),
    clientId: z.number().int().positive(),
    pharmacieId: z.number().int().positive()
  }),

  // Livraison
  createLivraison: z.object({
    heureDepart: z.string().datetime(),
    heureArrivee: z.string().datetime().optional(),
    statut: z.enum(['en_cours', 'livre', 'probleme']),
    adresse: z.string().min(5),
    commandeId: z.number().int().positive(),
    livreurId: z.number().int().positive()
  }),

  // Paiement
  createPaiement: z.object({
    montant: z.number().positive(),
    modePaiement: z.enum(['especes', 'mobile_money', 'carte_bancaire']),
    dateTransaction: z.string().datetime(),
    commandeId: z.number().int().positive()
  }),

  // Calcul frais livraison
  calculFrais: z.object({
    pharmacieLat: z.number().min(-90).max(90),
    pharmacieLng: z.number().min(-180).max(180),
    clientLat: z.number().min(-90).max(90),
    clientLng: z.number().min(-180).max(180)
  }),

  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional()
  })
};