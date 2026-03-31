import { CommandeRepository } from "../repositories/commandeRepository";
import { Commande } from "@prisma/client";

export class CommandeService {
    constructor(private commandeRepository: CommandeRepository) {}

    async getAllCommandes(): Promise<Commande[]> {
        return this.commandeRepository.findAll();
    }

    async getCommandeById(id: number): Promise<Commande | null> {
        return this.commandeRepository.findById(id);
    }

    async getCommandesByClient(clientId: number): Promise<Commande[]> {
        return this.commandeRepository.findByClientId(clientId);
    }

    async getCommandesByPharmacie(pharmacieId: number): Promise<Commande[]> {
        return this.commandeRepository.findByPharmacieId(pharmacieId);
    }

    async getCommandesByStatut(statut: string): Promise<Commande[]> {
        return this.commandeRepository.findByStatut(statut);
    }

    async createCommande(data: {
        dateCommande: Date | string;
        statut: string;
        montantTotal: number;
        adresseLivraison: string;
        clientId: number;
        pharmacieId: number;
    }): Promise<Commande> {
        return this.commandeRepository.create(data);
    }

    async updateCommande(id: number, data: {
        dateCommande?: Date | string;
        statut?: string;
        montantTotal?: number;
        adresseLivraison?: string;
    }): Promise<Commande> {
        return this.commandeRepository.update(id, data);
    }

    async updateStatut(id: number, statut: string): Promise<Commande> {
        return this.commandeRepository.update(id, { statut });
    }

    async deleteCommande(id: number): Promise<void> {
        return this.commandeRepository.delete(id);
    }
}
