import { OrdonnanceRepository } from "../repositories/ordonnanceRepository";
import { Ordonnance } from "@prisma/client";

export class OrdonnanceService {
    constructor(private ordonnanceRepository: OrdonnanceRepository) {}

    async getAllOrdonnances(): Promise<Ordonnance[]> {
        return this.ordonnanceRepository.findAll();
    }

    async getOrdonnanceById(id: number): Promise<Ordonnance | null> {
        return this.ordonnanceRepository.findById(id);
    }

    async getOrdonnanceByCommande(commandeId: number): Promise<Ordonnance | null> {
        return this.ordonnanceRepository.findByCommandeId(commandeId);
    }

    async createOrdonnance(data: { dateEmission: Date | string; fichier: string; statut: string; commandeId: number }): Promise<Ordonnance> {
        return this.ordonnanceRepository.create(data);
    }

    async updateOrdonnance(id: number, data: { dateEmission?: Date | string; fichier?: string; statut?: string }): Promise<Ordonnance> {
        return this.ordonnanceRepository.update(id, data);
    }

    async deleteOrdonnance(id: number): Promise<void> {
        return this.ordonnanceRepository.delete(id);
    }
}
