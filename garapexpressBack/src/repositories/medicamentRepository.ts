import { PrismaClient, Medicament } from "@prisma/client";

export class MedicamentRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async findAll(): Promise<Medicament[]> {
        return this.prisma.medicament.findMany();
    }

    async findById(id: number): Promise<Medicament | null> {
        return this.prisma.medicament.findUnique({
            where: { id },
        });
    }

    async findByNom(nom: string): Promise<Medicament[]> {
        return this.prisma.medicament.findMany({
            where: { nom: { contains: nom } },
        });
    }

    async findByCategorie(categorie: string): Promise<Medicament[]> {
        return this.prisma.medicament.findMany({
            where: { categorie },
        });
    }

    async create(data: {
        nom: string;
        DCI: string;
        categorie: string;
        surOrdonnance: boolean;
        stock: number;
        prix: number;
    }): Promise<Medicament> {
        return this.prisma.medicament.create({
            data,
        });
    }

    async update(id: number, data: {
        nom?: string;
        DCI?: string;
        categorie?: string;
        surOrdonnance?: boolean;
        stock?: number;
        prix?: number;
    }): Promise<Medicament> {
        return this.prisma.medicament.update({
            where: { id },
            data,
        });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.medicament.delete({
            where: { id },
        });
    }
}
