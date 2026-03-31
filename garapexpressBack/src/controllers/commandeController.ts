import { CommandeService } from "../services/commandeService";
import { CommandeValidator, CommandeUpdateValidator } from "../validators/commandeValidator";

export class CommandeController {
    constructor(private commandeService: CommandeService) {}

    async getAllCommandes(req: any, res: any) {
        try {
            const commandes = await this.commandeService.getAllCommandes();
            res.status(200).json(commandes);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getCommandeById(req: any, res: any) {
        try {
            const id = parseInt(req.params.id, 10);
            const commande = await this.commandeService.getCommandeById(id);
            if (commande) {
                res.status(200).json(commande);
            } else {
                res.status(404).json({ error: 'Commande not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getCommandesByClient(req: any, res: any) {
        try {
            const clientId = parseInt(req.params.clientId, 10);
            const commandes = await this.commandeService.getCommandesByClient(clientId);
            res.status(200).json(commandes);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getCommandesByPharmacie(req: any, res: any) {
        try {
            const pharmacieId = parseInt(req.params.pharmacieId, 10);
            const commandes = await this.commandeService.getCommandesByPharmacie(pharmacieId);
            res.status(200).json(commandes);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getCommandesByStatut(req: any, res: any) {
        try {
            const { statut } = req.params;
            const commandes = await this.commandeService.getCommandesByStatut(statut);
            res.status(200).json(commandes);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async createCommande(req: any, res: any) {
        try {
            const validatedData = CommandeValidator.parse(req.body);
            const newCommande = await this.commandeService.createCommande(validatedData);
            res.status(201).json({
                success: true,
                message: 'Commande created successfully',
                data: newCommande,
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Error creating commande' });
        }
    }

    async updateCommande(req: any, res: any) {
        try {
            const id = parseInt(req.params.id, 10);
            const validatedData = CommandeUpdateValidator.parse(req.body);
            const updatedCommande = await this.commandeService.updateCommande(id, validatedData);
            res.status(200).json({
                success: true,
                message: 'Commande updated successfully',
                data: updatedCommande,
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Error updating commande' });
        }
    }

    async updateStatut(req: any, res: any) {
        try {
            const id = parseInt(req.params.id, 10);
            const { statut } = req.body;
            if (!statut) {
                return res.status(400).json({ error: 'Statut is required' });
            }
            const updatedCommande = await this.commandeService.updateStatut(id, statut);
            res.status(200).json({
                success: true,
                message: 'Statut updated successfully',
                data: updatedCommande,
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Error updating statut' });
        }
    }

    async deleteCommande(req: any, res: any) {
        try {
            const id = parseInt(req.params.id, 10);
            await this.commandeService.deleteCommande(id);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Error deleting commande' });
        }
    }
}
