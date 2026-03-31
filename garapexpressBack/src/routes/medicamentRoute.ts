import { Router } from 'express';
import { MedicamentController } from '../controllers/medicamentController';
import { MedicamentService } from '../services/medicamentService';
import { MedicamentRepository } from '../repositories/medicamentRepository';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({} as any);
const medicamentRepository = new MedicamentRepository(prisma);
const medicamentService = new MedicamentService(medicamentRepository);
const medicamentController = new MedicamentController(medicamentService);

const router = Router();

router.get('/', (req, res) => medicamentController.getAllMedicaments(req, res));
router.get('/search', (req, res) => medicamentController.searchMedicaments(req, res));
router.get('/:id', (req, res) => medicamentController.getMedicamentById(req, res));
router.post('/', (req, res) => medicamentController.createMedicament(req, res));
router.put('/:id', (req, res) => medicamentController.updateMedicament(req, res));
router.delete('/:id', (req, res) => medicamentController.deleteMedicament(req, res));

export default router;
