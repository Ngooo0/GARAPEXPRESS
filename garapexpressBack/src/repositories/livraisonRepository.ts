import { PrismaClient, Livraison } from "@prisma/client";

export class LivraisonRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async findAll(): Promise<Livraison[]> {
        return this.prisma.livraison.findMany({
            include: {
                commande: true,
                livreur: {
                    include: {
                        utilisateur: true,
                    },
                },
            },
        });
    }

    async findById(id: number): Promise<Livraison | null> {
        return this.prisma.livraison.findUnique({
            where: { id },
            include: {
                commande: true,
                livreur: {
                    include: {
                        utilisateur: true,
                    },
                },
            },
        });
    }

    async findByCommandeId(commandeId: number): Promise<Livraison | null> {
        return this.prisma.livraison.findUnique({
            where: { commandeId },
            include: {
                livreur: {
                    include: {
                        utilisateur: true,
                    },
                },
            },
        });
    }

    async findByLivreurId(livreurId: number): Promise<Livraison[]> {
        return this.prisma.livraison.findMany({
            where: { livreurId },
            include: {
                commande: true,
                livreur: {
                    include: {
                        utilisateur: true,
                    },
                },
            },
        });
    }

    async create(data: {
        heureDepart: Date | string;
        heureArrivee?: Date | string;
        statut: string;
        adresse: string;
        commandeId: number;
        livreurId: number;
    }): Promise<Livraison> {
        return this.prisma.livraison.create({
            data: {
                heureDepart: new Date(data.heureDepart),
                heureArrivee: data.heureArrivee ? new Date(data.heureArrivee) : new Date(),
                statut: data.statut,
                adresse: data.adresse,
                commandeId: data.commandeId,
                livreurId: data.livreurId,
            },
        });
    }

    async update(id: number, data: {
        heureDepart?: Date | string;
        heureArrivee?: Date | string;
        statut?: string;
        adresse?: string;
    }): Promise<Livraison> {
        return this.prisma.livraison.update({
            where: { id },
            data: {
                ...data,
                heureDepart: data.heureDepart ? new Date(data.heureDepart) : undefined,
                heureArrivee: data.heureArrivee ? new Date(data.heureArrivee) : undefined,
            },
        });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.livraison.delete({ where: { id } });
    }
}
