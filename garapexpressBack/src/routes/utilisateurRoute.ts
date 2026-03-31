import {Router, Request, Response} from 'express';
import {utilisateurController} from '../conteneurs/utilisateurConteneur';

const router = Router();

router.post('/create', (req: Request, res: Response) => utilisateurController.createUser(req, res));

router.get('/', (req: Request, res: Response) => utilisateurController.getAllUsers(req, res));
router.patch('/livreurs/:id/disponibilite', (req: Request, res: Response) => utilisateurController.updateLivreurDisponibilite(req, res));

router.get('/:id', (req: Request, res: Response) => utilisateurController.getUserById(req, res));

router.put('/:id', (req: Request, res: Response) => utilisateurController.updateUser(req, res));

router.delete('/:id', (req: Request, res: Response) => utilisateurController.deleteUser(req, res));

router.post('/login', (req: Request, res: Response) => utilisateurController.seConnecter(req, res));

// Réinitialisation du mot de passe (par SMS)
router.post('/forgot-password', (req: Request, res: Response) => utilisateurController.reinitialiserMotDePasse(req, res));
router.post('/reset-password', (req: Request, res: Response) => utilisateurController.confirmerReinitialisationMotDePasse(req, res));

// Réinitialisation du mot de passe (par email)
router.post('/forgot-password-email', (req: Request, res: Response) => utilisateurController.reinitialiserMotDePasseParEmail(req, res));
router.post('/reset-password-email', (req: Request, res: Response) => utilisateurController.confirmerReinitialisationMotDePasseParEmail(req, res));

// Registration routes
router.post('/register/client', (req: Request, res: Response) => utilisateurController.registerClient(req, res));
router.post('/register/livreur', (req: Request, res: Response) => utilisateurController.registerLivreur(req, res));
router.post('/register/admin', (req: Request, res: Response) => utilisateurController.registerAdmin(req, res));

export default router;
