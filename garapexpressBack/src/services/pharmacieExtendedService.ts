import { PrismaClient } from "@prisma/client";

export class PharmacieExtendedService {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    // Rechercher pharmacies à proximité
    async getPharmaciesProximite(
        clientLat: number,
        clientLng: number,
        rayonKm: number = 5
    ): Promise<any[]> {
        const pharmacies = await this.prisma.pharmacie.findMany({
            select: {
                id: true,
                raisonSociale: true,
                adresse: true,
                numeroAgrement: true,
                estDeGarde: true,
                horaires: true,
                latitude: true,
                longitude: true,
                catalogues: {
                    where: { disponibilite: true },
                    include: { medicament: true }
                }
            }
        });

        // Calculer la distance pour chaque pharmacie et filtrer
        const pharmaciesDenganDist = pharmacies.map(pharmacie => {
            const distance = this.calculerDistance(
                clientLat, clientLng,
                pharmacie.latitude, pharmacie.longitude
            );
            return { ...pharmacie, distance };
        });

        // Filtrer par rayon et trier par distance
        return pharmaciesDenganDist
            .filter((p: any) => p.distance <= rayonKm)
            .sort((a: any, b: any) => a.distance - b.distance);
    }

    // Pharmacies de garde à proximité
    async getPharmaciesGardeProximite(
        clientLat: number,
        clientLng: number,
        rayonKm: number = 10
    ): Promise<any[]> {
        const pharmacies = await this.prisma.pharmacie.findMany({
            where: { estDeGarde: true },
            select: {
                id: true,
                raisonSociale: true,
                adresse: true,
                numeroAgrement: true,
                estDeGarde: true,
                horaires: true,
                latitude: true,
                longitude: true,
                catalogues: {
                    where: { disponibilite: true },
                    include: { medicament: true }
                }
            }
        });

        const pharmaciesenganDist = pharmacies.map(pharmacie => {
            const distance = this.calculerDistance(
                clientLat, clientLng,
                pharmacie.latitude, pharmacie.longitude
            );
            return { ...pharmacie, distance };
        });

        return pharmaciesenganDist
            .filter((p: any) => p.distance <= rayonKm)
            .sort((a: any, b: any) => a.distance - b.distance);
    }

    // Calcul de distance (formule de Haversine)
    private calculerDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371;
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    // Mettre à jour le statut de garde
    async updateStatutGarde(pharmacieId: number, estDeGarde: boolean): Promise<any> {
        return this.prisma.pharmacie.update({
            where: { id: pharmacieId },
            data: { estDeGarde }
        });
    }

    // Mettre à jour les horaires
    async updateHoraires(pharmacieId: number, horaires: string): Promise<any> {
        return this.prisma.pharmacie.update({
            where: { id: pharmacieId },
            data: { horaires }
        });
    }

    async updateLocalisation(
        pharmacieId: number,
        latitude: number,
        longitude: number,
        adresse?: string
    ): Promise<any> {
        return this.prisma.pharmacie.update({
            where: { id: pharmacieId },
            data: {
                latitude,
                longitude,
                ...(adresse ? { adresse } : {})
            },
            select: {
                id: true,
                raisonSociale: true,
                adresse: true,
                latitude: true,
                longitude: true,
                estDeGarde: true,
                horaires: true
            }
        });
    }

    async getLocalisation(pharmacieId: number): Promise<any> {
        return this.prisma.pharmacie.findUnique({
            where: { id: pharmacieId },
            select: {
                id: true,
                raisonSociale: true,
                adresse: true,
                latitude: true,
                longitude: true,
                estDeGarde: true,
                horaires: true
            }
        });
    }
}
