# 📋 PROJET GARAPEXPRESS - PLAN TRELLO COMPLET

## Structure des Listes Trello

---

# 📌 LISTE 1: BACKLOG (À FAIRE)

## 1.1 Infrastructure & Configuration
- [ ] Configurer DATABASE_URL sur Render.com
- [ ] Créer la base de données MySQL sur PlanetScale
- [ ] Exécuter les migrations Prisma en production
- [ ] Configurer les variables d'environnement sur Render
- [ ] Configurer SSL/HTTPS sur le domaine
- [ ] Mettre en place le monitoring (logs, alerts)
- [ ] Configurer les backups automatiques de la DB

## 1.2 Authentification & Sécurité
- [ ] Implémenter la vérification d'email
- [ ] Implémenter la vérification SMS (Twilio)
- [ ] Ajouter "Mot de passe oublié" complet
- [ ] Implémenter 2FA (double authentification)
- [ ] Ajouter des tokens de rafraîchissement (refresh token)
- [ ] Implémenter la déconnexion globale
- [ ] Ajouter la limite de tentatives de connexion
- [ ] Chiffrer les mots de passe (bcrypt)
- [ ] Ajouter la validation d'email unique

## 1.3 Gestion des Utilisateurs
- [ ] API création utilisateur (client)
- [ ] API création livreur avec véhicule
- [ ] API création administrateur
- [ ] API mise à jour profil utilisateur
- [ ] API suppression utilisateur (avec cascade)
- [ ] API liste utilisateurs par rôle
- [ ] API recherche utilisateurs
- [ ] Gestion des rôles (client, livreur, admin)
- [ ] Mise à jour disponibilité livreur

## 1.4 Gestion des Pharmacies
- [ ] API inscription pharmacie
- [ ] API connexion pharmacie
- [ ] API liste pharmacies
- [ ] API détail pharmacie
- [ ] API pharmacies de garde
- [ ] API pharmacies à proximité (géolocalisation)
- [ ] API mise à jour pharmacie
- [ ] API suppression pharmacie
- [ ] Gestion des horaires d'ouverture
- [ ] Gestion du numéro d'agrément

## 1.5 Gestion des Médicaments
- [ ] API création médicament
- [ ] API liste médicaments
- [ ] API recherche médicament par nom
- [ ] API recherche par catégorie
- [ ] API recherche par DCI
- [ ] API mise à jour médicament
- [ ] API suppression médicament
- [ ] Gestion du stock
- [ ] Gestion des médicaments sur ordonnance
- [ ] Alerte stock faible

## 1.6 Catalogue Pharmacie
- [ ] API ajouter medicament au catalogue
- [ ] API liste catalogue par pharmacie
- [ ] API mettre à jour prix
- [ ] API mettre à jour stock
- [ ] API disponibilité medicament
- [ ] API recherche dans catalogue
- [ ] Filtre par prix
- [ ] Filtre par disponibilité

## 1.7 Gestion des Commandes
- [ ] API créer commande
- [ ] API liste commandes client
- [ ] API liste commandes pharmacie
- [ ] API détail commande
- [ ] API mise à jour statut commande
- [ ] API annuler commande
- [ ] Workflow statut: en_attente → en_preparation → en_livraison → livree
- [ ] Calcul montant total automatique
- [ ] Historique des commandes

## 1.8 Gestion des Livraisons
- [ ] API créer livraison
- [ ] API liste livraisons livreur
- [ ] API détail livraison
- [ ] API mise à jour statut livraison
- [ ] API assigner livreur
- [ ] API calculer frais livraison
- [ ] API tracer livraison (géolocalisation)
- [ ] Calcul temps estimé
- [ ] Notification changement statut
- [ ] Gestion des livraisons en cours

## 1.9 Gestion des Paiements
- [ ] Intégrer Stripe API
- [ ] Paiement en ligne
- [ ] Paiement à la livraison
- [ ] API vérifier paiement
- [ ] Générer reçu de paiement
- [ ] API remboursement
- [ ] Gestion des échecs de paiement
- [ ] Historique des transactions

## 1.10 Ordonnances
- [ ] API upload ordonnance (image/PDF)
- [ ] API validation ordonnance
- [ ] API liste ordonnances par commande
- [ ] API supprimer ordonnance
- [ ] Détection automatique expiration
- [ ] Notification renouvellement
- [ ] OCR pour lecture automatique (optionnel)

## 1.11 Notifications
- [ ] API créer notification
- [ ] API liste notifications utilisateur
- [ ] API marquer comme lu
- [ ] API supprimer notification
- [ ] Notifications push (Firebase)
- [ ] Notifications SMS
- [ ] Notifications email
- [ ] Préférences de notification

