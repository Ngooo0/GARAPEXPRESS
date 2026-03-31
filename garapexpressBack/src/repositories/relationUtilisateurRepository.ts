import { PrismaClient, Prisma, RelationUtilisateur } from "@prisma/client";

// Type pour les relations avec les utilisateurs inclus
export type RelationUtilisateurAvecUtilisateurs = RelationUtilisateur & {
    demandeur: { id: number; nom: string; prenom: string; email: string; telephone: string };
    receveur: { id: number; nom: string; prenom: string; email: string; telephone: string };
};

export type RelationUtilisateurAvecDemandeur = RelationUtilisateur & {
    demandeur: { id: number; nom: string; prenom: string; email: string; telephone: string };
};

export class RelationUtilisateurRepository {
    constructor(private prisma: PrismaClient) { }

    // Créer une nouvelle relation
    async create(data: Prisma.RelationUtilisateurCreateInput): Promise<RelationUtilisateur> {
        return this.prisma.relationUtilisateur.create({ data });
    }

    // Obtenir toutes les relations d'un utilisateur (demandeur et receveur)
    async getRelationsByUserId(userId: number): Promise<RelationUtilisateurAvecUtilisateurs[]> {
        return this.prisma.relationUtilisateur.findMany({
            where: {
                OR: [
                    { demandeurId: userId },
                    { receveurId: userId }
                ]
            },
            include: {
                demandeur: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        email: true,
                        telephone: true
                    }
                },
                receveur: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        email: true,
                        telephone: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    // Obtenir les amis acceptés d'un utilisateur
    async getAmisAcceptes(userId: number): Promise<RelationUtilisateurAvecUtilisateurs[]> {
        return this.prisma.relationUtilisateur.findMany({
            where: {
                statut: 'accepte',
                OR: [
                    { demandeurId: userId },
                    { receveurId: userId }
                ]
            },
            include: {
                demandeur: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        email: true,
                        telephone: true
                    }
                },
                receveur: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        email: true,
                        telephone: true
                    }
                }
            }
        });
    }

    // Obtenir les demandes d'ami en attente reçues
    async getDemandesEnAttente(userId: number): Promise<RelationUtilisateurAvecDemandeur[]> {
        return this.prisma.relationUtilisateur.findMany({
            where: {
                statut: 'en_attente',
                receveurId: userId
            },
            include: {
                demandeur: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        email: true,
                        telephone: true
                    }
                }
            }
        });
    }

    // Obtenir une relation spécifique entre deux utilisateurs
    async getRelationBetweenUsers(demandeurId: number, receveurId: number): Promise<RelationUtilisateur | null> {
        return this.prisma.relationUtilisateur.findFirst({
            where: {
                OR: [
                    { demandeurId, receveurId },
                    { demandeurId: receveurId, receveurId: demandeurId }
                ]
            }
        });
    }

    // Accepter une demande d'ami
    async accepterRelation(id: number): Promise<RelationUtilisateur> {
        return this.prisma.relationUtilisateur.update({
            where: { id },
            data: { statut: 'accepte' }
        });
    }

    // Refuser une demande d'ami
    async refuserRelation(id: number): Promise<RelationUtilisateur> {
        return this.prisma.relationUtilisateur.update({
            where: { id },
            data: { statut: 'refuse' }
        });
    }

    // Supprimer une relation
    async delete(id: number): Promise<void> {
        await this.prisma.relationUtilisateur.delete({
            where: { id }
        });
    }

    // Supprimer une relation entre deux utilisateurs
    async deleteRelationBetweenUsers(userId1: number, userId2: number): Promise<void> {
        await this.prisma.relationUtilisateur.deleteMany({
            where: {
                OR: [
                    { demandeurId: userId1, receveurId: userId2 },
                    { demandeurId: userId2, receveurId: userId1 }
                ]
            }
        });
    }
}