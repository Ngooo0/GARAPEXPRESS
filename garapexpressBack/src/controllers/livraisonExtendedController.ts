import { Request, Response } from "express";
import { LivraisonService } from "../services/livraisonExtendedService";
import { utilisateurPrisma } from "../conteneurs/utilisateurConteneur";
import { wsService } from "../services/websocketService";

const livraisonExtendedService = new LivraisonService(utilisateurPrisma);

export class LivraisonExtendedController {
    // Calculer les frais de livraison
    async calculerFrais(req: Request, res: Response): Promise<void> {
        try {
            const { pharmacieLat, pharmacieLng, clientLat, clientLng } = req.body;
            
            if (!pharmacieLat || !pharmacieLng || !clientLat || !clientLng) {
                res.status(400).json({ 
                    error: "Coordonnées manquantes",
                    required: ["pharmacieLat", "pharmacieLng", "clientLat", "clientLng"]
                });
                return;
            }

            const result = await livraisonExtendedService.calculerFraisLivraison(
                parseFloat(pharmacieLat),
                parseFloat(pharmacieLng),
                parseFloat(clientLat),
                parseFloat(clientLng)
            );

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error("Erreur calcul frais:", error);
            res.status(500).json({ error: "Erreur lors du calcul des frais" });
        }
    }

    // Noter une livraison
    async noter(req: Request, res: Response): Promise<void> {
        try {
            const { livraisonId, note } = req.body;
            
            if (!livraisonId || note === undefined) {
                res.status(400).json({ 
                    error: "Paramètres manquants",
                    required: ["livraisonId", "note"]
                });
                return;
            }

            if (note < 1 || note > 5) {
                res.status(400).json({ error: "La note doit être entre 1 et 5" });
                return;
            }

            const result = await livraisonExtendedService.noterLivraison(
                parseInt(livraisonId),
                parseInt(note)
            );

            res.json({
                success: true,
                message: "Note enregistrée",
                data: result
            });
        } catch (error) {
            console.error("Erreur notation:", error);
            res.status(500).json({ error: "Erreur lors de la notation" });
        }
    }

    // Historique livreur
    async getHistorique(req: Request, res: Response): Promise<void> {
        try {
            const { livreurId } = req.params;
            
            if (!livreurId) {
                res.status(400).json({ error: "livreurId requis" });
                return;
            }

            const result = await livraisonExtendedService.getHistoriqueLivreur(
                parseInt(livreurId as string)
            );

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error("Erreur historique:", error);
            res.status(500).json({ error: "Erreur lors de la récupération de l'historique" });
        }
    }

    // Statistiques livreur
    async getStats(req: Request, res: Response): Promise<void> {
        try {
            const { livreurId } = req.params;
            
            if (!livreurId) {
                res.status(400).json({ error: "livreurId requis" });
                return;
            }

            const result = await livraisonExtendedService.getStatsLivreur(
                parseInt(livreurId as string)
            );

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error("Erreur stats:", error);
            res.status(500).json({ error: "Erreur lors de la récupération des statistiques" });
        }
    }

    async updatePosition(req: Request, res: Response): Promise<void> {
        try {
            const { livraisonId } = req.params;
            const { livreurId, latitude, longitude, precision, vitesse, cap } = req.body;

            if (!livraisonId || !livreurId || latitude === undefined || longitude === undefined) {
                res.status(400).json({
                    error: "Paramètres manquants",
                    required: ["livraisonId", "livreurId", "latitude", "longitude"]
                });
                return;
            }

            const result = await livraisonExtendedService.updatePositionLivreur(
                parseInt(livraisonId as string),
                parseInt(livreurId),
                parseFloat(latitude),
                parseFloat(longitude),
                precision !== undefined ? parseFloat(precision) : undefined,
                vitesse !== undefined ? parseFloat(vitesse) : undefined,
                cap !== undefined ? parseFloat(cap) : undefined
            );

            wsService.notifyLivraisonPosition(parseInt(livraisonId as string), result);

            res.json({
                success: true,
                message: "Position du livreur mise à jour",
                data: result
            });
        } catch (error: any) {
            console.error("Erreur position livreur:", error);
            res.status(500).json({ error: error.message || "Erreur lors de la mise à jour de la position" });
        }
    }

    async getPosition(req: Request, res: Response): Promise<void> {
        try {
            const { livraisonId } = req.params;

            const result = await livraisonExtendedService.getPositionLivreur(
                parseInt(livraisonId as string)
            );

            if (!result) {
                res.status(404).json({ error: "Aucune position active pour cette livraison" });
                return;
            }

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error("Erreur lecture position:", error);
            res.status(500).json({ error: "Erreur lors de la récupération de la position" });
        }
    }

    async getSuivi(req: Request, res: Response): Promise<void> {
        try {
            const { livraisonId } = req.params;

            const result = await livraisonExtendedService.getSuiviLivraison(
                parseInt(livraisonId as string)
            );

            res.json({
                success: true,
                data: result
            });
        } catch (error: any) {
            console.error("Erreur suivi livraison:", error);
            res.status(500).json({ error: error.message || "Erreur lors de la récupération du suivi" });
        }
    }
}

export const livraisonExtendedController = new LivraisonExtendedController();
