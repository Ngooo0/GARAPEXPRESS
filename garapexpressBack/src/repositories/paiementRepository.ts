import { PrismaClient, Paiement } from "@prisma/client";

export class PaiementRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async findAll(): Promise<Paiement[]> {
        return this.prisma.paiement.findMany({ include: { commande: true } });
    }

    async findById(id: number): Promise<Paiement | null> {
        return this.prisma.paiement.findUnique({ where: { id }, include: { commande: true } });
    }

    async findByCommandeId(commandeId: number): Promise<Paiement | null> {
        return this.prisma.paiement.findUnique({ where: { commandeId } });
    }

    async create(data: { montant: number; modePaiement: string; statut: string; dateTransaction: Date | string; commandeId: number }): Promise<Paiement> {
        return this.prisma.paiement.create({
            data: { ...data, dateTransaction: new Date(data.dateTransaction) },
        });
    }

    async update(id: number, data: { montant?: number; modePaiement?: string; statut?: string }): Promise<Paiement> {
        return this.prisma.paiement.update({ where: { id }, data });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.paiement.delete({ where: { id } });
    }
}
