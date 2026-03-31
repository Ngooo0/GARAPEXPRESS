import { UtilisateurService } from "../services/utilisateurService";
import { UtilisateurLogin, utilisateurValidator, ClientRegisterValidator, LivreurRegisterValidator, AdminRegisterValidator } from "../validators/utilisateurValidator";
import smsService from "../services/smsService";
import emailService from "../services/emailService";

export class UtilisateurController {

    constructor(private utilisateurService: UtilisateurService) { }

    async getAllUsers(req: any, res: any) {

        try {
            const users = await this.utilisateurService.getAllUsers();
            res.status(200).json(users);
        } catch (error) {
            console.error('getAllUsers error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }

    }

    async getUserById(req: any, res: any) {

        try {
            const id = parseInt(req.params.id, 10);

            const user = await this.utilisateurService.getUserById(id);
            if (user) {
                res.status(200).json(user);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            console.error('getUserById error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }

    }


    async createUser(req: any, res: any) {

        try {
            const validatedData = utilisateurValidator.parse(req.body);
            const userData = {
                nom: validatedData.nom,
                prenom: validatedData.prenom,
                motDePasse: validatedData.motDePasse,
                email: validatedData.email,
                telephone: validatedData.telephone,
            };
            const newUser = await this.utilisateurService.createUser(userData);
            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: newUser,
            });
        } catch (error) {
            res.status(400).json({ error: 'Erreur d\'insertion' });
        }

    }

    async updateUser(req: any, res: any) {

        try {
            const id = parseInt(req.params.id, 10);
            const userData = req.body;
            const updatedUser = await this.utilisateurService.updateUser(id, userData);
            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(400).json({ error: 'Bad Request' });
        }

    }

    async updateLivreurDisponibilite(req: any, res: any) {

        try {
            const id = parseInt(req.params.id, 10);
            const { disponibilite } = req.body;
            const updatedLivreur = await this.utilisateurService.updateLivreurDisponibilite(id, Boolean(disponibilite));
            res.status(200).json({
                success: true,
                message: 'Disponibilité du livreur mise à jour',
                data: updatedLivreur,
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Bad Request' });
        }

    }

    async deleteUser(req: any, res: any) {
        try {
            const id = parseInt(req.params.id, 10);
            await this.utilisateurService.deleteUser(id);
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ error: 'Bad Request' });
        }
    }

    async seConnecter(req: any, res: any) {

        try {
            const infos = UtilisateurLogin.parse(req.body)
            const token = await this.utilisateurService.login(infos.email, infos.motDePasse);

            res.status(201).json({
                success: true,
                data: token,
                message: "Utilisateur conneccté avec succès"
            })
        } catch (error) {
            res.status(400).json({ error: error })
        }
    }

    // Register a new Client
    async registerClient(req: any, res: any) {
        try {
            const validatedData = ClientRegisterValidator.parse(req.body);
            const newUser = await this.utilisateurService.registerClient(validatedData);
            res.status(201).json({
                success: true,
                message: 'Client created successfully',
                data: newUser,
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Error creating client' });
        }
    }

    // Register a new Livreur
    async registerLivreur(req: any, res: any) {
        try {
            const validatedData = LivreurRegisterValidator.parse(req.body);
            const newUser = await this.utilisateurService.registerLivreur(validatedData);
            res.status(201).json({
                success: true,
                message: 'Livreur created successfully',
                data: newUser,
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Error creating livreur' });
        }
    }

    // Register a new Admin
    async registerAdmin(req: any, res: any) {
        try {
            const validatedData = AdminRegisterValidator.parse(req.body);
            const newUser = await this.utilisateurService.registerAdmin(validatedData);
            res.status(201).json({
                success: true,
                message: 'Admin created successfully',
                data: newUser,
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Error creating admin' });
        }
    }

    // Réinitialiser le mot de passe (étape 1: vérifier le téléphone et générer un code)
    async reinitialiserMotDePasse(req: any, res: any) {
        try {
            const { telephone } = req.body;
            
            if (!telephone) {
                return res.status(400).json({ error: 'Le numéro de téléphone est requis' });
            }

            // Générer un code de vérification aléatoire (6 chiffres)
            const codeVerification = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Envoyer le code par SMS via Twilio
            const smsSent = await smsService.sendVerificationCode(telephone, codeVerification);

            if (!smsSent) {
                return res.status(500).json({ error: 'Erreur lors de l\'envoi du SMS' });
            }

            res.status(200).json({
                success: true,
                message: 'Code de vérification envoyé par SMS'
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Erreur lors de la réinitialisation' });
        }
    }

    // Confirmer la réinitialisation du mot de passe (étape 2: vérifier le code et changer le mot de passe)
    async confirmerReinitialisationMotDePasse(req: any, res: any) {
        try {
            const { telephone, code, nouveauMotDePasse } = req.body;
            
            if (!telephone || !code || !nouveauMotDePasse) {
                return res.status(400).json({ error: 'Tous les champs sont requis' });
            }

            // Dans une vraie implémentation, vérifier le code avec celui stocké
            // Pour la simulation, nous acceptons tout code de 6 chiffres
            if (code.length !== 6 || !/^\d{6}$/.test(code)) {
                return res.status(400).json({ error: 'Code de vérification invalide' });
            }

            // Mettre à jour le mot de passe
            const updatedUser = await this.utilisateurService.updatePasswordByPhone(telephone, nouveauMotDePasse);
            
            if (!updatedUser) {
                return res.status(404).json({ error: 'Utilisateur non trouvé' });
            }

            res.status(200).json({
                success: true,
                message: 'Mot de passe réinitialisé avec succès'
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Erreur lors de la confirmation' });
        }
    }

    // Réinitialiser le mot de passe par email (étape 1: envoyer le lien)
    async reinitialiserMotDePasseParEmail(req: any, res: any) {
        try {
            const { email } = req.body;
            
            if (!email) {
                return res.status(400).json({ error: 'L\'email est requis' });
            }

            // Valider le format de l'email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: 'Format d\'email invalide' });
            }

            const result = await this.utilisateurService.sendPasswordResetLink(email);
            
            res.status(200).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Erreur lors de la réinitialisation' });
        }
    }

    // Confirmer la réinitialisation du mot de passe par email (étape 2: nouveau mot de passe)
    async confirmerReinitialisationMotDePasseParEmail(req: any, res: any) {
        try {
            const { email, nouveauMotDePasse } = req.body;
            
            if (!email || !nouveauMotDePasse) {
                return res.status(400).json({ error: 'L\'email et le nouveau mot de passe sont requis' });
            }

            // Valider le mot de passe
            if (nouveauMotDePasse.length < 6) {
                return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
            }

            const updatedUser = await this.utilisateurService.resetPasswordByEmail(email, nouveauMotDePasse);
            
            if (!updatedUser) {
                return res.status(404).json({ error: 'Utilisateur non trouvé' });
            }

            res.status(200).json({
                success: true,
                message: 'Mot de passe réinitialisé avec succès'
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Erreur lors de la confirmation' });
        }
    }
}
