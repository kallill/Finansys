#!/bin/bash
cd backend
echo "Installing dependencies..."
npm install
echo "Building..."
npm run build
echo "Starting with PM2..."
pm2 delete finansys 2>/dev/null || true
pm2 start dist/server.js --name "finansys"
pm2 save
echo "Status:"
pm2 list
