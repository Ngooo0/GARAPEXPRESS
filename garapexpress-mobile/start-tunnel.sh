#!/bin/bash
cd /home/ngone-gueye/SOUTENANCE/garapexpress-mobile

# Démarrer Metro bundler en arrière-plan sur le port 8082
npx expo start --port 8082 &
METRO_PID=$!

# Attendre que Metro soit prêt
sleep 10

# Créer le tunnel avec localtunnel
lt --port 8082 --subdomain garapexpress-app