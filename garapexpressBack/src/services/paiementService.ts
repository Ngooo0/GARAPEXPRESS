import { PaiementRepository } from "../repositories/paiementRepository";
import { Paiement } from "@prisma/client";

export class PaiementService {
    constructor(private paiementRepository: PaiementRepository) {}

    async getAllPaiements(): Promise<Paiement[]> {
        return this.paiementRepository.findAll();
    }

    async getPaiementById(id: number): Promise<Paiement | null> {
        return this.paiementRepository.findById(id);
    }

    async getPaiementByCommande(commandeId: number): Promise<Paiement | null> {
        return this.paiementRepository.findByCommandeId(commandeId);
    }

    async createPaiement(data: { montant: number; modePaiement: string; statut: string; dateTransaction: Date | string; commandeId: number }): Promise<Paiement> {
        return this.paiementRepository.create(data);
    }

    async updatePaiement(id: number, data: { montant?: number; modePaiement?: string; statut?: string }): Promise<Paiement> {
        return this.paiementRepository.update(id, data);
    }

    async deletePaiement(id: number): Promise<void> {
        return this.paiementRepository.delete(id);
    }
}
