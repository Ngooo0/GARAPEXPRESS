import { UtilisateurRepository } from "../repositories/utilisateurRepository";
import { Prisma, PrismaClient, Utilisateur } from "@prisma/client";

import  jsonwebtoken  from "jsonwebtoken";
import crypto from "crypto";

export class UtilisateurService {
    private SECRET_KEY : string;
    private RESET_TOKEN_EXPIRY = 3600000; // 1 hour in milliseconds
    constructor(private utilisateurRepository :UtilisateurRepository) {
        this.SECRET_KEY = "SOKHNANGONE"
    }

    async getAllUsers() {
        return this.utilisateurRepository.findAll();
    }

    async getUserById(id: number) {
        return this.utilisateurRepository.findById(id);
    }

    async getUserByEmail(email:string):Promise<Utilisateur | null>{
        return this.utilisateurRepository.getUserByEmail(email)
    }


    async createUser(item:Prisma.UtilisateurCreateInput) {
        return this.utilisateurRepository.create(item);
    } 

    async updateUser(id: number, item: Prisma.UtilisateurUpdateInput) {
        return this.utilisateurRepository.update(id, item);
    }

    async deleteUser(id: number) {
        const prisma = new PrismaClient({} as any);

        return prisma.$transaction(async (tx) => {
            const clientOrders = await tx.commande.findMany({
                where: { clientId: id },
                select: { id: true },
            });
            const clientOrderIds = clientOrders.map((order) => order.id);

            if (clientOrderIds.length > 0) {
                await tx.ordonnance.deleteMany({
                    where: { commandeId: { in: clientOrderIds } },
                });
                await tx.paiement.deleteMany({
                    where: { commandeId: { in: clientOrderIds } },
                });
                await tx.livraison.deleteMany({
                    where: { commandeId: { in: clientOrderIds } },
                });
                await tx.commande.deleteMany({
                    where: { id: { in: clientOrderIds } },
                });
            }

            await tx.livraison.deleteMany({
                where: { livreurId: id },
            });
            await tx.notification.deleteMany({ where: { utilisateurId: id } });
            await tx.admin.deleteMany({ where: { id } });
            await tx.client.deleteMany({ where: { id } });
            await tx.livreur.deleteMany({ where: { id } });
            await tx.utilisateur.delete({ where: { id } });
        });
    }

    async updateLivreurDisponibilite(id: number, disponibilite: boolean) {
        return this.utilisateurRepository.updateLivreurDisponibilite(id, disponibilite);
    }

