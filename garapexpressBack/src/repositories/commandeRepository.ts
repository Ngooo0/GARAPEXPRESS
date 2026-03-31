import { PrismaClient, Commande } from "@prisma/client";

export class CommandeRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async findAll(): Promise<Commande[]> {
        return this.prisma.commande.findMany({
            include: {
                client: true,
                pharmacie: true,
                ordonnance: true,
                livraison: {
                    include: {
                        livreur: {
                            include: {
                                utilisateur: true,
                            },
                        },
                    },
                },
                paiement: true,
            },
        });
    }

    async findById(id: number): Promise<Commande | null> {
        return this.prisma.commande.findUnique({
            where: { id },
            include: {
                client: true,
                pharmacie: true,
                ordonnance: true,
                livraison: {
                    include: {
                        livreur: {
                            include: {
                                utilisateur: true,
                            },
                        },
                    },
                },
                paiement: true,
            },
        });
    }

    async findByClientId(clientId: number): Promise<Commande[]> {
        return this.prisma.commande.findMany({
            where: { clientId },
            include: {
                pharmacie: true,
                ordonnance: true,
                livraison: {
                    include: {
                        livreur: {
                            include: {
                                utilisateur: true,
                            },
                        },
                    },
                },
                paiement: true,
            },
        });
    }

    async findByPharmacieId(pharmacieId: number): Promise<Commande[]> {
        return this.prisma.commande.findMany({
            where: { pharmacieId },
            include: {
                client: true,
                ordonnance: true,
                livraison: {
                    include: {
                        livreur: {
                            include: {
                                utilisateur: true,
                            },
                        },
                    },
                },
                paiement: true,
            },
        });
    }

    async findByStatut(statut: string): Promise<Commande[]> {
        return this.prisma.commande.findMany({
            where: { statut },
            include: {
                client: true,
                pharmacie: true,
            },
        });
    }

    async create(data: {
        dateCommande: Date | string;
        statut: string;
        montantTotal: number;
        adresseLivraison: string;
        clientId: number;
        pharmacieId: number;
    }): Promise<Commande> {
        return this.prisma.commande.create({
            data: {
                ...data,
                dateCommande: new Date(data.dateCommande),
            },
        });
    }

    async update(id: number, data: {
        dateCommande?: Date | string;
        statut?: string;
        montantTotal?: number;
        adresseLivraison?: string;
    }): Promise<Commande> {
        return this.prisma.commande.update({
            where: { id },
            data: data.dateCommande ? { ...data, dateCommande: new Date(data.dateCommande) } : data,
        });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.commande.delete({
            where: { id },
        });
    }
}