## 1.12 Statistiques & Analytics
- [ ] API stats globales admin
- [ ] API stats pharmacies
- [ ] API stats livreurs
- [ ] API revenue par période
- [ ] API commandes par statut
- [ ] API croissance utilisateurs
- [ ] Dashboard analytics admin

---

# 📌 LISTE 2: MOBILE - CLIENT

## 2.1 Onboarding & Auth
- [ ] Écran splash screen
- [ ] Écran onboarding (3 écrans)
- [ ] Écran sélection de rôle
- [ ] Écran login utilisateur
- [ ] Écran inscription client
- [ ] Écran mot de passe oublié
- [ ] Validation téléphone
- [ ] Navigation après connexion

## 2.2 Recherche & Découverte
- [ ] Écran accueil client
- [ ] Barre de recherche médicaments
- [ ] Liste pharmacies à proximité
- [ ] Filtres (distance, garde, note)
- [ ] Carte des pharmacies
- [ ] Détail pharmacie
- [ ] Liste médicaments pharmacie
- [ ] Recherche avec filtres avancés

## 2.3 Panier & Commande
- [ ] Ajout au panier
- [ ] Gestion quantité panier
- [ ] Suppression du panier
- [ ] Écran panier
- [ ] Écran checkout
- [ ] Validation commande
- [ ] Upload ordonnance (si besoin)
- [ ] Choix paiement (en ligne/livraison)
- [ ] Confirmation commande

## 2.4 Suivi Commande
- [ ] Liste commandes client
- [ ] Détail commande
- [ ] Timeline suivi commande
- [ ] Carte suivi livreur
- [ ] Notifications temps réel
- [ ] Estimation livraison
- [ ] Annuler commande (si possible)

## 2.5 Prescription
- [ ] Écran scan ordonnance (OCR)
- [ ] Upload manuel ordonnance
- [ ] Liste ordonnances
- [ ] Suivi validation ordonnance
- [ ] Notifications réponse pharmacie

## 2.6 Profil Client
- [ ] Écran profil
- [ ] Modifier informations personnelles
- [ ] Modifier adresse
- [ ] Modifier téléphone
- [ ] Historique commandes
- [ ] Favoris pharmacies
- [ ] Paramètres notifications
- [ ] Déconnexion

---

# 📌 LISTE 3: MOBILE - PHARMACIE

## 3.1 Authentification
- [ ] Écran login pharmacie
- [ ] Inscription nouvelle pharmacie
- [ ] Validation numéro agrément
- [ ] Session sécurisée

## 3.2 Dashboard Pharmacie
- [ ] Vue d'ensemble commandes
- [ ] Statistiques du jour
- [ ] Revenus du jour
- [ ] Commandes en attente
- [ ] Alertes stock faible
- [ ] Notifications récentes

## 3.3 Gestion Commandes
- [ ] Liste commandes entrantes
- [ ] Détail commande
- [ ] Accepter commande
- [ ] Refuser commande
- [ ] Mettre en préparation
- [ ] Marquer prête
- [ ] Suivi livraison

## 3.4 Gestion Catalogue
- [ ] Liste catalogue
- [ ] Ajouter medicament
- [ ] Modifier prix
- [ ] Mettre à jour stock
- [ ] Rendre disponible/indisponible
- [ ] Recherche medicament

## 3.5 Gestion Inventaire
- [ ] Vue inventaire complet
- [ ] Alertes stock faible
- [ ] Historique mouvements
- [ ] Export inventaire
- [ ] Import medicaments (CSV)

## 3.6 Profil Pharmacie
- [ ] Informations pharmacie
- [ ] Modifier horaires
- [ ] Gérer garde
- [ ] Statistiques détaillées
- [ ] Gestion des employés (optionnel)

---

# 📌 LISTE 4: MOBILE - LIVREUR

## 4.1 Authentification
- [ ] Écran login livreur
- [ ] Inscription livreur
- [ ] Informations véhicule
- [ ] Validation immatriculation

## 4.2 Dashboard Livreur
- [ ] Statut en ligne/hors ligne
- [ ] Course en cours
- [ ] Revenus aujourd'hui
- [ ] Commandes disponibles à proximité

## 4.3 Courses Disponibles
- [ ] Liste commandes disponibles
- [ ] Filtre par zone
- [ ] Distance estimée
- [ ] Frais de livraison
- [ ] Accepter course
- [ ] Détail avant acceptation

## 4.4 Course en Cours
- [ ] Détails livraison
- [ ] Itinéraire vers pharmacie
- [ ] Navigation GPS
- [ ] Marquer retiré en pharmacie
- [ ] Itinéraire vers client
- [ ] Marquer livré
- [ ] Scanner code confirmation

