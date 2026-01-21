#!/usr/bin/env bash
set -e

echo "=== Installing frontend dependencies ==="
cd frontend
npm ci --include=dev

echo "=== Building frontend ==="
npm run build

echo "=== Copying frontend to backend ==="
cd ..
mkdir -p backend/public
cp -r frontend/dist/* backend/public/

echo "=== Installing backend dependencies ==="
cd backend
npm ci  # Убрал --only=production, нужны dev-зависимости для сборки!

echo "=== Building backend ==="
npm run build  # ← ЭТО КРИТИЧНО! Компилирует TS в JS

echo "=== Build complete ==="