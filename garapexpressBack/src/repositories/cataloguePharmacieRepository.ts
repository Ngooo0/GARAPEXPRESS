import { PrismaClient, CataloguePharmacie } from "@prisma/client";

export class CataloguePharmacieRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async findAll(): Promise<CataloguePharmacie[]> {
        return this.prisma.cataloguePharmacie.findMany({ include: { pharmacie: true, medicament: true } });
    }

    async findById(id: number): Promise<CataloguePharmacie | null> {
        return this.prisma.cataloguePharmacie.findUnique({ where: { id }, include: { pharmacie: true, medicament: true } });
    }

    async findByPharmacieId(pharmacieId: number): Promise<CataloguePharmacie[]> {
        return this.prisma.cataloguePharmacie.findMany({
            where: { pharmacieId },
            include: { medicament: true }
        });
    }

    async findByMedicamentId(medicamentId: number): Promise<CataloguePharmacie[]> {
        return this.prisma.cataloguePharmacie.findMany({
            where: { medicamentId },
            include: { pharmacie: true }
        });
    }

    async findDisponibles(pharmacieId: number): Promise<CataloguePharmacie[]> {
        return this.prisma.cataloguePharmacie.findMany({
            where: { pharmacieId, disponibilite: true },
            include: { medicament: true }
        });
    }

    async create(data: { prix: number; quantiteStock: number; disponibilite: boolean; dateMAJ: Date | string; pharmacieId: number; medicamentId: number }): Promise<CataloguePharmacie> {
        return this.prisma.cataloguePharmacie.create({
            data: { ...data, dateMAJ: new Date(data.dateMAJ) },
        });
    }

    async update(id: number, data: { prix?: number; quantiteStock?: number; disponibilite?: boolean }): Promise<CataloguePharmacie> {
        return this.prisma.cataloguePharmacie.update({ where: { id }, data });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.cataloguePharmacie.delete({ where: { id } });
    }
}
