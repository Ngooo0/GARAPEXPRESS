import { PrismaClient } from "@prisma/client";

export class StatsService {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    // Statistiques globales admin
    async getStatsGlobales(): Promise<any> {
        // Comptes
        const totalUtilisateurs = await this.prisma.utilisateur.count();
        const totalClients = await this.prisma.client.count();
        const totalLivreurs = await this.prisma.livreur.count();
        const totalAdmins = await this.prisma.admin.count();
        const totalPharmacies = await this.prisma.pharmacie.count();

        // Commandes
        const totalCommandes = await this.prisma.commande.count();
        const commandesEnCours = await this.prisma.commande.count({
            where: { statut: { in: ['en_attente', 'en_preparation', 'en_livraison'] } }
        });
        const commandesTerminees = await this.prisma.commande.count({
            where: { statut: 'livre' }
        });

        // Revenus
        const paiements = await this.prisma.paiement.findMany({
            where: { statut: 'succes' }
        });
        const revenusTotaux = paiements.reduce((sum, p) => sum + p.montant, 0);

        // Livraisons
        const totalLivraisons = await this.prisma.livraison.count();
        const livraisonsReussies = await this.prisma.livraison.count({
            where: { statut: 'livre' }
        });

        // Taux de succès
        const tauxSuccess = totalLivraisons > 0 
            ? (livraisonsReussies / totalLivraisons) * 100 
            : 0;

        // Médicaments
        const totalMedicaments = await this.prisma.medicament.count();
        const medicamentsDisponibles = await this.prisma.cataloguePharmacie.count({
            where: { disponibilite: true }
        });

        return {
            utilisateurs: {
                total: totalUtilisateurs,
                clients: totalClients,
                livreurs: totalLivreurs,
                admins: totalAdmins
            },
            pharmacies: totalPharmacies,
            medicaments: {
                total: totalMedicaments,
                disponibles: medicamentsDisponibles
            },
            commandes: {
                total: totalCommandes,
                enCours: commandesEnCours,
                terminees: commandesTerminees
            },
            livraisons: {
                total: totalLivraisons,
                reussies: livraisonsReussies,
                tauxSuccess: Math.round(tauxSuccess * 100) / 100
            },
            revenus: {
                total: revenusTotaux,
                devise: 'CFA'
            }
        };
    }

    // Statistiques pharmacies
    async getStatsPharmacies(): Promise<any[]> {
        const pharmacies = await this.prisma.pharmacie.findMany({
            select: {
                id: true,
                raisonSociale: true,
                adresse: true,
                horaires: true,
                estDeGarde: true,
                commandes: {
                    select: { id: true }
                },
                catalogues: {
                    select: { id: true }
                }
            }
        });

        return pharmacies.map(p => ({
            id: p.id,
            raisonSociale: p.raisonSociale,
            adresse: p.adresse,
            horaires: p.horaires,
            commandantestotal: p.commandes.length,
            produits: p.catalogues.length,
            estDeGarde: p.estDeGarde
        }));
    }

    // Statistiques livreurs
    async getStatsLivreurs(): Promise<any[]> {
        const livreurs = await this.prisma.livreur.findMany({
            include: {
                utilisateur: true,
                livraisons: true
            }
        });

        return livreurs.map(l => ({
            id: l.id,
            nom: l.utilisateur.nom,
            prenom: l.utilisateur.prenom,
            disponibilite: l.disponibilite,
            noteMoyenne: l.noteMoyenne,
            totalLivraisons: l.livraisons.length,
            vehicule: l.vehicule
        }));
    }

    // Statistiques commandes par période
    async getStatsCommandesPeriode(debut: Date, fin: Date): Promise<any> {
        const commandes = await this.prisma.commande.findMany({
            where: {
                dateCommande: {
                    gte: debut,
                    lte: fin
                }
            }
        });

        const commandesParStatut = commandes.reduce((acc, c) => {
            acc[c.statut] = (acc[c.statut] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const revenus = commandes.reduce((sum, c) => sum + c.montantTotal, 0);

        return {
            periode: { debut, fin },
            total: commandes.length,
            parStatut: commandesParStatut,
            revenus
        };
    }
}
