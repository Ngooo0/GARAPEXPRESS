import { Router } from "express";
import { livraisonExtendedController } from "../controllers/livraisonExtendedController";

const router = Router();

// Calculer les frais de livraison
router.post("/calcul-frais", (req, res) => livraisonExtendedController.calculerFrais(req, res));

// Noter une livraison
router.post("/noter", (req, res) => livraisonExtendedController.noter(req, res));

// Historique des livraisons d'un livreur
router.get("/historique/:livreurId", (req, res) => livraisonExtendedController.getHistorique(req, res));

// Statistiques d'un livreur
router.get("/stats/:livreurId", (req, res) => livraisonExtendedController.getStats(req, res));

// Position temps reel d'une livraison
router.get("/:livraisonId/position", (req, res) => livraisonExtendedController.getPosition(req, res));
router.put("/:livraisonId/position", (req, res) => livraisonExtendedController.updatePosition(req, res));

// Suivi detaille d'une livraison
router.get("/:livraisonId/suivi", (req, res) => livraisonExtendedController.getSuivi(req, res));

export default router;