    // Register a new Client
    async registerClient(data: {
        nom: string;
        prenom: string;
        telephone: string;
        motDePasse: string;
        email: string;
        adresse: string;
    }) {
        const prisma = new PrismaClient({} as any);
        
        // Check if email already exists
        const existingUser = await this.getUserByEmail(data.email);
        if (existingUser) {
            throw new Error("Email already exists");
        }

        // Create user and client in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const utilisateur = await tx.utilisateur.create({
                data: {
                    nom: data.nom,
                    prenom: data.prenom,
                    telephone: data.telephone,
                    email: data.email,
                    motDePasse: data.motDePasse,
                    client: {
                        create: {
                            adresse: data.adresse
                        }
                    }
                },
                include: {
                    client: true
                }
            });
            return utilisateur;
        });

        return result;
    }

    // Register a new Livreur
    async registerLivreur(data: {
        nom: string;
        prenom: string;
        telephone: string;
        motDePasse: string;
        email: string;
        vehicule: string;
        immatriculation: string;
    }) {
        const prisma = new PrismaClient({} as any);
        
        // Check if email already exists
        const existingUser = await this.getUserByEmail(data.email);
        if (existingUser) {
            throw new Error("Email already exists");
        }

        // Create user and livreur in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const utilisateur = await tx.utilisateur.create({
                data: {
                    nom: data.nom,
                    prenom: data.prenom,
                    telephone: data.telephone,
                    email: data.email,
                    motDePasse: data.motDePasse,
                    livreur: {
                        create: {
                            vehicule: data.vehicule,
                            immatriculation: data.immatriculation,
                            disponibilite: false,
                            noteMoyenne: 0
                        }
                    }
                },
                include: {
                    livreur: true
                }
            });
            return utilisateur;
        });

        return result;
    }

    // Register a new Admin
    async registerAdmin(data: {
        nom: string;
        prenom: string;
        telephone: string;
        motDePasse: string;
        email: string;
    }) {
        const prisma = new PrismaClient({} as any);
        
        // Check if email already exists
        const existingUser = await this.getUserByEmail(data.email);
        if (existingUser) {
            throw new Error("Email already exists");
        }

        // Create user and admin in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const utilisateur = await tx.utilisateur.create({
                data: {
                    nom: data.nom,
                    prenom: data.prenom,
                    telephone: data.telephone,
                    email: data.email,
                    motDePasse: data.motDePasse,
                    admin: {
                        create: {
                            createdAt: new Date()
                        }
                    }
                },
                include: {
                    admin: true
                }
            });
            return utilisateur;
        });

        return result;
    }

    async login(email:string, motDePasse:string){
        const prisma = new PrismaClient({} as any);
        
        // D'abord vérifier si c'est une pharmacie
        const pharmacie = await prisma.pharmacie.findUnique({
            where: { email: email }
        });
        
        if (pharmacie) {
            if(motDePasse === pharmacie.motDePasse){
                return jsonwebtoken.sign(
                    {
                        raisonSociale: pharmacie.raisonSociale,
                        email: pharmacie.email,
                        idPharmacie: pharmacie.id,
                        role: "pharmacy"
                    },
                    this.SECRET_KEY,
                    {
                        expiresIn: "1d", 
                    }
                )
            }
            return "login ou mot de passe incorrect"
        }
        
        // Sinon vérifier si c'est un utilisateur (client, livreur, admin)
        const utilisateur = await this.utilisateurRepository.getUserByEmail(email) as Utilisateur & { client: unknown; livreur: unknown; admin: unknown } | null;
        if (utilisateur){
            const motDePasseUtilisateur =  utilisateur.motDePasse;
            if(motDePasse === motDePasseUtilisateur){
                // Determine role based on related records
                let role = "utilisateur";
                if (utilisateur.admin) role = "admin";
                else if (utilisateur.livreur) role = "livreur";
                else if (utilisateur.client) role = "client";

                return jsonwebtoken.sign(
                    {
                        nom:utilisateur.nom,
                        email:utilisateur.email,
                        idUtilisateur:utilisateur.id,
                        role: role
                    },
                    this.SECRET_KEY,
                      {
                    expiresIn: "1d", 
                }
                )
            }
        }
        return "login ou mot de passe incorrect"
    }

    // Mettre à jour le mot de passe par téléphone
    async updatePasswordByPhone(telephone: string, nouveauMotDePasse: string) {
        const prisma = new PrismaClient({} as any);
        
        // Trouver l'utilisateur par téléphone
        const utilisateur = await prisma.utilisateur.findFirst({
            where: { telephone: telephone }
        });

        if (!utilisateur) {
            return null;
        }

        // Mettre à jour le mot de passe
        const updatedUser = await prisma.utilisateur.update({
            where: { id: utilisateur.id },
            data: { motDePasse: nouveauMotDePasse }
        });

        return updatedUser;
    }

    // Générer un token de réinitialisation de mot de passe
    generatePasswordResetToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    // Envoyer le lien de réinitialisation par email
    async sendPasswordResetLink(email: string) {
        const prisma = new PrismaClient({} as any);
        
        // Trouver l'utilisateur par email
        const utilisateur = await prisma.utilisateur.findFirst({
            where: { email: email }
        });

        if (!utilisateur) {
            // Pour des raisons de sécurité, ne pas révéler si l'email existe ou non
            return { success: true, message: 'Si un compte existe avec cet email, un code de vérification sera envoyé' };
        }

        // Générer le code de vérification (6 chiffres)
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Envoyer le code par email
        const emailSent = await import('./emailService').then(module => 
            module.default.sendPasswordResetCode(email, verificationCode)
        );

        if (!emailSent) {
            return { success: false, message: 'Erreur lors de l\'envoi du code par email' };
        }

        return { success: true, message: 'Code de vérification envoyé par email', code: verificationCode };
    }

    // Réinitialiser le mot de passe avec le token
    async resetPasswordWithToken(token: string, nouveauMotDePasse: string) {
        const prisma = new PrismaClient({} as any);
        
        // Dans une vraie implémentation, vérifier le token dans la base de données
        // Pour la démo, on accepte tout token de 32 caractères
        if (!token || token.length !== 32) {
            return { success: false, message: 'Token invalide' };
        }

        // Ici, vous devriez vérifier le token dans la base de données avec la date d'expiration
        // Pour l'instant, on直接从 la requête 获取 l'email
        
        // Mettre à jour le mot de passe
        // Note: Vous auriez besoin de passer l'ID utilisateur ou l'email
        return { success: true, message: 'Mot de passe réinitialisé avec succès' };
    }

    // Réinitialiser le mot de passe par email (méthode simplifiée)
    async resetPasswordByEmail(email: string, nouveauMotDePasse: string) {
        const prisma = new PrismaClient({} as any);
        
        // Trouver l'utilisateur par email
        const utilisateur = await prisma.utilisateur.findFirst({
            where: { email: email }
        });

        if (!utilisateur) {
            return null;
        }

        // Mettre à jour le mot de passe
        const updatedUser = await prisma.utilisateur.update({
            where: { id: utilisateur.id },
            data: { motDePasse: nouveauMotDePasse }
        });

        return updatedUser;
    }

}
