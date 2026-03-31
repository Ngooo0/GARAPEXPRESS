import { Router } from "express";
import { pharmacieExtendedController } from "../controllers/pharmacieExtendedController";

const router = Router();

// Pharmacies à proximité
router.get("/proximite", (req, res) => pharmacieExtendedController.getProximite(req, res));

// Pharmacies de garde à proximité
router.get("/garde/proximite", (req, res) => pharmacieExtendedController.getGardeProximite(req, res));

// Mettre à jour le statut de garde
router.put("/:pharmacieId/garde", (req, res) => pharmacieExtendedController.updateGarde(req, res));

// Mettre à jour les horaires
router.put("/:pharmacieId/horaires", (req, res) => pharmacieExtendedController.updateHoraires(req, res));

// Lire et mettre à jour la localisation d'une pharmacie
router.get("/:pharmacieId/localisation", (req, res) => pharmacieExtendedController.getLocalisation(req, res));
router.put("/:pharmacieId/localisation", (req, res) => pharmacieExtendedController.updateLocalisation(req, res));

export default router;
