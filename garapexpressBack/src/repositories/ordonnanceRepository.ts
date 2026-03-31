import { PrismaClient, Ordonnance } from "@prisma/client";

export class OrdonnanceRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async findAll(): Promise<Ordonnance[]> {
        return this.prisma.ordonnance.findMany({ include: { commande: true } });
    }

    async findById(id: number): Promise<Ordonnance | null> {
        return this.prisma.ordonnance.findUnique({ where: { id }, include: { commande: true } });
    }

    async findByCommandeId(commandeId: number): Promise<Ordonnance | null> {
        return this.prisma.ordonnance.findUnique({ where: { commandeId } });
    }

    async create(data: { dateEmission: Date | string; fichier: string; statut: string; commandeId: number }): Promise<Ordonnance> {
        return this.prisma.ordonnance.create({
            data: { ...data, dateEmission: new Date(data.dateEmission) },
        });
    }

    async update(id: number, data: { dateEmission?: Date | string; fichier?: string; statut?: string }): Promise<Ordonnance> {
        return this.prisma.ordonnance.update({
            where: { id },
            data: data.dateEmission ? { ...data, dateEmission: new Date(data.dateEmission) } : data,
        });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.ordonnance.delete({ where: { id } });
    }
}
