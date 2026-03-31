import { Router } from 'express';
import { PaiementController } from '../controllers/paiementController';
import { PaiementService } from '../services/paiementService';
import { PaiementRepository } from '../repositories/paiementRepository';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({} as any);
const paiementRepository = new PaiementRepository(prisma);
const paiementService = new PaiementService(paiementRepository);
const paiementController = new PaiementController(paiementService);

const router = Router();

router.get('/', (req, res) => paiementController.getAllPaiements(req, res));
router.get('/:id', (req, res) => paiementController.getPaiementById(req, res));
router.post('/', (req, res) => paiementController.createPaiement(req, res));
router.put('/:id', (req, res) => paiementController.updatePaiement(req, res));
router.delete('/:id', (req, res) => paiementController.deletePaiement(req, res));

export default router;
