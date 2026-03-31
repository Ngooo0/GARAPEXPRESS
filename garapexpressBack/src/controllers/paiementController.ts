import { PaiementService } from "../services/paiementService";
import { PaiementValidator, PaiementUpdateValidator } from "../validators/paiementValidator";

export class PaiementController {
    constructor(private paiementService: PaiementService) {}

    async getAllPaiements(req: any, res: any) {
        try {
            const paiements = await this.paiementService.getAllPaiements();
            res.status(200).json(paiements);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getPaiementById(req: any, res: any) {
        try {
            const id = parseInt(req.params.id, 10);
            const paiement = await this.paiementService.getPaiementById(id);
            if (paiement) {
                res.status(200).json(paiement);
            } else {
                res.status(404).json({ error: 'Paiement not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async createPaiement(req: any, res: any) {
        try {
            const validatedData = PaiementValidator.parse(req.body);
            const newPaiement = await this.paiementService.createPaiement(validatedData);
            res.status(201).json({ success: true, message: 'Paiement created successfully', data: newPaiement });
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Error creating paiement' });
        }
    }

    async updatePaiement(req: any, res: any) {
        try {
            const id = parseInt(req.params.id, 10);
            const validatedData = PaiementUpdateValidator.parse(req.body);
            const updatedPaiement = await this.paiementService.updatePaiement(id, validatedData);
            res.status(200).json({ success: true, message: 'Paiement updated successfully', data: updatedPaiement });
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Error updating paiement' });
        }
    }

    async deletePaiement(req: any, res: any) {
        try {
            const id = parseInt(req.params.id, 10);
            await this.paiementService.deletePaiement(id);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Error deleting paiement' });
        }
    }
}
