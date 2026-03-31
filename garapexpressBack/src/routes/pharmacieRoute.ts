import { Router } from 'express';
import { PharmacieController } from '../controllers/pharmacieController';
import { PharmacieService } from '../services/pharmacieService';
import { PharmacieRepository } from '../repositories/pharmacieRepository';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({} as any);
const pharmacieRepository = new PharmacieRepository(prisma);
const pharmacieService = new PharmacieService(pharmacieRepository);
const pharmacieController = new PharmacieController(pharmacieService);

const router = Router();

router.get('/', (req, res) => pharmacieController.getAllPharmacies(req, res));
router.get('/garde', (req, res) => pharmacieController.getPharmaciesDeGarde(req, res));
router.get('/:id', (req, res) => pharmacieController.getPharmacieById(req, res));
router.post('/', (req, res) => pharmacieController.createPharmacie(req, res));
router.post('/register', (req, res) => pharmacieController.registerPharmacie(req, res));
router.post('/login', (req, res) => pharmacieController.loginPharmacie(req, res));
router.put('/:id', (req, res) => pharmacieController.updatePharmacie(req, res));
router.delete('/:id', (req, res) => pharmacieController.deletePharmacie(req, res));

export default router;
