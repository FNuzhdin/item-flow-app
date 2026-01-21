#!/bin/bash
set -e

echo "Installing frontend dependencies..."
cd frontend
npm ci

echo "Building frontend..."
npm run build

echo "Installing backend dependencies..."
cd ../backend
npm ci

echo "Building backend..."
npm run build

echo "Build complete!"