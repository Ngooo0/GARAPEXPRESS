import { z } from "zod";

export const utilisateurValidator = z.object({
    nom: z.string().min(2, 'Name must be at least 2 characters long'),
    prenom: z.string().min(2, 'Prenom must be at least 2 characters long'),
    telephone: z.string().min(8, 'Telephone must be at least 8 characters'),
    motDePasse: z.string(),
    email: z.email('Invalid email address'),
});

export const UtilisateurLogin = z.object({
    motDePasse: z.string(),
    email: z.email('Invalid email address'),
});  

// Validator for Client registration
export const ClientRegisterValidator = z.object({
    nom: z.string().min(2, 'Name must be at least 2 characters long'),
    prenom: z.string().min(2, 'Prenom must be at least 2 characters long'),
    telephone: z.string().min(8, 'Telephone must be at least 8 characters'),
    motDePasse: z.string().min(6, 'Password must be at least 6 characters'),
    email: z.email('Invalid email address'),
    adresse: z.string().min(5, 'Address must be at least 5 characters'),
});

// Validator for Livreur registration
export const LivreurRegisterValidator = z.object({
    nom: z.string().min(2, 'Name must be at least 2 characters long'),
    prenom: z.string().min(2, 'Prenom must be at least 2 characters long'),
    telephone: z.string().min(8, 'Telephone must be at least 8 characters'),
    motDePasse: z.string().min(6, 'Password must be at least 6 characters'),
    email: z.email('Invalid email address'),
    vehicule: z.string().min(2, 'Vehicle must be specified'),
    immatriculation: z.string().min(2, 'Immatriculation must be specified'),
});

// Validator for Admin registration
export const AdminRegisterValidator = z.object({
    nom: z.string().min(2, 'Name must be at least 2 characters long'),
    prenom: z.string().min(2, 'Prenom must be at least 2 characters long'),
    telephone: z.string().min(8, 'Telephone must be at least 8 characters'),
    motDePasse: z.string().min(6, 'Password must be at least 6 characters'),
    email: z.email('Invalid email address'),
});

// Validator for Pharmacie registration
export const PharmacieRegisterValidator = z.object({
    raisonSociale: z.string().min(2, 'Raison sociale must be at least 2 characters'),
    adresse: z.string().min(5, 'Adresse must be at least 5 characters'),
    numeroAgrement: z.string().min(2, 'Numéro agrement requis'),
    telephone: z.string().min(8, 'Telephone must be at least 8 characters'),
    email: z.email('Invalid email address'),
    motDePasse: z.string().min(6, 'Password must be at least 6 characters'),
    horaires: z.string().min(1, 'Horaires requis'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
});

// Validator for Pharmacie login
export const PharmacieLoginValidator = z.object({
    email: z.email('Invalid email address'),
    motDePasse: z.string().min(6, 'Password must be at least 6 characters'),
});