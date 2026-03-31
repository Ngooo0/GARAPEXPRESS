import { PrismaClient } from "@prisma/client";
import { CataloguePharmacieRepository } from "../repositories/cataloguePharmacieRepository";
import { CataloguePharmacieService } from "../services/cataloguePharmacieService";
import { CataloguePharmacieController } from "../controllers/cataloguePharmacieController";
import { createCataloguePharmacieRouter } from "../routes/cataloguePharmacieRoute";

export class CataloguePharmacieConteneur {
    private static instance: { repository: CataloguePharmacieRepository; service: CataloguePharmacieService; controller: CataloguePharmacieController; router: ReturnType<typeof createCataloguePharmacieRouter> } | null = null;

    static getInstance(prisma: PrismaClient) {
        if (!CataloguePharmacieConteneur.instance) {
            const repository = new CataloguePharmacieRepository(prisma);
            const service = new CataloguePharmacieService(repository);
            const controller = new CataloguePharmacieController(service);
            const router = createCataloguePharmacieRouter(controller);
            CataloguePharmacieConteneur.instance = { repository, service, controller, router };
        }
        return CataloguePharmacieConteneur.instance;
    }
}
