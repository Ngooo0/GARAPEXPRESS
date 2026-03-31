#!/bin/bash

# Script pour mettre à jour l'URL de l'API dans app.json

echo "🔧 Configuration de l'URL API pour Render Deployment"
echo ""
echo "URL Render actuelle: https://garapexpress-api.onrender.com"
echo ""
read -p "Entrez l'URL complète du backend Render (ou tapez 'enter' pour l'URL par défaut): " API_URL

if [ -z "$API_URL" ]; then
    API_URL="https://garapexpress-api.onrender.com"
fi

echo "✏️ Mise à jour de app.json avec l'URL: $API_URL"

# Mettre à jour app.json
cd "$(dirname "$0")/garapexpress-mobile"

# Utiliser jq pour mettre à jour JSON
npm install -g jq

jq ".expo.extra.EXPO_PUBLIC_API_URL = \"$API_URL\"" app.json > app.json.tmp && mv app.json.tmp app.json

echo "✅ app.json mis à jour!"
echo ""
cat app.json | grep -A 2 "EXPO_PUBLIC_API_URL"
