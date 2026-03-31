import { OrdonnanceService } from "../services/ordonnanceService";
import { OrdonnanceValidator, OrdonnanceUpdateValidator } from "../validators/ordonnanceValidator";

export class OrdonnanceController {
    constructor(private ordonnanceService: OrdonnanceService) {}

    async getAllOrdonnances(req: any, res: any) {
        try {
            const ordonnances = await this.ordonnanceService.getAllOrdonnances();
            res.status(200).json(ordonnances);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getOrdonnanceById(req: any, res: any) {
        try {
            const id = parseInt(req.params.id, 10);
            const ordonnance = await this.ordonnanceService.getOrdonnanceById(id);
            if (ordonnance) {
                res.status(200).json(ordonnance);
            } else {
                res.status(404).json({ error: 'Ordonnance not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async createOrdonnance(req: any, res: any) {
        try {
            const validatedData = OrdonnanceValidator.parse(req.body);
            const newOrdonnance = await this.ordonnanceService.createOrdonnance(validatedData);
            res.status(201).json({ success: true, message: 'Ordonnance created successfully', data: newOrdonnance });
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Error creating ordonnance' });
        }
    }

    async updateOrdonnance(req: any, res: any) {
        try {
            const id = parseInt(req.params.id, 10);
            const validatedData = OrdonnanceUpdateValidator.parse(req.body);
            const updatedOrdonnance = await this.ordonnanceService.updateOrdonnance(id, validatedData);
            res.status(200).json({ success: true, message: 'Ordonnance updated successfully', data: updatedOrdonnance });
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Error updating ordonnance' });
        }
    }

    async deleteOrdonnance(req: any, res: any) {
        try {
            const id = parseInt(req.params.id, 10);
            await this.ordonnanceService.deleteOrdonnance(id);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Error deleting ordonnance' });
        }
    }
}
