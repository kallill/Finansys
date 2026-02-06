#!/bin/bash
set -e

echo "Updating backend..."
cd backend
npm run build

echo "Restarting application..."
pm2 restart finansys

echo "Done!"
