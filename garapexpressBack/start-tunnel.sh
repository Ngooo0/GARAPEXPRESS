#!/bin/bash

# Script pour démarrer le backend avec localtunnel
# Usage: ./start-backend-tunnel.sh

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "Démarrage du serveur backend..."
cd /home/ngone-gueye/SOUTENANCE/garapexpressBack

# Démarrer le serveur en arrière-plan
npm start &
BACKEND_PID=$!

echo "Attente du démarrage du backend (5s)..."
sleep 5

# Démarrer localtunnel
echo "Démarrage du tunnel local..."
npx lt --port 3000 --subdomain garapexpress-api 2>&1 &
TUNNEL_PID=$!

echo "=== Instructions pour Expo Go ==="
echo "1. Le backend tourne sur le port 3000"
echo "2. Le tunnel est en cours de création..."
echo "3. Après quelques secondes, vous verrez l'URL du tunnel"
echo "4. Mettez à jour garapexpress-mobile/.env.local avec cette URL"
echo ""
echo "Pour arrêter: kill $BACKEND_PID $TUNNEL_PID"

# Garder le script actif pour voir les logs
wait