import { PharmacieService } from "../services/pharmacieService";
import { PharmacieValidator, PharmacieUpdateValidator } from "../validators/pharmacieValidator";
import { PharmacieRegisterValidator, PharmacieLoginValidator } from "../validators/utilisateurValidator";

export class PharmacieController {
    constructor(private pharmacieService: PharmacieService) {}

    async getAllPharmacies(req: any, res: any) {
        try {
            const pharmacies = await this.pharmacieService.getAllPharmacies();
            res.status(200).json(pharmacies);
        } catch (error) {
            console.error('getAllPharmacies error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getPharmacieById(req: any, res: any) {
        try {
            const id = parseInt(req.params.id, 10);
            const pharmacie = await this.pharmacieService.getPharmacieById(id);
            if (pharmacie) {
                res.status(200).json(pharmacie);
            } else {
                res.status(404).json({ error: 'Pharmacie not found' });
            }
        } catch (error) {
            console.error('getPharmacieById error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getPharmaciesDeGarde(req: any, res: any) {
        try {
            const pharmacies = await this.pharmacieService.getPharmaciesDeGarde();
            res.status(200).json(pharmacies);
        } catch (error) {
            console.error('getPharmaciesDeGarde error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async createPharmacie(req: any, res: any) {
        try {
            const validatedData = PharmacieValidator.parse(req.body);
            const newPharmacie = await this.pharmacieService.createPharmacie(validatedData);
            res.status(201).json({
                success: true,
                message: 'Pharmacie created successfully',
                data: newPharmacie,
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Error creating pharmacie' });
        }
    }

    async registerPharmacie(req: any, res: any) {
        try {
            const validatedData = PharmacieRegisterValidator.parse(req.body);
            const newPharmacie = await this.pharmacieService.registerPharmacie(validatedData);
            res.status(201).json({
                success: true,
                message: 'Pharmacie created successfully',
                data: newPharmacie,
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Error registering pharmacie' });
        }
    }

    async loginPharmacie(req: any, res: any) {
        try {
            const validatedData = PharmacieLoginValidator.parse(req.body);
            const token = await this.pharmacieService.loginPharmacie(validatedData.email, validatedData.motDePasse);
            res.status(200).json({
                success: true,
                message: 'Connexion réussie',
                data: token,
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Error logging in' });
        }
    }

    async updatePharmacie(req: any, res: any) {
        try {
            const id = parseInt(req.params.id, 10);
            const validatedData = PharmacieUpdateValidator.parse(req.body);
            const updatedPharmacie = await this.pharmacieService.updatePharmacie(id, validatedData);
            res.status(200).json({
                success: true,
                message: 'Pharmacie updated successfully',
                data: updatedPharmacie,
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Error updating pharmacie' });
        }
    }

    async deletePharmacie(req: any, res: any) {
        try {
            const id = parseInt(req.params.id, 10);
            await this.pharmacieService.deletePharmacie(id);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Error deleting pharmacie' });
        }
    }
}
