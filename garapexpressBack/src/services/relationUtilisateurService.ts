import { RelationUtilisateurRepository } from "../repositories/relationUtilisateurRepository";
import { Prisma, RelationUtilisateur } from "@prisma/client";

export class RelationUtilisateurService {
    constructor(private relationRepository: RelationUtilisateurRepository) { }

    // Envoyer une demande de relation (ami)
    async envoyerDemandeRelation(demandeurId: number, receveurId: number, type: string = "ami") {
        // Vérifier si une relation existe déjà
        const relationExistante = await this.relationRepository.getRelationBetweenUsers(demandeurId, receveurId);
        
        if (relationExistante) {
            throw new Error("Une relation existe déjà entre ces utilisateurs");
        }

        // Créer la relation
        const relation = await this.relationRepository.create({
            type,
            statut: "en_attente",
            demandeur: { connect: { id: demandeurId } },
            receveur: { connect: { id: receveurId } }
        });

        return relation;
    }

    // Accepter une demande de relation
    async accepterRelation(relationId: number) {
        const relation = await this.relationRepository.accepterRelation(relationId);
        return relation;
    }

    // Refuser une demande de relation
    async refuserRelation(relationId: number) {
        const relation = await this.relationRepository.refuserRelation(relationId);
        return relation;
    }

    // Supprimer une relation
    async supprimerRelation(relationId: number) {
        await this.relationRepository.delete(relationId);
    }

    // Obtenir toutes les relations d'un utilisateur
    async getRelationsUtilisateur(utilisateurId: number) {
        return this.relationRepository.getRelationsByUserId(utilisateurId);
    }

    // Obtenir les amis acceptés
    async getAmis(utilisateurId: number) {
        const relations = await this.relationRepository.getAmisAcceptes(utilisateurId);
        
        // Formater les résultats pour avoir les infos de l'autre utilisateur
        return relations.map(relation => {
            const isDemandeur = relation.demandeurId === utilisateurId;
            return {
                id: relation.id,
                type: relation.type,
                createdAt: relation.createdAt,
                utilisateur: isDemandeur ? relation.receveur : relation.demandeur
            };
        });
    }

    // Obtenir les demandes en attente
    async getDemandesEnAttente(utilisateurId: number) {
        return this.relationRepository.getDemandesEnAttente(utilisateurId);
    }

    // Obtenir le statut de relation entre deux utilisateurs
    async getStatutRelation(utilisateurId1: number, utilisateurId2: number) {
        const relation = await this.relationRepository.getRelationBetweenUsers(utilisateurId1, utilisateurId2);
        
        if (!relation) {
            return { statut: "pas_de_relation" };
        }

        return {
            statut: relation.statut,
            type: relation.type,
            id: relation.id,
            estDemandeur: relation.demandeurId === utilisateurId1
        };
    }

    // Supprimer une relation entre deux utilisateurs
    async supprimerRelationEntreUtilisateurs(utilisateurId1: number, utilisateurId2: number) {
        await this.relationRepository.deleteRelationBetweenUsers(utilisateurId1, utilisateurId2);
    }
}