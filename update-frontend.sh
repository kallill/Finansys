#!/bin/bash
set -e

echo "Extracting frontend..."
tar -xzf frontend-update.tar.gz

echo "Building frontend..."
cd frontend
npm install
npm run build

echo "Updating backend static files..."
# Ensure destination exists
mkdir -p ../backend/frontend/dist
# Copy new build to backend static folder
cp -r dist/* ../backend/frontend/dist/

echo "Restarting application..."
pm2 restart finansys

echo "Frontend updated successfully!"
