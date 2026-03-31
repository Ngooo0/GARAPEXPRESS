# 🚀 Guide de Déploiement GARAPEXPRESS sur Render

## 📋 Architecture du déploiement

```
┌─────────────────────┐
│   Mobile App        │
│  (Expo / EAS Build) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Backend API        │
│  (Render.com)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   MySQL Database    │
│  (Render Blueprint) │
└─────────────────────┘
```

---

## ✅ **ÉTAPE 1: Préparer le Repository**

### 1.1 Vérifier que tout est commité

```bash
cd /home/ngone-gueye/SOUTENANCE
git status
git log --oneline | head -5
```

✅ Statut: Les fichiers sont déjà pushés!

---

## ✅ **ÉTAPE 2: Créer un compte Render**

1. Aller à **https://render.com**
2. **Sign up** avec GitHub (important!)
3. Connecter votre compte GitHub
4. Autoriser Render à accéder à vos repositories

---

## ✅ **ÉTAPE 3: Déployer le Backend sur Render**

### Option A: Via render.yaml (RECOMMANDÉ) ⭐

1. **Dans Render Dashboard**
   - Cliquez sur **"New +"**
   - Sélectionnez **"Blueprint"**
   - Connectez votre repo **GARAPEXPRESS**
   - Cherchez le fichier **`garapexpressBack/render.yaml`**
   - Cliquez sur **"Deploy"**

2. **Render créera automatiquement:**
   - ✅ Web Service (Backend Node.js)
   - ✅ MySQL Database
   - ✅ Environment Variables

### Option B: Déploiement manuel

Si l'option A ne fonctionne pas:

1. **Créer le Web Service:**
   - New → Web Service
   - Sélectionnez `https://github.com/Ngooo0/GARAPEXPRESS`
   - Branch: `master`
   - Build Command: `bash render-build.sh`
   - Start Command: `npm run serve`
   - Instance Type: **Free** (0.5 CPU, 0.5 GB RAM)

2. **Créer la Database:**
   - New → Database
   - Sélectionnez **MySQL**
   - Name: `garapexpress-db`
   - Plan: **Free**
   - Region: **Oregon** (ou proche de vous)

---

## 📝 **ÉTAPE 4: Configurer les Variables d'Environnement**

Dans le dashboard Render de votre Web Service, allez à **Environment**:

### Variables automatiques (Render les remplit):
- `DATABASE_URL` ← Auto-link vers la database

### Variables à ajouter manuellement:

| Variable | Valeur | Notes |
|----------|--------|-------|
| `NODE_ENV` | `production` | Important pour Express |
| `TWILIO_SID` | `AC3139dc0...` | De votre compte Twilio |
| `TWILIO_AUTH_TOKEN` | `9a4bdae6...` | De votre compte Twilio |
| `TWILIO_FROM` | `+15405154802` | Votre numéro Twilio |
| `SMTP_HOST` | `smtp.gmail.com` | Serveur SMTP Google |
| `SMTP_PORT` | `587` | Port TLS |
| `SMTP_USER` | `votre-email@gmail.com` | Email Gmail |
| `SMTP_PASS` | `votre-app-password` | App Password Gmail |
| `FRONTEND_URL` | `https://garapexpress.com` | URL de votre app mobile |

**⚠️ IMPORTANT - Obtenir les App Passwords Gmail:**

1. Allez à **https://myaccount.google.com/apppasswords**
2. Sélectionnez **Mail** et **Windows/Linux/Mac**
3. Générez un password
4. Utilisez-le dans `SMTP_PASS`

---

## ✅ **ÉTAPE 5: Tester le Backend**

Une fois le déploiement terminé (vert ✅):

```bash
# Récupérez l'URL depuis le dashboard Render
# Format: https://garapexpress-api.onrender.com

curl https://garapexpress-api.onrender.com/health
```

Réponse attendue:
```json
{
  "status": "OK",
  "message": "GarapExpress API is running"
}
```

---

## 🚀 **ÉTAPE 6: Configurer l'App Mobile**

### 6.1 Mettre à jour app.json

```bash
cd /home/ngone-gueye/SOUTENANCE/garapexpress-mobile
```

Éditer [app.json](../garapexpress-mobile/app.json):

```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_API_URL": "https://garapexpress-api.onrender.com"
    }
  }
}
```

### 6.2 Build EAS pour Expo

```bash
# Installation (une seule fois)
npm install -g eas-cli

# Login
eas login

# Paramétrer le projet
cd /home/ngone-gueye/SOUTENANCE/garapexpress-mobile
eas build:configure

# Builder pour Android
eas build --platform android --profile preview

# Builder pour iOS
eas build --platform ios --profile preview
```

---

## 📱 **ÉTAPE 7: Tester le Déploiement Complet**

### Test Backend:
```bash
curl -X GET https://garapexpress-api.onrender.com/health
```

### Test Database:
```bash
# Dans l'app mobile, tentez un login
# ou un appel API quelconque
```

### Logs du Backend (Render):
- Dashboard → garapexpress-api → **Logs**
- Idéal pour déboguer les erreurs

---

## 🔒 **ÉTAPE 8: Points de Sécurité Important**

### Ne JAMAIS commit:
- ❌ `.env` (fichiers de secrets)
- ❌ Credentials Twilio en dur
- ❌ FTP passwords

### À la place:
- ✅ Utiliser Render's Environment Variables
- ✅ Utiliser `.env.example` comme template
- ✅ Ajouter `.env` à `.gitignore` (déjà fait)

### Vérifier .gitignore:

```bash
cd /home/ngone-gueye/SOUTENANCE/garapexpressBack
cat .gitignore | grep -E "\.env|node_modules|dist"
```

---

## 🐛 **Troubleshooting**

### Erreur 134 (Out of Memory):
```
Solution: Le plan Free a limité les ressources
→ Upgrader le plan Render (de payant)
→ Ou optimiser le code backend
```

### Database Connection Error:
```
Solution: 
1. Vérifier que la database est créée
2. Vérifier DATABASE_URL dans Environment
3. Vérifier les migrations: npm run prisma:migrate:deploy
```

### CORS Error depuis l'app mobile:
```
Solution:
1. Vérifier FRONTEND_URL dans l'app mobile
2. Vérifier CORS headers dans src/index.ts
3. Re-test avec l'URL exacte de Render
```

### Prisma Migration Failed:
```bash
# Se connecter à la database Render
# Vue les migrations:
npx prisma migrate status

# Ou push manuellement:
npx prisma migrate deploy
```

---

## 📊 **URLs de Référence**

| Service | URL |
|---------|-----|
| Render Dashboard | https://dashboard.render.com |
| GitHub Repo | https://github.com/Ngooo0/GARAPEXPRESS |
| API (prod) | https://garapexpress-api.onrender.com |
| Health Check | https://garapexpress-api.onrender.com/health |

---

## ✅ **Checklist Final**

- [ ] Repository pushé sur GitHub
- [ ] Render.yaml créé et commité
- [ ] Compte Render créé (connecté GitHub)
- [ ] Blueprint déployé (ou service + database manuel)
- [ ] Environment variables configurées
- [ ] App mobile testé avec la nouvelle URL API
- [ ] Logs du backend vérifiés (pas d'erreurs)
- [ ] CORS fonctionne (app mobile peut accéder l'API)
- [ ] Database migrations appliquées
- [ ] Health endpoint répond ✅

---

## 🎉 Déploiement réussi!

Votre app GARAPEXPRESS est maintenant en production! 🚀
