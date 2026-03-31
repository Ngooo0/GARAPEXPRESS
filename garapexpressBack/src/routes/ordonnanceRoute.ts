import { Router } from 'express';
import { OrdonnanceController } from '../controllers/ordonnanceController';
import { OrdonnanceService } from '../services/ordonnanceService';
import { OrdonnanceRepository } from '../repositories/ordonnanceRepository';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({} as any);
const ordonnanceRepository = new OrdonnanceRepository(prisma);
const ordonnanceService = new OrdonnanceService(ordonnanceRepository);
const ordonnanceController = new OrdonnanceController(ordonnanceService);

const router = Router();

router.get('/', (req, res) => ordonnanceController.getAllOrdonnances(req, res));
router.get('/:id', (req, res) => ordonnanceController.getOrdonnanceById(req, res));
router.post('/', (req, res) => ordonnanceController.createOrdonnance(req, res));
router.put('/:id', (req, res) => ordonnanceController.updateOrdonnance(req, res));
router.delete('/:id', (req, res) => ordonnanceController.deleteOrdonnance(req, res));

export default router;
