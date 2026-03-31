import { CataloguePharmacieRepository } from "../repositories/cataloguePharmacieRepository";
import { CataloguePharmacie } from "@prisma/client";

export class CataloguePharmacieService {
    constructor(private catalogueRepository: CataloguePharmacieRepository) {}

    async getAllCatalogues(): Promise<CataloguePharmacie[]> {
        return this.catalogueRepository.findAll();
    }

    async getCatalogueById(id: number): Promise<CataloguePharmacie | null> {
        return this.catalogueRepository.findById(id);
    }

    async getCataloguesByPharmacie(pharmacieId: number): Promise<CataloguePharmacie[]> {
        return this.catalogueRepository.findByPharmacieId(pharmacieId);
    }

    async getCataloguesByMedicament(medicamentId: number): Promise<CataloguePharmacie[]> {
        return this.catalogueRepository.findByMedicamentId(medicamentId);
    }

    async getDisponibles(pharmacieId: number): Promise<CataloguePharmacie[]> {
        return this.catalogueRepository.findDisponibles(pharmacieId);
    }

    async createCatalogue(data: { prix: number; quantiteStock: number; disponibilite: boolean; dateMAJ: Date | string; pharmacieId: number; medicamentId: number }): Promise<CataloguePharmacie> {
        return this.catalogueRepository.create(data);
    }

    async updateCatalogue(id: number, data: { prix?: number; quantiteStock?: number; disponibilite?: boolean }): Promise<CataloguePharmacie> {
        return this.catalogueRepository.update(id, data);
    }

    async deleteCatalogue(id: number): Promise<void> {
        return this.catalogueRepository.delete(id);
    }
}
