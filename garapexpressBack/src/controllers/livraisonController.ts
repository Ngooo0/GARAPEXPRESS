import { LivraisonService } from "../services/livraisonService";
import { LivraisonValidator, LivraisonUpdateValidator } from "../validators/livraisonValidator";

export class LivraisonController {
    constructor(private livraisonService: LivraisonService) {}

    async getAllLivraisons(req: any, res: any) {
        try {
            const livraisons = await this.livraisonService.getAllLivraisons();
            res.status(200).json(livraisons);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getLivraisonById(req: any, res: any) {
        try {
            const id = parseInt(req.params.id, 10);
            const livraison = await this.livraisonService.getLivraisonById(id);
            if (livraison) {
                res.status(200).json(livraison);
            } else {
                res.status(404).json({ error: 'Livraison not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getLivraisonsByLivreur(req: any, res: any) {
        try {
            const livreurId = parseInt(req.params.livreurId, 10);
            const livraisons = await this.livraisonService.getLivraisonsByLivreur(livreurId);
            res.status(200).json(livraisons);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async createLivraison(req: any, res: any) {
        try {
            const validatedData = LivraisonValidator.parse(req.body);
            const newLivraison = await this.livraisonService.createLivraison(validatedData);
            res.status(201).json({
                success: true,
                message: 'Livraison created successfully',
                data: newLivraison,
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Error creating livraison' });
        }
    }

    async updateLivraison(req: any, res: any) {
        try {
            const id = parseInt(req.params.id, 10);
            const validatedData = LivraisonUpdateValidator.parse(req.body);
            const updatedLivraison = await this.livraisonService.updateLivraison(id, validatedData);
            res.status(200).json({
                success: true,
                message: 'Livraison updated successfully',
                data: updatedLivraison,
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Error updating livraison' });
        }
    }

    async deleteLivraison(req: any, res: any) {
        try {
            const id = parseInt(req.params.id, 10);
            await this.livraisonService.deleteLivraison(id);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Error deleting livraison' });
        }
    }
}
