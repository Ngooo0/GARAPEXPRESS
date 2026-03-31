import { Request, Response } from "express";
import { PharmacieExtendedService } from "../services/pharmacieExtendedService";
import { utilisateurPrisma } from "../conteneurs/utilisateurConteneur";

const pharmacieExtendedService = new PharmacieExtendedService(utilisateurPrisma);

export class PharmacieExtendedController {
    async getProximite(req: Request, res: Response): Promise<void> {
        try {
            const { lat, lng, rayon } = req.query;
            
            if (!lat || !lng) {
                res.status(400).json({ 
                    error: "Coordonnées manquantes",
                    required: ["lat", "lng"]
                });
                return;
            }

            const result = await pharmacieExtendedService.getPharmaciesProximite(
                parseFloat(lat as string),
                parseFloat(lng as string),
                parseFloat(rayon as string) || 5
            );

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error("Erreur proximité:", error);
            res.status(500).json({ error: "Erreur lors de la recherche" });
        }
    }

    async getGardeProximite(req: Request, res: Response): Promise<void> {
        try {
            const { lat, lng, rayon } = req.query;
            
            if (!lat || !lng) {
                res.status(400).json({ 
                    error: "Coordonnées manquantes",
                    required: ["lat", "lng"]
                });
                return;
            }

            const result = await pharmacieExtendedService.getPharmaciesGardeProximite(
                parseFloat(lat as string),
                parseFloat(lng as string),
                parseFloat(rayon as string) || 10
            );

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error("Erreur garde proximité:", error);
            res.status(500).json({ error: "Erreur lors de la recherche" });
        }
    }

    async updateGarde(req: Request, res: Response): Promise<void> {
        try {
            const { pharmacieId } = req.params;
            const { estDeGarde } = req.body;
            
            if (estDeGarde === undefined) {
                res.status(400).json({ error: "Paramètre estDeGarde requis" });
                return;
            }

            const result = await pharmacieExtendedService.updateStatutGarde(
                parseInt(pharmacieId as string),
                estDeGarde
            );

            res.json({
                success: true,
                message: "Statut de garde mis à jour",
                data: result
            });
        } catch (error) {
            console.error("Erreur mise à garde:", error);
            res.status(500).json({ error: "Erreur lors de la mise à jour" });
        }
    }

    async updateHoraires(req: Request, res: Response): Promise<void> {
        try {
            const { pharmacieId } = req.params;
            const { horaires } = req.body;
            
            if (!horaires) {
                res.status(400).json({ error: "Paramètre horaires requis" });
                return;
            }

            const result = await pharmacieExtendedService.updateHoraires(
                parseInt(pharmacieId as string),
                horaires
            );

            res.json({
                success: true,
                message: "Horaires mis à jour",
                data: result
            });
        } catch (error) {
            console.error("Erreur horaires:", error);
            res.status(500).json({ error: "Erreur lors de la mise à jour" });
        }
    }

    async updateLocalisation(req: Request, res: Response): Promise<void> {
        try {
            const { pharmacieId } = req.params;
            const { latitude, longitude, adresse } = req.body;

            if (latitude === undefined || longitude === undefined) {
                res.status(400).json({
                    error: "Coordonnées requises",
                    required: ["latitude", "longitude"]
                });
                return;
            }

            const result = await pharmacieExtendedService.updateLocalisation(
                parseInt(pharmacieId as string),
                parseFloat(latitude),
                parseFloat(longitude),
                adresse
            );

            res.json({
                success: true,
                message: "Localisation pharmacie mise à jour",
                data: result
            });
        } catch (error) {
            console.error("Erreur localisation pharmacie:", error);
            res.status(500).json({ error: "Erreur lors de la mise à jour de la localisation" });
        }
    }

    async getLocalisation(req: Request, res: Response): Promise<void> {
        try {
            const { pharmacieId } = req.params;

            const result = await pharmacieExtendedService.getLocalisation(
                parseInt(pharmacieId as string)
            );

            if (!result) {
                res.status(404).json({ error: "Pharmacie introuvable" });
                return;
            }

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error("Erreur lecture localisation pharmacie:", error);
            res.status(500).json({ error: "Erreur lors de la récupération de la localisation" });
        }
    }
}

export const pharmacieExtendedController = new PharmacieExtendedController();