## 4.5 Historique & Stats
- [ ] Historique livraisons
- [ ] Revenus par période
- [ ] Note moyenne
- [ ] Classement (optionnel)
- [ ] Détails gains

## 4.6 Profil Livreur
- [ ] Informations personnelles
- [ ] Modifier véhicule
- [ ] Disponibilité
- [ ] Historique évaluations
- [ ] Support

---

# 📌 LISTE 5: MOBILE - ADMIN

## 5.1 Dashboard Admin
- [ ] Vue d'ensemble système
- [ ] Stats en temps réel
- [ ] Alertes importantes
- [ ] Activité récente

## 5.2 Gestion Utilisateurs
- [ ] Liste tous utilisateurs
- [ ] Rechercher utilisateur
- [ ] Filtrer par rôle
- [ ] Détail utilisateur
- [ ] Suspendre utilisateur
- [ ] Supprimer utilisateur
- [ ] Historique actions

## 5.3 Gestion Pharmacies
- [ ] Liste pharmacies
- [ ] Valider nouvelle pharmacie
- [ ] Approuver/refuser agrément
- [ ] Suspendre pharmacie
- [ ] Statistiques pharmacie

## 5.4 Gestion Livreurs
- [ ] Liste livreurs
- [ ] Valider inscription livreur
- [ ] Vérifier véhicule/immatriculation
- [ ] Suspendre livreur
- [ ] Performance livreurs

## 5.5 Gestion Commandes
- [ ] Liste toutes commandes
- [ ] Filtrer par statut
- [ ] Détail commande
- [ ] Annuler commande (admin)
- [ ] Remboursement

## 5.6 Plaintes & Support
- [ ] Liste plaintes
- [ ] Détail plainte
- [ ] Assigner plainte
- [ ] Résoudre plainte
- [ ] Statistiques plaintes

## 5.7 Analytics & Rapports
- [ ] Graphiques revenus
- [ ] Croissance utilisateurs
- [ ] Commandes par région
- [ ] Pharmacies populaires
- [ ] Livreurs actifs
- [ ] Export rapports (PDF/Excel)

## 5.8 Paramètres Système
- [ ] Configurer frais livraison
- [ ] Configurer commission
- [ ] Gérer zones de livraison
- [ ] Paramètres notifications globales

---

# 📌 LISTE 6: FONCTIONNALITÉS TEMPS RÉEL

## 6.1 WebSocket
- [ ] Connexion WebSocket stable
- [ ] Reconnexion automatique
- [ ] Gestion hors ligne
- [ ] Events: nouvelle_commande
- [ ] Events: statut_commande
- [ ] Events: position_livreur
- [ ] Events: notification

## 6.2 Géolocalisation
- [ ] Tracking position livreur
- [ ] Calcul distance pharmacy→client
- [ ] Mise à jour position en temps réel
- [ ] Affichage sur carte admin
- [ ] Estimation temps réel

---

# 📌 LISTE 7: TESTS & QUALITÉ

## 7.1 Tests Backend
- [ ] Tests unitaires (Jest)
- [ ] Tests d'intégration API
- [ ] Tests authentification
- [ ] Tests commandes
- [ ] Couverture de code > 70%

## 7.2 Tests Mobile
- [ ] Tests fonctionnels
- [ ] Tests UI/UX
- [ ] Tests de performance
- [ ] Tests sur différents appareils

## 7.3 Sécurité
- [ ] Audit sécurité
- [ ] Protection XSS
- [ ] Protection CSRF
- [ ] Rate limiting
- [ ] Validation données
- [ ] Chiffrement données sensibles

## 7.4 Performance
- [ ] Optimisation requêtes DB
- [ ] Mise en cache
- [ ] Lazy loading images
- [ ] Compression responses

---

# 📌 LISTE 8: DÉPLOIEMENT & PRODUCTION

## 8.1 Backend Production
- [ ] Build optimisé production
- [ ] Configuration production (Node env)
- [ ] SSL/HTTPS
- [ ] Domaine personnalisé
- [ ] Monitoring (Sentry/New Relic)
- [ ] Logs structurés

## 8.2 Mobile - Android
- [ ] Build APK debug
- [ ] Build APK release
- [ ] Signature APK
- [ ] Test sur appareils réels
- [ ] Soumission Play Store
- [ ] Description Play Store
- [ ] Screenshots Play Store

## 8.3 Mobile - iOS
- [ ] Build iOS (mac requis)
- [ ] Certificate provisioning
- [ ] Test sur simulateur
- [ ] Test sur appareils réels
- [ ] Soumission App Store
- [ ] Description App Store
- [ ] Screenshots App Store

