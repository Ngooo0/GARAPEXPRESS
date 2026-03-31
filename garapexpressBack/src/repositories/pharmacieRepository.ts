import { PrismaClient, Pharmacie } from "@prisma/client";

const pharmacieListSelect = {
    id: true,
    raisonSociale: true,
    adresse: true,
    numeroAgrement: true,
    estDeGarde: true,
    horaires: true,
    latitude: true,
    longitude: true,
} as const;

const pharmacieIdentitySelect = {
    id: true,
    raisonSociale: true,
    numeroAgrement: true,
} as const;

const pharmacieAuthSelect = {
    id: true,
    raisonSociale: true,
    numeroAgrement: true,
    email: true,
    motDePasse: true,
    telephone: true,
} as const;

export class PharmacieRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async findAll(): Promise<any[]> {
        return this.prisma.pharmacie.findMany({
            select: pharmacieListSelect,
        });
    }

    async findById(id: number): Promise<any | null> {
        return this.prisma.pharmacie.findUnique({
            where: { id },
            select: pharmacieListSelect,
        });
    }

    async findByRaisonSociale(raisonSociale: string): Promise<Pharmacie | null> {
        return this.prisma.pharmacie.findFirst({
            where: { raisonSociale },
            select: pharmacieIdentitySelect,
        }) as Promise<Pharmacie | null>;
    }

    async findPharmaciesDeGarde(): Promise<any[]> {
        return this.prisma.pharmacie.findMany({
            where: { estDeGarde: true },
            select: pharmacieListSelect,
        });
    }

    async create(data: {
        raisonSociale: string;
        adresse: string;
        numeroAgrement: string;
        estDeGarde: boolean;
        horaires: string;
        latitude: number;
        longitude: number;
        telephone?: string;
        email?: string;
        motDePasse?: string;
    }): Promise<Pharmacie> {
        return this.prisma.pharmacie.create({
            data,
        });
    }

    async findByNumeroAgrement(numeroAgrement: string): Promise<any> {
        return this.prisma.pharmacie.findFirst({
            where: { numeroAgrement },
            select: pharmacieIdentitySelect,
        });
    }

    async findByEmail(email: string): Promise<any> {
        return this.prisma.pharmacie.findFirst({
            where: { email },
            select: pharmacieAuthSelect,
        });
    }

    async update(id: number, data: {
        raisonSociale?: string;
        adresse?: string;
        numeroAgrement?: string;
        estDeGarde?: boolean;
        horaires?: string;
        latitude?: number;
        longitude?: number;
    }): Promise<any> {
        return this.prisma.pharmacie.update({
            where: { id },
            data,
            select: pharmacieListSelect,
        });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.pharmacie.delete({
            where: { id },
        });
    }
}
