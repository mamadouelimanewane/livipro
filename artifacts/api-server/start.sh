#!/bin/bash
set -e

DIST="artifacts/api-server/dist/index.cjs"
GITHUB_RAW="https://raw.githubusercontent.com/mamadouelimanewane/livipro/main/$DIST"

echo "[start] Téléchargement du serveur depuis GitHub..."
if curl -fsSL "$GITHUB_RAW" -o "$DIST.new" 2>/dev/null; then
  mv "$DIST.new" "$DIST"
  echo "[start] dist/index.cjs mis à jour"
else
  echo "[start] Impossible de télécharger depuis GitHub, utilisation du fichier existant"
fi

echo "[start] Démarrage du serveur Node.js..."
exec node "$DIST"
