# Prompt pour Figma Make - Application GarapExpress

Copiez ce prompt ci-dessous et collez-le dans Figma Make (figma.com/ai/create) pour générer les maquettes de votre application mobile.

---

## 🚀 PROMPT FIGMA MAKE

```
Tu dois concevoir une application mobile de livraison de médicaments appelée "GarapExpress" pour le marché Sénégalais. C'est une application multi-rôles avec 4 interfaces différentes (Client, Pharmacie, Livreur, Administrateur).

## IDENTITÉ DE MARQUE
- Nom: GarapExpress (Logo: Croix verte + nom)
- Couleur primaire: Vert médical (#22c55e) - pour tous les CTA et éléments importants
- Couleur secondaire: Blanc (#ffffff) - fond cartes et composants
- Accent: Bleu clair (#0ea5e9) - pour les états "en cours" et liens
- Couleur warning: Orange (#f59e0b) - pour les alertes
- Couleur danger: Rouge (#ef4444) - pour les actions destructrices
- Texte principal: Gris foncé (#1f2937)
- Texte secondaire: Gris (#6b7280)
- Fond page: Gris très clair (#f3f4f6)
- Style: Moderne, épuré, médical, sécurisé, inspirant confiance
- Police: Inter ou Poppins, bien espacée
- Ombres légères pour donner de la profondeur

## ÉCRAN 1: CLIENT (Application principale)

### Écran 1.1 - Onboarding (3 slides)
- **Slide 1**: Logo GarapExpress 2xs haut (50px) + Illustration pharmacie moderne (200px) + Titre "Vos médicaments livrés rapidement" + Sous-titre "Livraison 24h/24 chez vous" + Bouton "Suivant" vert pleine largeur + Points de pagination (3 petits cercles, 1er rempli)
- **Slide 2**: Logo + Illustration livreur scooter + Titre "Livraison rapide et fiable" + Sous-texte "Pharmacies de garde disponibles" + Bouton "Suivant" + Points de pagination (2e rempli)
- **Slide 3**: Logo + Illustration clients satisfaits + Titre "Service confidentiel et sécurisé" + Sous-texte "Ordonnances confidentielles" + Bouton "Commencer" + Points (3e rempli)
- Bouton "Passer" petit texte gris en bas à gauche sur chaque slide
- Padding: 24px horizontal, spacing cohérent

### Écran 1.2 - Sélection de rôle
- Titre: "Qui êtes-vous?"
- 4 cartes avec icônes:
  - Client (icône personne)
  - Pharmacien (icône pharmacie)
  - Livreur (icône scooter)
  - Administrateur (icône dashboard)
- Couleur: fond blanc, bordures grises

### Écran 1.3 - Login
- Logo en haut
- Titre: "Connexion"
- Champ Email avec icône enveloppe
- Champ Mot de passe avec icône œil
- Bouton "Se connecter" vert
- Lien "Mot de passe oublié?"
- Bouton "Créer un compte" en texte

### Écran 1.4 - Inscription Client
- Titre: "Créer un compte"
- Champs: Nom, Prénom, Téléphone, Email, Adresse, Mot de passe
- Bouton "S'inscrire" vert

### Écran 1.5 - Accueil Client (Onglets)
- En-tête: Titre "Trouver un médicament" + Barre de recherche avec icône loupe et placeholder "Rechercher..." + Icône panier avec badge rouge (nombre articles) en haut droit
- Filtres horizontaux: "Toutes" (actif, vert) | "Garde" | "Proches" 
- Liste scrollable des pharmacies en cartes (120x140px):
  - Image pharmacie (carré 120x80px, corner radius 8px)
  - Nom pharmacie (bold, 14px)
  - Adresse (gris, 12px, 1 ligne max)
  - Badge vert "Pharmacie de garde" si ouvert ou badge gris "Fermée" 
  - Distance "2,3 km" + icône localisation
  - Tap va à Écran 1.6
- Spacing 16px entre cartes
- Padding: 16px

### Écran 1.6 - Détail Pharmacie
- En-tête: Image pharmacie (full width, 180px hauteur, no radius en haut) + Bouton retour blanc en top-left (32px)
- Info pharmacie: Nom (18px bold) + Adresse (14px gris) + Horaires "Ouvert jusqu'à 23h" (badge vert)
- Rating: 4.5/5 étoiles + "(320 avis)" lien
- Section "Catalogue des médicaments":
- Barre de recherche dans la pharmacie
- Liste médicaments (cartes horizontales, full-width):
  - Nom médicament (bold, 14px)
  - Dosage optionnel (gris, 12px)
  - Prix en gros vert (18px bold)
  - Disponibilité: Badge vert "En stock" ou badge rouge "Rupture"
  - Bouton "+" bleu petit (ajouter au panier)
- Padding: 16px
- Bottom padding 80px (space pour navigation)

### Écran 1.7 - Panier
- En-tête: Titre "Panier" (bold 18px) + Bouton retour
- Si panier vide: Illustration panier, "Panier vide", bouton "Continuer vos achats"
- Si panier rempli:
  - Cartes articles (chaque line):
    - Pharmacie source (gris 12px)
    - Nom médicament (14px bold)
    - Dosage optionnel
    - Prix unitaire bleu (12px)
    - Contrôle quantité: bouton "-" | nombre encadré | bouton "+" (couleur accent)
    - Prix total ligne (bold)
    - Icône suppression (corbeille rouge, 16px)
  - Divider
- **Bottom card** (sticky en bas):
  - "Sous-total: 15 000 FCFA" (gris)
  - "Frais de livraison: 2 000 FCFA" (gris)
  - Divider
  - "TOTAL: 17 000 FCFA" (bold 16px, couleur primaire)
  - Bouton "Passer la commande" vert pleine largeur
- Padding: 16px
- Spacing: 12px entre articles

### Écran 1.8 - Checkout/Commande
- Titre "Valider la commande" (18px bold)
- **Étape 1 - Récapitulatif**:
  - Card blanche: List des items (nommédicament, quantité x, prix unitaire) truncated
  - Sous-total, Frais, TOTAL en gros vert
  - Icône chevron pour "voir détails panier"
  
- **Étape 2 - Adresse de livraison**:
  - Label "Adresse de livraison"
  - Card avec adresse actuelle (icône localisation)
  - Bouton "Modifier" (texte bleu)
  - Option "Sauvegarder pour après" (checkbox)

- **Étape 3 - Mode de paiement**:
  - Titre "Mode de paiement"
  - Option 1: "Carte bancaire" (icon + radio button) - default selected
    - Champs: Numéro carte, Expiration (MM/YY), CVV
  - Option 2: "Espèces à la livraison" (icon + radio button)
  
- **Étape 4 - Ordonnance (Optionnel)**:
  - Label: "Joindre une ordonnance (optionnel)"
  - Bouton "Télécharger une photo" ou "Prendre une photo"
  
- Bottom (sticky):
  - Affichage: "Total: 17 000 FCFA"
  - Bouton "Confirmer la commande" vert, pleine largeur
  - Bouton "Annuler" texte gris en dessous

- Padding: 16px, Spacing: 16px entre sections

### Écran 1.9 - Suivi Commande
- **Récap commande** (en haut):
  - N° commande: "#CMD-2024-001234" (gris, 12px)
  - Pharmacie source: "Pharmacie du Centre" (14px bold)
  - Montant: "17 000 FCFA" (16px bold, vert)
  - Date: "Aujourd'hui, 14:30" (gris, 12px)

- **Timeline verticale** (centre):
  - Point 1: Cercle vert rempli (✓) + "Commande confirmée" (bold 14px) + "14:32" (gris)
  - Ligne vert connectant
  - Point 2: Cercle orange rempli (∙) + "En préparation" (bold 14px) + "en cours" (badge orange)
  - Ligne orange/gris connectant
  - Point 3: Cercle gris (○) + "En livraison" (14px) + "Livreur assigné bientôt"
  - Ligne gris pointillée
  - Point 4: Cercle gris (○) + "Livré" (14px)

- **Carte Livreur** (si assigné):
  - Photo profil rond (60px)
  - Nom: "Mamadou Diallo" (bold 14px)
  - Rating: 4.8/5 + (142 avis)
  - Bouton "Appeler" (icon phone)
  - Bouton "Localiser en direct" (icon map) - ouvre map

- **Statut en bas** (sticky):
  - Bouton "Localiser la pharmacie" bleu
  - Bouton "Support" texte gris

- Padding: 16px
- Fond gris clair (#f3f4f6)

### Écran 1.10 - Mes Commandes
- Liste des commandes avec:
  - N° commande
  - Pharmacie
  - Date
  - Montant
  - Statut (badge couleur)
- Filtres: Toutes, En cours, Terminées

### Écran 1.11 - Profil Client
- Photo de profil + Nom
- Menu:
  - Mes informations
  - Mes adresses
  - Mes ordonnances
  - Notifications
  - Aide & Support
  - Déconnexion

---

## ÉCRAN 2: PHARMACIE

### Écran 2.1 - Login Pharmacie
- Logo GarapExpress
- Titre: "Espace Pharmacie"
- Champ Email
- Champ Mot de passe
- Bouton "Connexion"

### Écran 2.2 - Dashboard Pharmacie
- En-tête: Nom pharmacie (18px bold) + Toggle "Ouverte/Fermée" (switch vert quand ouvert)
- **Section Statistiques** (3 cartes horizontales swipeable):
  - Carte 1: "📋 Commandes aujourd'hui" + Nombre en grand (32px bold vert) + "2 de plus que hier"
  - Carte 2: "💰 Revenus" + "450 000 FCFA" (32px bold bleu) + "Dernière 24h"
  - Carte 3: "⏳ En attente" + "3 commandes" (rouge/orange) + Bouton "Voir"
- **Commandes Récentes** (section scrollable):
  - Chaque ligne:
    - Avatar client rond (32px)
    - Nom client (14px bold) + numéro commande (gris, 12px)
    - Montant command (16px bold vert)
    - Créneaux + badges: "5 min" (gris)
    - Boutons: "Accepter" (vert) | "Refuser" (gris)
- Padding: 16px
- Bottom padding 80px (espace nav)

### Écran 2.3 - Gestion Commandes
- Onglets: En attente / En préparation / Prêtes / Livrées
- Liste commandes avec:
  - Client + téléphone
  - Liste médicaments
  - Montant
  - Bouton d'action selon onglet

### Écran 2.4 - Préparation Commande
- Détail commande complet
- Liste médicaments à préparer
- Case à cocher par item
- Bouton "Marquer comme prêt"

### Écran 2.5 - Catalogue Médicaments
- Liste avec:
  - Nom médicament
  - Prix
  - Stock (afficher alerte si < 10)
  - Disponibilité (toggle)
- Bouton "Ajouter un médicament"

### Écran 2.6 - Inventaire
- Tableau: Médicament | Catégorie | Stock | Prix | Actions
- Filtre par catégorie
- Alertes stock faible en rouge
- Bouton exporter

### Écran 2.7 - Profil Pharmacie
- Informations pharmacy
- Horaires d'ouverture (éditables)
- Toggle "Pharmacie de garde"
- Statistiques du mois
- Déconnexion

---

## ÉCRAN 3: LIVREUR

### Écran 3.1 - Login Livreur
- Logo + Titre "Espace Livreur"
- Email + Mot de passe
- Bouton connexion

### Écran 3.2 - Dashboard Livreur
- **En-tête**: Toggle large "En ligne / Hors ligne" (switch vert quand EN ligne)
- **Si Course en cours**:
  - Card: "Course actuelle" avec Pharmacie → Client
  - Bouton "Voir ma course" (vert)
- **Si Pas de course**: 
  - Illustration + "Aucune course en cours"
  - Bouton "Voir les courses disponibles"
  
- **Section revenus**:
  - "💰 Revenus aujourd'hui: 25 000 FCFA" (20px bold vert)
  - "📊 Courses effectuées: 5" (14px gris)
  - Bouton "Détails" (texte bleu)

- **Section Courses disponibles**:
  - Bouton "🔄 Actualiser" (16px)
  - Liste cartes des courses (swipeable):
    - "Distance: 2.5 km" (badge bleu)
    - "Pharmacie → Client" (localisation)
    - "Gains: 5 000 FCFA" (16px bold vert)
    - Bouton "Accepter" (vert large)
- Padding: 16px

### Écran 3.3 - Courses Disponibles
- Liste des livraisons disponibles:
  - Distance
  - Gains
  - Pharmacie → Client
  - Bouton "Accepter"

### Écran 3.4 - Ma Course (En cours)
- **En-tête**: "Livraison en cours" + Timer "Est. 12 min" (2px countdown)
- **Carte 1 - Détails livraison**:
  - "Patient: Mamadou Diallo" (14px bold)
  - N° téléphone cliquable (bleu)
  - "Adresse: Rue Lamine Guèye, Dakar"
  - Montant: "5 000 FCFA"
  
- **Carte 2 - Étapes**:
  - ✅ "Phase 1: Récupérer à la pharmacie"
  - ↓ Ligne
  - ⚪ "Phase 2: Livrer au client" (avec adresse)

- **Carte 3 - Actions** (2 boutons larges):
  - "📍 Naviguer vers Pharmacie" (bleu)
  - "✅ J'ai récupéré" (vert) - si en phase 1
  - PUIS après: "📍 Naviguer vers Client" (bleu)
  - "✅ Confirmer livraison" (vert) - si en phase 2

- **Carte 4 - Mini-map**:
  - Map avec trajet Pharmacie → Client
  - Icônes positions
  - "Zoom sur la map"

- **Time tracking** (bottom):
  - "Départ pharmacie: 14:32"
  - "Arrivée estimée: 14:44"
  - "Temps total: 12 min"

- Padding: 16px, Spacing: 12px

### Écran 3.5 - Historique
- Liste des livraisons passées
- Filtre par date
- Détails: client, pharma, montant, note

### Écran 3.6 - Gains & Revenus
- Graphique revenus par semaine/mois
- Liste des courses avec gains
- Total cumulé
- Bouton "Retirer"

### Écran 3.7 - Profil Livreur
- Photo + Nom + Note (étoiles)
- Véhicule + immatriculation
- Toggle disponibilité
- Historique évaluations

---

## ÉCRAN 4: ADMINISTRATEUR

### Écran 4.1 - Dashboard Admin
- **En-tête**: Titre "Dashboard" (18px bold) + Date du jour

- **Section Cartes Statistiques** (grid 2x2, cartes 180px):
  - Carte 1: "👥 Total Utilisateurs" (gris) + "1 234" (24px bold vert)
  - Carte 2: "🏥 Total Pharmacies" (gris) + "45" (24px bold bleu)
  - Carte 3: "🚚 Total Livreurs" (gris) + "128" (24px bold orange)
  - Carte 4: "📦 Commandes J-1" (gris) + "567" (24px bold accent)

- **Graphique 1 - Revenus** (2/3 largeur):
  - Charttitle: "Revenus par jour (7 derniers jours)"
  - Line chart (vert gradient) avec points
  - Axe Y: Montants (FCFA)
  - Axe X: Jours (Lun-Dim)
  - Max 10M, Min 0

- **Graphique 2 - Commandes par statut** (1/3 largeur):
  - Chart title: "Distribution commandes"
  - Pie/Donut chart:
    - Vert "Livrées": 60%
    - Orange "En cours": 25%
    - Gris "Annulées": 15%
  - Légende sous chart

- **Activité Récente** (scrollable):
  - Titre "Activité dernière heure"
  - Timeline:
    - "14:35 - Nouvelle commande #1234" + icône package
    - "14:28 - Nouveau livreur inscrit" + icône user
    - "14:15 - Paiement reçu" + icône money (vert)
  - Chaque line: timestamp (gris) + texte (14px) + icône (16px)

- Padding: 16px
- Spacing: 16px entre sections

### Écran 4.2 - Gestion Utilisateurs
- Barre de recherche
- Tableau: Nom | Email | Rôle | Statut | Actions
- Filtre par rôle: Tous / Clients / Pharmacies / Livreurs
- Actions: Voir / Suspendre / Supprimer

### Écran 4.3 - Gestion Pharmacies
- Liste pharmacies avec:
  - Nom, adresse, téléphone
  - Statut (active/suspendue)
  - N° agrément
- Bouton valider nouvelle pharmacy

### Écran 4.4 - Gestion Livreurs
- Liste livreurs
- Véhicule + immatriculation
- Note moyenne
- Disponibilité

### Écran 4.5 - Toutes les Commandes
- Tableau: ID | Client | Pharma | Date | Montant | Statut
- Filtre par statut
- Recherche par ID
- Détail au clic

### Écran 4.6 - Plaintes
- Liste plaintes avec:
  - Type (commande/livraison/payment)
  - Priorité (haute/moyenne/basse)
  - Statut
- Détail plainte
- Bouton résoudre

### Écran 4.7 - Analytics
- Revenus par période (graphique)
- Croissance utilisateurs (graphique)
- Top pharmacies
- Top livreurs
- Export PDF/Excel

### Écran 4.8 - Paramètres
- Configuration frais livraison
- Zones de livraison
- Notifications globales
- Logo et branding

---

## STYLE GÉNÉRAL

### Couleurs à utiliser:
- Primaire: #22c55e (Vert médical)
- Secondaire: #ffffff (Blanc)
- Accent: #0ea5e9 (Bleu)
- Texte principal: #1f2937 (Gris foncé)
- Texte secondaire: #6b7280 (Gris)
- Danger: #ef4444 (Rouge)
- Warning: #f59e0b (Orange)
- Success: #22c55e (Vert)
- Fond: #f3f4f6 (Gris clair)

### Typographie:
- Titres: Bold, 20-24px
- Sous-titres: Semi-bold, 16-18px
- Corps: Regular, 14px
- Légendes: Regular, 12px

### Composants:
- Boutons primaires: Fond vert, coins arrondis 8px
- Inputs: Bordure grise, focus vert
- Cards: Ombre légère, fond blanc, coins 12px
- Badges: Petits rectangles avec couleur selon statut

### Navigation:
- Tabs en bas pour client (Accueil, Panier, Commandes, Profil)
- Menu hamburger pour pharmacy/livreur/admin
- Flèche retour en haut à gauche
```

---

## 📝 Instructions pour Figma Make :

1. Ouvrez [figma.com/ai/create](https://figma.com/ai/create)
2. Collez le prompt ci-dessus dans le champ de description
3. Cliquez sur "Generate" ou "Créer"
4. Attendez que l'IA génère les designs
5. Examinez les résultats et affinez si nécessaire

---

## 💡 Pour de meilleurs résultats :

- Vous pouvez diviser le prompt en plusieurs parties (un prompt par rôle)
- Commencez par le rôle "Client" qui est le plus complexe
- Après génération, vous pouvez affiner certains écrans spécifiques

## Exemple de prompt court pour commencer :

```
Crée une application mobile de livraison de médicaments appelée GarapExpress au Sénégal. 
Design moderne avec couleur verte médicale (#22c55e). 
L'app a 4 interfaces: client (recherche pharma, panier, commandes), 
pharmacie (dashboard, gestion commandes, catalogue), 
livreur (courses, map, gains), admin (stats, gestion users).
Écrans: login, home, detail pharma, panier, checkout, suivi commande, profile.
UI: Material Design, cartes, badges de statut, navigation par icônes en bas.