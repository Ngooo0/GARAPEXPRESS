import {Router} from 'express';
import { relationUtilisateurController } from '../conteneurs/relationUtilisateurConteneur';
import { authenticate } from '../middleware/auth';

const router = Router();

//Toutes les routes nécessitent une authentification
router.use(authenticate);

// Envoyer une demande de relation
router.post('/demande', (req, res) => relationUtilisateurController.envoyerDemande(req, res));

// Accepter une demande de relation
router.post('/:relationId/accepter', (req, res) => relationUtilisateurController.accepterRelation(req, res));

// Refuser une demande de relation
router.post('/:relationId/refuser', (req, res) => relationUtilisateurController.refuserRelation(req, res));

// Supprimer une relation
router.delete('/:relationId', (req, res) => relationUtilisateurController.supprimerRelation(req, res));

// Obtenir toutes les relations de l'utilisateur connecté
router.get('/', (req, res) => relationUtilisateurController.getRelations(req, res));

// Obtenir les amis acceptés
router.get('/amis', (req, res) => relationUtilisateurController.getAmis(req, res));

// Obtenir les demandes en attente
router.get('/demandes-en-attente', (req, res) => relationUtilisateurController.getDemandesEnAttente(req, res));

// Obtenir le statut de relation entre deux utilisateurs
router.get('/statut/:utilisateurId2', (req, res) => relationUtilisateurController.getStatutRelation(req, res));

export default router;