import { Router } from 'express';
import { CommandeController } from '../controllers/commandeController';
import { CommandeService } from '../services/commandeService';
import { CommandeRepository } from '../repositories/commandeRepository';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({} as any);
const commandeRepository = new CommandeRepository(prisma);
const commandeService = new CommandeService(commandeRepository);
const commandeController = new CommandeController(commandeService);

const router = Router();

router.get('/', (req, res) => commandeController.getAllCommandes(req, res));
router.get('/statut/:statut', (req, res) => commandeController.getCommandesByStatut(req, res));
router.get('/client/:clientId', (req, res) => commandeController.getCommandesByClient(req, res));
router.get('/pharmacie/:pharmacieId', (req, res) => commandeController.getCommandesByPharmacie(req, res));
router.get('/:id', (req, res) => commandeController.getCommandeById(req, res));
router.post('/', (req, res) => commandeController.createCommande(req, res));
router.put('/:id', (req, res) => commandeController.updateCommande(req, res));
router.patch('/:id/statut', (req, res) => commandeController.updateStatut(req, res));
router.delete('/:id', (req, res) => commandeController.deleteCommande(req, res));

export default router;
