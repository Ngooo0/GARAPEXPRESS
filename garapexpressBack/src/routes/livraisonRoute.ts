import { Router } from 'express';
import { LivraisonController } from '../controllers/livraisonController';
import { LivraisonService } from '../services/livraisonService';
import { LivraisonRepository } from '../repositories/livraisonRepository';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({} as any);
const livraisonRepository = new LivraisonRepository(prisma);
const livraisonService = new LivraisonService(livraisonRepository);
const livraisonController = new LivraisonController(livraisonService);

const router = Router();

router.get('/', (req, res) => livraisonController.getAllLivraisons(req, res));
router.get('/livreur/:livreurId', (req, res) => livraisonController.getLivraisonsByLivreur(req, res));
router.get('/:id', (req, res) => livraisonController.getLivraisonById(req, res));
router.post('/', (req, res) => livraisonController.createLivraison(req, res));
router.put('/:id', (req, res) => livraisonController.updateLivraison(req, res));
router.delete('/:id', (req, res) => livraisonController.deleteLivraison(req, res));

export default router;
