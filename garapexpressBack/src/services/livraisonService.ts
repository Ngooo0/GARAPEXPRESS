import { LivraisonRepository } from "../repositories/livraisonRepository";
import { Livraison } from "@prisma/client";

export class LivraisonService {
    constructor(private livraisonRepository: LivraisonRepository) {}

    async getAllLivraisons(): Promise<Livraison[]> {
        return this.livraisonRepository.findAll();
    }

    async getLivraisonById(id: number): Promise<Livraison | null> {
        return this.livraisonRepository.findById(id);
    }

    async getLivraisonByCommande(commandeId: number): Promise<Livraison | null> {
        return this.livraisonRepository.findByCommandeId(commandeId);
    }

    async getLivraisonsByLivreur(livreurId: number): Promise<Livraison[]> {
        return this.livraisonRepository.findByLivreurId(livreurId);
    }

    async createLivraison(data: {
        heureDepart: Date | string;
        heureArrivee?: Date | string;
        statut: string;
        adresse: string;
        commandeId: number;
        livreurId: number;
    }): Promise<Livraison> {
        return this.livraisonRepository.create(data);
    }

    async updateLivraison(id: number, data: {
        heureDepart?: Date | string;
        heureArrivee?: Date | string;
        statut?: string;
        adresse?: string;
    }): Promise<Livraison> {
        return this.livraisonRepository.update(id, data);
    }

    async deleteLivraison(id: number): Promise<void> {
        return this.livraisonRepository.delete(id);
    }
}
