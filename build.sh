#!/bin/bash
set -e

echo "=== LiviPro Production Build ==="

echo ">> Building Admin Backoffice..."
PORT=1 BASE_PATH=/ pnpm --filter @workspace/admin-backoffice run build

echo ">> Building Grossiste Backoffice..."
PORT=1 BASE_PATH=/grossiste/ pnpm --filter @workspace/grossiste-backoffice run build

echo ">> Building API Server..."
pnpm --filter @workspace/api-server run build

echo "=== Build complete ==="
