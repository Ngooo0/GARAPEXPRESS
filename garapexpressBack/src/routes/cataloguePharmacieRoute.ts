import { Router } from "express";
import { CataloguePharmacieController } from "../controllers/cataloguePharmacieController";

export function createCataloguePharmacieRouter(catalogueController: CataloguePharmacieController): Router {
    const router = Router();

    router.get("/", catalogueController.getAll.bind(catalogueController));
    router.get("/pharmacie/:pharmacieId", catalogueController.getByPharmacie.bind(catalogueController));
    router.get("/pharmacie/:pharmacieId/disponibles", catalogueController.getDisponibles.bind(catalogueController));
    router.get("/:id", catalogueController.getById.bind(catalogueController));
    router.post("/", catalogueController.create.bind(catalogueController));
    router.put("/:id", catalogueController.update.bind(catalogueController));
    router.delete("/:id", catalogueController.delete.bind(catalogueController));

    return router;
}

export default createCataloguePharmacieRouter;
