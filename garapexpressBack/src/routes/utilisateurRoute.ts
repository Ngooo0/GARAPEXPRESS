import {Router} from 'express';
import {utilisateurController} from '../conteneurs/utilisateurConteneur';

const router = Router();

router.post('/create', (req, res) => utilisateurController.createUser(req, res));

router.get('/', (req, res) => utilisateurController.getAllUsers(req, res));
router.patch('/livreurs/:id/disponibilite', (req, res) => utilisateurController.updateLivreurDisponibilite(req, res));

router.get('/:id', (req, res) => utilisateurController.getUserById(req, res));

router.put('/:id', (req, res) => utilisateurController.updateUser(req, res));

router.delete('/:id', (req, res) => utilisateurController.deleteUser(req, res));

router.post('/login', (req, res) => utilisateurController.seConnecter(req, res));

// Réinitialisation du mot de passe (par SMS)
router.post('/forgot-password', (req, res) => utilisateurController.reinitialiserMotDePasse(req, res));
router.post('/reset-password', (req, res) => utilisateurController.confirmerReinitialisationMotDePasse(req, res));

// Réinitialisation du mot de passe (par email)
router.post('/forgot-password-email', (req, res) => utilisateurController.reinitialiserMotDePasseParEmail(req, res));
router.post('/reset-password-email', (req, res) => utilisateurController.confirmerReinitialisationMotDePasseParEmail(req, res));

// Registration routes
router.post('/register/client', (req, res) => utilisateurController.registerClient(req, res));
router.post('/register/livreur', (req, res) => utilisateurController.registerLivreur(req, res));
router.post('/register/admin', (req, res) => utilisateurController.registerAdmin(req, res));

export default router;
