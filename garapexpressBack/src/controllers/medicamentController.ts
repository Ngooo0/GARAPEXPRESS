import { MedicamentService } from "../services/medicamentService";
import { MedicamentValidator, MedicamentUpdateValidator } from "../validators/medicamentValidator";

export class MedicamentController {
    constructor(private medicamentService: MedicamentService) {}

    async getAllMedicaments(req: any, res: any) {
        try {
            const medicaments = await this.medicamentService.getAllMedicaments();
            res.status(200).json(medicaments);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getMedicamentById(req: any, res: any) {
        try {
            const id = parseInt(req.params.id, 10);
            const medicament = await this.medicamentService.getMedicamentById(id);
            if (medicament) {
                res.status(200).json(medicament);
            } else {
                res.status(404).json({ error: 'Medicament not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async searchMedicaments(req: any, res: any) {
        try {
            const { q } = req.query;
            if (!q) {
                return res.status(400).json({ error: 'Search query required' });
            }
            const medicaments = await this.medicamentService.searchMedicaments(q as string);
            res.status(200).json(medicaments);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async createMedicament(req: any, res: any) {
        try {
            const validatedData = MedicamentValidator.parse(req.body);
            const newMedicament = await this.medicamentService.createMedicament(validatedData);
            res.status(201).json({
                success: true,
                message: 'Medicament created successfully',
                data: newMedicament,
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Error creating medicament' });
        }
    }

    async updateMedicament(req: any, res: any) {
        try {
            const id = parseInt(req.params.id, 10);
            const validatedData = MedicamentUpdateValidator.parse(req.body);
            const updatedMedicament = await this.medicamentService.updateMedicament(id, validatedData);
            res.status(200).json({
                success: true,
                message: 'Medicament updated successfully',
                data: updatedMedicament,
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Error updating medicament' });
        }
    }

    async deleteMedicament(req: any, res: any) {
        try {
            const id = parseInt(req.params.id, 10);
            await this.medicamentService.deleteMedicament(id);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Error deleting medicament' });
        }
    }
}
