# Phase 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers package
COPY package*.json ./

# Installer les dépendances de développement (inclut ts-node)
RUN npm install

# Copier le code source
COPY . .

# Phase 2: Production
FROM node:18-alpine

WORKDIR /app

# Copier seulement les dépendances de production
COPY package*.json ./
RUN npm install --omit=dev

# Copier les fichiers compilés depuis le builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

# Exposer le port
EXPOSE 3000

# Lancer l'application
CMD ["node", "dist/index.js"]