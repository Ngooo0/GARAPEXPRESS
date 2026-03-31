import { Request, Response } from "express";
import { StatsService } from "../services/statsService";
import { utilisateurPrisma } from "../conteneurs/utilisateurConteneur";

const statsService = new StatsService(utilisateurPrisma);

export class StatsController {
    // Statistiques globales admin
    async getStats(req: Request, res: Response): Promise<void> {
        try {
            const result = await statsService.getStatsGlobales();
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error("Erreur stats:", error);
            res.status(500).json({ error: "Erreur lors de la récupération des statistiques" });
        }
    }

    // Statistiques pharmacies
    async getStatsPharmacies(req: Request, res: Response): Promise<void> {
        try {
            const result = await statsService.getStatsPharmacies();
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error("Erreur stats pharmacies:", error);
            res.status(500).json({ error: "Erreur lors de la récupération" });
        }
    }

    // Statistiques livreurs
    async getStatsLivreurs(req: Request, res: Response): Promise<void> {
        try {
            const result = await statsService.getStatsLivreurs();
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error("Erreur stats livreurs:", error);
            res.status(500).json({ error: "Erreur lors de la récupération" });
        }
    }

    // Statistiques par période
    async getStatsPeriode(req: Request, res: Response): Promise<void> {
        try {
            const { debut, fin } = req.query;
            
            if (!debut || !fin) {
                res.status(400).json({ 
                    error: "Paramètres manquants",
                    required: ["debut", "fin"]
                });
                return;
            }

            const result = await statsService.getStatsCommandesPeriode(
                new Date(debut as string),
                new Date(fin as string)
            );

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error("Erreur stats période:", error);
            res.status(500).json({ error: "Erreur lors de la récupération" });
        }
    }
}

export const statsController = new StatsController();