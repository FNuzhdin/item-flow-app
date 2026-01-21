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
rm -rf node_modules  # ← Добавь это
npm install  # ← Измени на npm install (не npm ci)

echo "=== Building backend ==="
npm run build

echo "=== Build complete ==="