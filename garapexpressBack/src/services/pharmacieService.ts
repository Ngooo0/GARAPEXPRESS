import { PharmacieRepository } from "../repositories/pharmacieRepository";
import { Pharmacie, PrismaClient } from "@prisma/client";
import jsonwebtoken from "jsonwebtoken";

export class PharmacieService {
    private SECRET_KEY = "SOKHNANGONE";

    constructor(private pharmacieRepository: PharmacieRepository) {}

    async getAllPharmacies(): Promise<Pharmacie[]> {
        return this.pharmacieRepository.findAll();
    }

    async getPharmacieById(id: number): Promise<Pharmacie | null> {
        return this.pharmacieRepository.findById(id);
    }

    async getPharmaciesDeGarde(): Promise<Pharmacie[]> {
        return this.pharmacieRepository.findPharmaciesDeGarde();
    }

    async createPharmacie(data: {
        raisonSociale: string;
        adresse: string;
        numeroAgrement: string;
        estDeGarde: boolean;
        horaires: string;
        latitude: number;
        longitude: number;
    }): Promise<Pharmacie> {
        return this.pharmacieRepository.create(data);
    }

    async registerPharmacie(data: {
        raisonSociale: string;
        adresse: string;
        numeroAgrement: string;
        telephone: string;
        email: string;
        motDePasse: string;
        horaires: string;
        latitude?: number;
        longitude?: number;
    }): Promise<any> {
        const existingByNumeroAgrement = await this.pharmacieRepository.findByNumeroAgrement(data.numeroAgrement);
        if (existingByNumeroAgrement) {
            throw new Error("Une pharmacie avec ce numéro d'agrément existe déjà");
        }

        const existingByEmail = await this.pharmacieRepository.findByEmail(data.email);
        if (existingByEmail) {
            throw new Error("Une pharmacie avec cet email existe déjà");
        }

        return this.pharmacieRepository.create({
            raisonSociale: data.raisonSociale,
            adresse: data.adresse,
            numeroAgrement: data.numeroAgrement,
            estDeGarde: false,
            horaires: data.horaires,
            latitude: data.latitude || 0,
            longitude: data.longitude || 0,
            telephone: data.telephone,
            email: data.email,
            motDePasse: data.motDePasse,
        });
    }

    async loginPharmacie(email: string, motDePasse: string): Promise<string> {
        const pharmacie = await this.pharmacieRepository.findByEmail(email);
        if (!pharmacie) {
            throw new Error("Pharmacie non trouvée");
        }
        if (pharmacie.motDePasse !== motDePasse) {
            throw new Error("Mot de passe incorrect");
        }

        // Generate JWT token
        return jsonwebtoken.sign(
            {
                raisonSociale: pharmacie.raisonSociale,
                email: pharmacie.email,
                idPharmacie: pharmacie.id,
                role: "pharmacy"
            },
            this.SECRET_KEY,
            { expiresIn: "1d" }
        );
    }

    async updatePharmacie(id: number, data: {
        raisonSociale?: string;
        adresse?: string;
        numeroAgrement?: string;
        estDeGarde?: boolean;
        horaires?: string;
        latitude?: number;
        longitude?: number;
    }): Promise<Pharmacie> {
        return this.pharmacieRepository.update(id, data);
    }

    async deletePharmacie(id: number): Promise<void> {
        const prisma = new PrismaClient({} as any);

        await prisma.$transaction(async (tx) => {
            const pharmacyOrders = await tx.commande.findMany({
                where: { pharmacieId: id },
                select: { id: true },
            });
            const pharmacyOrderIds = pharmacyOrders.map((order) => order.id);

            if (pharmacyOrderIds.length > 0) {
                await tx.ordonnance.deleteMany({
                    where: { commandeId: { in: pharmacyOrderIds } },
                });
                await tx.paiement.deleteMany({
                    where: { commandeId: { in: pharmacyOrderIds } },
                });
                await tx.livraison.deleteMany({
                    where: { commandeId: { in: pharmacyOrderIds } },
                });
                await tx.commande.deleteMany({
                    where: { id: { in: pharmacyOrderIds } },
                });
            }

            await tx.cataloguePharmacie.deleteMany({
                where: { pharmacieId: id },
            });

            await tx.pharmacie.deleteMany({
                where: { id },
            });
        });
    }
}
