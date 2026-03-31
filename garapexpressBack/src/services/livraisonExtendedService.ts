import { PrismaClient } from "@prisma/client";
import { geolocationService } from "./geolocationService";

export class LivraisonService {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    // Calculer les frais de livraison basée sur la distance
    async calculerFraisLivraison(
        pharmacieLat: number,
        pharmacieLng: number,
        clientLat: number,
        clientLng: number
    ): Promise<{ frais: number; distance: number;tempsEstime: number }> {
        // Formule approximative de calcul de distance (formule de Haversine)
        const R = 6371; // Rayon de la Terre en km
        const dLat = this.toRad(clientLat - pharmacieLat);
        const dLng = this.toRad(clientLng - pharmacieLng);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(pharmacieLat)) * Math.cos(this.toRad(clientLat)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance en km

        // Calcul des frais: tarif de base + coût au km
        const tarifBase = 500; // 500 CFA
        const coutParKm = 50; // 50 CFA par km
        const frais = Math.max(tarifBase, Math.round(tarifBase + (distance * coutParKm)));

        // Estimation du temps en minutes (environ 30 km/h en ville)
        const tempsEstime = Math.round((distance / 30) * 60);

        return { frais, distance: Math.round(distance * 10) / 10, tempsEstime };
    }

    private toRad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    // Noter une livraison
    async noterLivraison(livraisonId: number, note: number): Promise<any> {
        const livraison = await this.prisma.livraison.update({
            where: { id: livraisonId },
            data: { /* ajouter un champ note dans le schema */ },
            include: { commande: true }
        });

        // Mettre à jour la note moyenne du livreur
        const livreurId = livraison.livreurId;
        const toutesLivraisons = await this.prisma.livraison.findMany({
            where: { livreurId: livreurId }
        });
        
        const moyenne = toutesLivraisons.length > 0 
            ? toutesLivraisons.reduce((sum, l) => sum + (l as any).note || 0, 0) / toutesLivraisons.length
            : note;

        await this.prisma.livreur.update({
            where: { id: livreurId },
            data: { noteMoyenne: moyenne }
        });

        return livraison;
    }

    // Historique des livraisons d'un livreur
    async getHistoriqueLivreur(livreurId: number): Promise<any[]> {
        return this.prisma.livraison.findMany({
            where: { livreurId },
            include: {
                commande: {
                    include: {
                        client: {
                            include: { utilisateur: true }
                        },
                        pharmacie: true
                    }
                }
            },
            orderBy: { heureDepart: 'desc' }
        });
    }

    // Statistiques d'un livreur
    async getStatsLivreur(livreurId: number): Promise<any> {
        const toutesLivraisons = await this.prisma.livraison.findMany({
            where: { livreurId }
        });

        const livrees = toutesLivraisons.filter(l => l.statut === 'livré').length;
        const enCours = toutesLivraisons.filter(l => l.statut === 'en_cours').length;
        const totalGains = livrees * 1000; // À calculer différemment

        const livreur = await this.prisma.livreur.findUnique({
            where: { id: livreurId }
        });

        return {
            totalLivraisons: toutesLivraisons.length,
            livrees,
            enCours,
            noteMoyenne: livreur?.noteMoyenne || 0,
            gainsEstimés: totalGains
        };
    }

    async updatePositionLivreur(
        livraisonId: number,
        livreurId: number,
        latitude: number,
        longitude: number,
        precision?: number,
        vitesse?: number,
        cap?: number
    ): Promise<any> {
        const livraison = await this.prisma.livraison.findUnique({
            where: { id: livraisonId },
            include: {
                commande: {
                    include: {
                        pharmacie: true
                    }
                }
            }
        });

        if (!livraison) {
            throw new Error("Livraison introuvable");
        }

        if (livraison.livreurId !== livreurId) {
            throw new Error("Cette livraison n'appartient pas à ce livreur");
        }

        const position = geolocationService.updateDeliveryPosition({
            livraisonId,
            livreurId,
            latitude,
            longitude,
            precision,
            vitesse,
            cap
        });

        const distanceVersPharmacie = geolocationService.calculerDistanceKm(
            latitude,
            longitude,
            livraison.commande.pharmacie.latitude,
            livraison.commande.pharmacie.longitude
        );

        return {
            position,
            distanceVersPharmacieKm: Math.round(distanceVersPharmacie * 100) / 100,
            livraisonStatut: livraison.statut,
            commandeStatut: livraison.commande.statut
        };
    }

    async getPositionLivreur(livraisonId: number): Promise<any> {
        const position = geolocationService.getDeliveryPosition(livraisonId);

        if (!position) {
            return null;
        }

        return position;
    }

    async getSuiviLivraison(livraisonId: number): Promise<any> {
        const livraison = await this.prisma.livraison.findUnique({
            where: { id: livraisonId },
            include: {
                livreur: {
                    include: {
                        utilisateur: true
                    }
                },
                commande: {
                    include: {
                        pharmacie: true,
                        client: {
                            include: {
                                utilisateur: true
                            }
                        }
                    }
                }
            }
        });

        if (!livraison) {
            throw new Error("Livraison introuvable");
        }

        const position = geolocationService.getDeliveryPosition(livraisonId);
        const pharmacie = livraison.commande.pharmacie;

        const distanceVersPharmacieKm = position
            ? Math.round(
                  geolocationService.calculerDistanceKm(
                      position.latitude,
                      position.longitude,
                      pharmacie.latitude,
                      pharmacie.longitude
                  ) * 100
              ) / 100
            : null;

        return {
            livraison: {
                id: livraison.id,
                statut: livraison.statut,
                adresse: livraison.adresse,
                heureDepart: livraison.heureDepart,
                heureArrivee: livraison.heureArrivee
            },
            livreur: {
                id: livraison.livreur.id,
                nom: livraison.livreur.utilisateur.nom,
                prenom: livraison.livreur.utilisateur.prenom,
                telephone: livraison.livreur.utilisateur.telephone
            },
            pharmacie: {
                id: pharmacie.id,
                raisonSociale: pharmacie.raisonSociale,
                adresse: pharmacie.adresse,
                latitude: pharmacie.latitude,
                longitude: pharmacie.longitude
            },
            client: {
                id: livraison.commande.client.id,
                nom: livraison.commande.client.utilisateur.nom,
                prenom: livraison.commande.client.utilisateur.prenom,
                telephone: livraison.commande.client.utilisateur.telephone,
                adresseLivraison: livraison.commande.adresseLivraison
            },
            positionLivreur: position,
            distanceVersPharmacieKm
        };
    }
}
