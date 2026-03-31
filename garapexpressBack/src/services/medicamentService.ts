import { MedicamentRepository } from "../repositories/medicamentRepository";
import { Medicament } from "@prisma/client";

export class MedicamentService {
    constructor(private medicamentRepository: MedicamentRepository) {}

    async getAllMedicaments(): Promise<Medicament[]> {
        return this.medicamentRepository.findAll();
    }

    async getMedicamentById(id: number): Promise<Medicament | null> {
        return this.medicamentRepository.findById(id);
    }

    async searchMedicaments(nom: string): Promise<Medicament[]> {
        return this.medicamentRepository.findByNom(nom);
    }

    async getMedicamentsByCategorie(categorie: string): Promise<Medicament[]> {
        return this.medicamentRepository.findByCategorie(categorie);
    }

    async createMedicament(data: {
        nom: string;
        DCI: string;
        categorie: string;
        surOrdonnance: boolean;
        stock: number;
        prix: number;
    }): Promise<Medicament> {
        return this.medicamentRepository.create(data);
    }

    async updateMedicament(id: number, data: {
        nom?: string;
        DCI?: string;
        categorie?: string;
        surOrdonnance?: boolean;
        stock?: number;
        prix?: number;
    }): Promise<Medicament> {
        return this.medicamentRepository.update(id, data);
    }

    async deleteMedicament(id: number): Promise<void> {
        return this.medicamentRepository.delete(id);
    }
}
