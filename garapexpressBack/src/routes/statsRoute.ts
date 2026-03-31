import { Router } from "express";
import { statsController } from "../controllers/statsController";

const router = Router();

// Statistiques globales
router.get("/", (req, res) => statsController.getStats(req, res));

// Statistiques pharmacies
router.get("/pharmacies", (req, res) => statsController.getStatsPharmacies(req, res));

// Statistiques livreurs
router.get("/livreurs", (req, res) => statsController.getStatsLivreurs(req, res));

// Statistiques par période
router.get("/periode", (req, res) => statsController.getStatsPeriode(req, res));

export default router;