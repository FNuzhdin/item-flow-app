#!/usr/bin/env bash
set -e  # Остановиться при ошибке

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
npm install

echo "=== Building backend ==="
npm run build

echo "=== Build complete ==="