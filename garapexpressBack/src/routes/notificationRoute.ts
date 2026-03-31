import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { NotificationService } from '../services/notificationService';
import { NotificationRepository } from '../repositories/notificationRepository';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({} as any);
const notificationRepository = new NotificationRepository(prisma);
const notificationService = new NotificationService(notificationRepository);
const notificationController = new NotificationController(notificationService);

const router = Router();

router.get('/', (req, res) => notificationController.getAllNotifications(req, res));
router.get('/utilisateur/:utilisateurId', (req, res) => notificationController.getNotificationsByUtilisateur(req, res));
router.get('/non-lues/:utilisateurId', (req, res) => notificationController.getNonLues(req, res));
router.get('/:id', (req, res) => notificationController.getNotificationById(req, res));
router.post('/', (req, res) => notificationController.createNotification(req, res));
router.patch('/:id/read', (req, res) => notificationController.markAsRead(req, res));
router.delete('/:id', (req, res) => notificationController.deleteNotification(req, res));

export default router;
