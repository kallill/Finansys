#!/bin/bash
echo "Checking PM2 Status..."
pm2 list

echo "Checking Port 3000..."
sudo ss -tuln | grep :3000

echo "Checking Backend Logs (Tail)..."
pm2 logs finansys --lines 20 --nostream