## 8.4 Documentation
- [ ] Documentation API (Swagger)
- [ ] Guide utilisateur
- [ ] Guide pharmacien
- [ ] Guide livreur
- [ ] CGU
- [ ] Politique de confidentialité

---

# 📌 LISTE 9: OPTIONNELLES (V2)

- [ ] Chat en temps réel client-livreur
- [ ] Chat pharmacien-client
- [ ] Programme de fidélité
- [ ] Codes promo
- [ ] Abonnement livraison
- [ ] Multi-villes
- [ ] Langue anglaise
- [ ] Mode hors ligne (mobile)
- [ ] Widget Android
- [ ] Intégration assurances
- [ ] Carnet santé utilisateur

---

# 📌 LISTE 10: TERMINÉ ✅

## Infrastructure
- [x] Projet initialisé Node.js/Express
- [x] Configuration TypeScript
- [x] Schema Prisma créé
- [x] Base de données MySQL configurée
- [x] Backend déployé sur Render.com

## Backend - Auth
- [x] Inscription client
- [x] Inscription livreur
- [x] Inscription admin
- [x] Inscription pharmacie
- [x] Connexion utilisateurs
- [x] JWT Token

## Backend - API
- [x] API utilisateurs
- [x] API pharmacies
- [x] API médicaments
- [x] API catalogue
- [x] API commandes
- [x] API livraisons
- [x] API paiements
- [x] API ordonnances
- [x] API notifications
- [x] API statistiques
- [x] API relations utilisateurs
- [x] WebSocket configuré

## Mobile
- [x] App Expo/React Native initialisée
- [x] Navigation Expo Router
- [x] Écrans authentification
- [x] Interface client complète
- [x] Interface pharmacien complète
- [x] Interface livreur complète
- [x] Interface admin complète
- [x] Thème et styles
- [x] Gestion state (Zustand)
- [x] Mock data

---

# 🗓️ CALENDRIER RECOMMANDÉ

## Semaine 1: Infrastructure & Core
| Jour | Tâche |
|------|-------|
| Lun | Configuration DB, Variables env |
| Mar | Tests connexion API |
| Mer | Optimisation requêtes |
| Jeu | Déploiement production |
| Ven | Monitoring & alerts |

## Semaine 2: Authentification
| Jour | Tâche |
|------|-------|
| Lun | Vérif email |
| Mar | Vérif SMS |
| Mer | 2FA |
| Jeu | Tokens refresh |
| Ven | Tests sécurité |

## Semaine 3: Commandes & Livraisons
| Jour | Tâche |
|------|-------|
| Lun | Workflow commandes |
| Mar | Statuts commandes |
| Mer | Livraisons |
| Jeu | Géolocalisation |
| Ven | WebSocket temps réel |

## Semaine 4: Paiements
| Jour | Tâche |
|------|-------|
| Lun | Stripe intégration |
| Mar | Paiement livraison |
| Mer | Reçus |
| Jeu | Remboursements |
| Ven | Tests |

## Semaine 5-6: Mobile Final
| Jour | Tâche |
|------|-------|
| Lun | Tests client |
| Mar | Tests pharmacien |
| Mer | Tests livreur |
| Jeu | Tests admin |
| Ven | UI refinements |

## Semaine 7: Tests & Bugs
| Jour | Tâche |
|------|-------|
| Lun | Tests unitaires |
| Mar | Tests intégration |
| Mer | Tests sécurité |
| Jeu | Bug fixes |
| Ven | Performance |

## Semaine 8: Production
| Jour | Tâche |
|------|-------|
| Lun | Build APK |
| Mar | Play Store |
| Mer | Build iOS |
| Jeu | App Store |
| Ven | Launch! 🚀 |

---

# 📊 ESTIMATION TÂCHES

| Catégorie | Tâches | Jours estimés |
|-----------|--------|---------------|
| Infrastructure | 7 | 1 |
| Auth & Sécurité | 10 | 3 |
| Utilisateurs | 9 | 2 |
| Pharmacies | 10 | 2 |
| Médicaments | 10 | 2 |
| Catalogue | 7 | 1 |
| Commandes | 10 | 3 |
| Livraisons | 10 | 3 |
| Paiements | 8 | 2 |
| Ordonnances | 7 | 2 |
| Notifications | 8 | 1 |
| Stats | 7 | 2 |
| Mobile Client | 30 | 5 |
| Mobile Pharmacien | 25 | 4 |
| Mobile Livreur | 20 | 3 |
| Mobile Admin | 25 | 4 |
| Temps Réel | 6 | 2 |
| Tests | 15 | 3 |
| Déploiement | 12 | 2 |
| **TOTAL** | **~250** | **~43 jours** |

---

*Document généré pour Trello - GarapExpress Project Management*
