import { RelationUtilisateurService } from "../services/relationUtilisateurService";

export class RelationUtilisateurController {
    constructor(private relationService: RelationUtilisateurService) { }

    // Envoyer une demande de relation
    async envoyerDemande(req: any, res: any) {
        try {
            const demandeurId = req.user.id; // ID de l'utilisateur connecté
            const { receveurId, type } = req.body;

            if (!receveurId) {
                return res.status(400).json({ error: "L'ID du receveur est requis" });
            }

            const relation = await this.relationService.envoyerDemandeRelation(demandeurId, receveurId, type);
            
            res.status(201).json({
                success: true,
                message: "Demande de relation envoyée",
                data: relation
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Accepter une demande de relation
    async accepterRelation(req: any, res: any) {
        try {
            const { relationId } = req.params;
            
            const relation = await this.relationService.accepterRelation(parseInt(relationId));
            
            res.status(200).json({
                success: true,
                message: "Relation acceptée",
                data: relation
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Refuser une demande de relation
    async refuserRelation(req: any, res: any) {
        try {
            const { relationId } = req.params;
            
            const relation = await this.relationService.refuserRelation(parseInt(relationId));
            
            res.status(200).json({
                success: true,
                message: "Relation refusée",
                data: relation
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Supprimer une relation
    async supprimerRelation(req: any, res: any) {
        try {
            const { relationId } = req.params;
            
            await this.relationService.supprimerRelation(parseInt(relationId));
            
            res.status(200).json({
                success: true,
                message: "Relation supprimée"
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Obtenir toutes les relations d'un utilisateur
    async getRelations(req: any, res: any) {
        try {
            const utilisateurId = req.user.id;
            
            const relations = await this.relationService.getRelationsUtilisateur(utilisateurId);
            
            res.status(200).json({
                success: true,
                data: relations
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Obtenir les amis acceptés
    async getAmis(req: any, res: any) {
        try {
            const utilisateurId = req.user.id;
            
            const amis = await this.relationService.getAmis(utilisateurId);
            
            res.status(200).json({
                success: true,
                data: amis
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Obtenir les demandes en attente
    async getDemandesEnAttente(req: any, res: any) {
        try {
            const utilisateurId = req.user.id;
            
            const demandes = await this.relationService.getDemandesEnAttente(utilisateurId);
            
            res.status(200).json({
                success: true,
                data: demandes
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Obtenir le statut de relation entre deux utilisateurs
    async getStatutRelation(req: any, res: any) {
        try {
            const utilisateurId1 = req.user.idUtilisateur;
            const { utilisateurId2 } = req.params;
            
            const statut = await this.relationService.getStatutRelation(utilisateurId1, parseInt(utilisateurId2));
            
            res.status(200).json({
                success: true,
                data: statut
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}