import { Request, Response } from "express";
import { CataloguePharmacieService } from "../services/cataloguePharmacieService";
import { CataloguePharmacieValidator } from "../validators/cataloguePharmacieValidator";

export class CataloguePharmacieController {
    constructor(private catalogueService: CataloguePharmacieService) {}

    async getAll(req: Request, res: Response) {
        try {
            const catalogues = await this.catalogueService.getAllCatalogues();
            res.json({ success: true, data: catalogues });
        } catch (error) {
            res.status(500).json({ success: false, message: "Erreur lors de la récupération des catalogues", error: String(error) });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            const catalogue = await this.catalogueService.getCatalogueById(id);
            if (!catalogue) {
                return res.status(404).json({ success: false, message: "Catalogue non trouvé" });
            }
            res.json({ success: true, data: catalogue });
        } catch (error) {
            res.status(500).json({ success: false, message: "Erreur lors de la récupération du catalogue", error: String(error) });
        }
    }

    async getByPharmacie(req: Request, res: Response) {
        try {
            const pharmacieId = parseInt(req.params.pharmacieId as string);
            const catalogues = await this.catalogueService.getCataloguesByPharmacie(pharmacieId);
            res.json({ success: true, data: catalogues });
        } catch (error) {
            res.status(500).json({ success: false, message: "Erreur lors de la récupération des catalogues", error: String(error) });
        }
    }

    async getDisponibles(req: Request, res: Response) {
        try {
            const pharmacieId = parseInt(req.params.pharmacieId as string);
            const catalogues = await this.catalogueService.getDisponibles(pharmacieId);
            res.json({ success: true, data: catalogues });
        } catch (error) {
            res.status(500).json({ success: false, message: "Erreur lors de la récupération des catalogues disponibles", error: String(error) });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const data = req.body;
            const validation = CataloguePharmacieValidator.safeParse(data);
            if (!validation.success) {
                return res.status(400).json({ success: false, message: "Données invalides", errors: validation.error.issues });
            }
            const catalogue = await this.catalogueService.createCatalogue({ ...data, dateMAJ: new Date() });
            res.status(201).json({ success: true, data: catalogue });
        } catch (error) {
            res.status(500).json({ success: false, message: "Erreur lors de la création du catalogue", error: String(error) });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            const data = req.body;
            const catalogue = await this.catalogueService.updateCatalogue(id, data);
            res.json({ success: true, data: catalogue });
        } catch (error) {
            res.status(500).json({ success: false, message: "Erreur lors de la mise à jour du catalogue", error: String(error) });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            await this.catalogueService.deleteCatalogue(id);
            res.json({ success: true, message: "Catalogue supprimé avec succès" });
        } catch (error) {
            res.status(500).json({ success: false, message: "Erreur lors de la suppression du catalogue", error: String(error) });
        }
    }
}
